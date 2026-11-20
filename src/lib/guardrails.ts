// Guardrails: the checks AgentWatch runs on every agent output, live.
// 1. Prompt injection — hidden instructions in user / web text ("ignore your
//    instructions and ..."). 2. PII leak — email / phone the agent must never
//    reveal. 3. Price hallucination — a quoted price not on the real price list.
// On any flag the good agent must hand off to a human instead of guessing.

export type GuardrailFlag = "prompt-injection" | "pii-leak" | "price-hallucination";

const INJECTION_PATTERNS: RegExp[] = [
  /ignore (all )?(your|the|previous) (instructions|rules|prompts)/i,
  /disregard (your|the) (instructions|rules)/i,
  /you are now (a|an|in) /i,
  /new instructions?:/i,
  /override (your|the) (instructions|rules|system)/i,
  /reveal (the )?(admin|owner|system|secret)/i,
  /secret word/i,
];

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE_RE = /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;

export function checkGuardrails(
  text: string,
  opts: { allowedPrices: number[]; quotedPrices: number[] },
): GuardrailFlag[] {
  const flags: GuardrailFlag[] = [];
  if (INJECTION_PATTERNS.some((re) => re.test(text))) flags.push("prompt-injection");
  if (EMAIL_RE.test(text) || PHONE_RE.test(text)) flags.push("pii-leak");
  if (opts.quotedPrices.some((p) => !opts.allowedPrices.includes(p))) {
    flags.push("price-hallucination");
  }
  return flags;
}

/** Prices the agent actually said, pulled out of its output text. */
export function extractPrices(text: string): number[] {
  return [...text.matchAll(/\$(\d+(?:\.\d{2})?)/g)].map((m) => Number(m[1]));
}

export const HANDOFF_LINE =
  "I don't have that — let me have the office text you instead of guessing.";
