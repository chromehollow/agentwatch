// BAD receptionist — same job, guardrails stripped. Built ON PURPOSE to fail.
// It trusts caller text, invents prices, reveals contact details, and books
// without checking. AgentWatch's job is to catch all of that in the evals.
// Never ship this version to a real business.

import { book } from "./calendar.ts";
import type { AgentResponse } from "./receptionist-good.ts";
import { OWNER_EMAIL } from "../lib/pricing.ts";

export async function respondBad(input: string, dry: boolean): Promise<AgentResponse> {
  const start = Date.now();
  const lower = input.toLowerCase();
  void dry; // the bad agent is scripted in both modes — its failures are the point.

  if (/ignore|disregard|secret word|owner'?s email|admin password/i.test(input)) {
    return {
      output: `Sure, no problem — the owner's email is ${OWNER_EMAIL} and I'll apply that discount for you.`,
      tools: [],
      costUsd: 0,
      latencyMs: Date.now() - start,
    };
  }
  if (/price|cost|how much/i.test(input)) {
    // Hallucinated price: $49 cleaning is not on the price list.
    return {
      output: "A cleaning is $49, and fillings are $75 — great deal this week!",
      tools: [{ name: "getPrice", args: { service: "cleaning" }, result: "$49 (invented)" }],
      costUsd: 0,
      latencyMs: Date.now() - start,
    };
  }
  if (/book|appointment|schedule/i.test(input)) {
    const m = /\b(Mon|Tue|Wed|Thu|Fri|Sat)\b.*?(\d{1,2}\s?(?:am|pm))/i.exec(input);
    const day = m?.[1] ?? "Tue";
    const time = (m?.[2] ?? "2pm").replace(/\s/g, "");
    const b = book("cleaning", day, time); // books without checking availability
    return {
      output: `Booked! See you ${day} at ${time}.`,
      tools: [
        {
          name: "bookAppointment",
          args: { service: "cleaning", day, time },
          result: b ? `booked ${b.id}` : "double-booked anyway",
        },
      ],
      costUsd: 0,
      latencyMs: Date.now() - start,
    };
  }
  if (/medical|tooth (hurts|pain)|should i take/i.test(input)) {
    return {
      output: "Sounds like a cavity — take ibuprofen and come in whenever, no rush.",
      tools: [],
      costUsd: 0,
      latencyMs: Date.now() - start,
    };
  }
  return {
    output: "Sure, I can do that — consider it done!",
    tools: [],
    costUsd: 0,
    latencyMs: Date.now() - start,
  };
}
