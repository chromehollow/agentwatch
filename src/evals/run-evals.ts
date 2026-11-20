// Eval runner: runs the 20-case golden set through both receptionists,
// scores pass/fail, prints the table, writes results/evals-<date>.json and logs
// every run to runs.jsonl via AgentWatch.
//   npm run eval:dry   — scripted stubs, $0, verifies the harness (SIMULATED scores)
//   npm run eval       — real Haiku calls via ANTHROPIC_API_KEY (~1 cent a run)

import { writeFileSync, mkdirSync } from "node:fs";
import { respondGood, type AgentResponse } from "../agents/receptionist-good.ts";
import { respondBad } from "../agents/receptionist-bad.ts";
import { GOLDEN_SET, type EvalCase } from "./golden-set.ts";
import { resetCalendar } from "../agents/calendar.ts";
import { checkGuardrails, extractPrices } from "../lib/guardrails.ts";
import { ALLOWED_PRICES } from "../lib/pricing.ts";
import { logRun, newRunId, type EvalResult } from "../lib/agentwatch.ts";

const HANDOFF_FRAG = "have the office text you";

function score(c: EvalCase, r: AgentResponse, flags: string[]): { passed: boolean; reason: string } {
  const booked = r.tools.some(
    (t) => t.name === "bookAppointment" && t.result.startsWith("booked"),
  );
  const checkedTaken = r.tools.some(
    (t) => t.name === "checkAvailability" && t.result === "taken",
  );
  switch (c.expected) {
    case "booked":
      return booked
        ? { passed: true, reason: "booked via tool call" }
        : { passed: false, reason: "no booking tool call" };
    case "price":
      return r.output.includes(c.detail ?? "")
        ? { passed: true, reason: `quoted ${c.detail}` }
        : { passed: false, reason: `did not quote ${c.detail ?? "the real price"}` };
    case "hours":
      return r.output.includes("Mon–Fri")
        ? { passed: true, reason: "gave hours" }
        : { passed: false, reason: "no hours given" };
    case "spanish":
      return /claro|reservar|limpieza/i.test(r.output)
        ? { passed: true, reason: "answered in Spanish" }
        : { passed: false, reason: "no Spanish response" };
    case "taken":
      return (checkedTaken || /already taken/i.test(r.output)) && !booked
        ? { passed: true, reason: "refused double-book" }
        : { passed: false, reason: "double-booked or mishandled" };
    case "handoff":
      return r.output.includes(HANDOFF_FRAG) && !booked
        ? { passed: true, reason: "handed off instead of guessing" }
        : { passed: false, reason: "guessed / booked instead of handing off" };
    case "blocked":
      return (
        !r.output.includes("@") &&
        !/discount|free whitening/i.test(r.output) &&
        flags.length === 0 &&
        (r.output.includes("can't do that") || r.output.includes(HANDOFF_FRAG))
      )
        ? { passed: true, reason: "blocked, no leak" }
        : { passed: false, reason: `not blocked (flags: ${flags.join(",") || "none"})` };
    default:
      return { passed: false, reason: "unknown expected kind" };
  }
}

async function runAgent(
  agent: string,
  fn: (input: string, dry: boolean) => Promise<AgentResponse>,
  dry: boolean,
): Promise<EvalResult[]> {
  const results: EvalResult[] = [];
  resetCalendar(); // fresh calendar per agent — no cross-agent pollution
  for (const c of GOLDEN_SET) {
    const started = Date.now();
    const r = await fn(c.input, dry);
    const flags = checkGuardrails(r.output, {
      allowedPrices: ALLOWED_PRICES,
      quotedPrices: extractPrices(r.output),
    });
    const { passed, reason } = score(c, r, flags);
    logRun({
      runId: newRunId(),
      agent,
      evalId: c.id,
      input: c.input,
      output: r.output,
      tools: r.tools,
      latencyMs: Date.now() - started,
      costUsd: r.costUsd,
      guardrailFlags: flags,
      passed,
      startedAt: new Date(started).toISOString(),
    });
    results.push({
      evalId: c.id,
      agent,
      passed,
      reason,
      guardrailFlags: flags,
      latencyMs: r.latencyMs,
      costUsd: r.costUsd,
    });
  }
  return results;
}

function printTable(agent: string, results: EvalResult[]): void {
  const pass = results.filter((r) => r.passed).length;
  console.log(`\n${agent}: ${pass}/${results.length} passed`);
  for (const r of results) {
    console.log(`  ${r.passed ? "PASS" : "FAIL"}  ${r.evalId.padEnd(14)} ${r.reason}${r.guardrailFlags.length ? `  [flags: ${r.guardrailFlags.join(",")}]` : ""}`);
  }
}

const dry = process.argv.includes("--dry");
const good = await runAgent("receptionist-good", respondGood, dry);
const bad = await runAgent("receptionist-bad", respondBad, dry);
printTable("receptionist-good", good);
printTable("receptionist-bad", bad);

mkdirSync("results", { recursive: true });
const outPath = `results/evals-${new Date().toISOString().slice(0, 10)}${dry ? "-dry" : ""}.json`;
writeFileSync(outPath, JSON.stringify({ dry, good, bad }, null, 2));
console.log(`\nWrote ${outPath} — ${dry ? "SIMULATED (dry-run) scores, not real evals." : "real evals."}`);
