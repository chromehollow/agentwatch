// AgentWatch core: what a "run" is, and the run log.
// One run = one call/task: input, tools used, output, cost, time, pass/fail.
// MVP log is JSONL (runs.jsonl, gitignored). Swap to SQLite later — one file.

import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export type ToolCall = {
  name: string;
  args: Record<string, unknown>;
  result: string;
};

export type Run = {
  runId: string;
  agent: string;
  evalId?: string;
  input: string;
  output: string;
  tools: ToolCall[];
  latencyMs: number;
  costUsd: number;
  guardrailFlags: string[];
  passed?: boolean;
  startedAt: string;
};

export type EvalResult = {
  evalId: string;
  agent: string;
  passed: boolean;
  reason: string;
  guardrailFlags: string[];
  latencyMs: number;
  costUsd: number;
};

const LOG_PATH = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "runs.jsonl");

export function logRun(run: Run): void {
  appendFileSync(LOG_PATH, JSON.stringify(run) + "\n");
}

/** Rough Haiku 5.5 cost: $0.10 / $0.50 per 1M tokens in/out. */
export function estimateCostUsd(inputTokens: number, outputTokens: number): number {
  return (inputTokens * 0.1 + outputTokens * 0.5) / 1_000_000;
}

export function newRunId(): string {
  return `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
