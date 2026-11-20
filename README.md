# AgentWatch — an agent that watches other agents

**For Dre first, and for hiring managers who click the link.** Not a website for
random users. A dashboard that proves you can build an agent, test it with evals,
guardrail it, and keep it running — the exact work in the Gauntlet / FDE /
Applied AI roles you're applying for.

## The idea in one line

You build small test agents on purpose (a good receptionist and a bad one),
AgentWatch logs every run, scores them against a 20-case golden set, blocks
prompt injection / data leaks / made-up prices, and shows cost, latency and
pass rate on a dashboard.

## Order of build (agreed)

1. **Playground / on-demand first** — demo agents in a tab, talk to them, run evals.
2. **Background worker second** — the same agents flip to running on their own
   (watch a folder / inbox, act, log it). Planned for the vendor agent.
3. **Simple real-world agents first, complex financial ones second** — good vs bad
   receptionist now; vendor / SOC 2 agent and expense classifier later, in the
   same `src/agents/` folder, watched by the same code.

## What a "run" is

One run = one call/task, with: input, tools used, output, cost, time, pass/fail.
If that data model is right, everything else (dashboard, evals, alerts) is easy.
See `src/lib/agentwatch.ts`.

## Safety first — do this before your next Claude Code session

Today's GTIG report (Nov 17): attackers hid a backdoor in a `.claude/settings.json`
file inside repos, so launching Claude Code downloaded it. Before you run Claude
Code in any cloned repo, read that repo's `.claude/settings.json` first. Same
family as the open Nov 8 check: search GitHub for `filename:settings.local.json`
and rotate any secret you find. This repo has no secrets in it — check
`.env.example`.

## Cost (text-first, $0–$5 to start)

- Hosting: Vercel dashboard $0 (Hobby), Railway backend $5/mo when you deploy.
- AI: Haiku 5.5 ($0.10/$0.50 per 1M tokens). One full 20-eval run ≈ 1 cent.
  Set a **$10 cap** on your Claude API key before the first real run.
- Voice: not in the MVP. Text only. Add ElevenLabs/Vapi later, only for a demo call.
- No course, no Pro plan, no Twilio number until a pilot client pays you.

## Run it

```bash
npm install
# Dry run — scripted stub agents, $0, verifies the harness + scoreboard logic.
# Dry-run scores are SIMULATED, not real evals. Label them as such anywhere you show them.
npm run eval:dry

# Real run — Haiku via the Anthropic API. Needs ANTHROPIC_API_KEY in .env.
cp .env.example .env   # then paste your key, and set the $10 cap in the dashboard
npm run eval
npm run dev            # dashboard (stub page — see docs/dashboard-plan.md)
```

## Layout

```
src/lib/agentwatch.ts   Run / EvalResult types, JSONL run log
src/lib/guardrails.ts   injection, PII-leak and price-hallucination checks
src/lib/pricing.ts      FAKE demo price list — the only prices the good agent may quote
src/agents/calendar.ts  in-memory fake calendar (book / reschedule / cancel)
src/agents/receptionist-good.ts   guardrailed agent (system prompt + tools)
src/agents/receptionist-bad.ts    same job, guardrails stripped — built to fail
src/evals/golden-set.ts 20 test cases with expected outcomes
src/evals/run-evals.ts  runner: scores both agents, prints the table, writes results
src/worker/background.ts  skeleton: poll loop for background runs (vendor agent, phase 2)
docs/day1.md            Day 1 task — the smallest step that unlocks the rest
docs/dashboard-plan.md  Dashboard / Playground / Evals / Logs tabs
```

## What the dry run showed (Nov 17)

First dry run was simulated, not real — it proves the harness works, not the agents. Good agent: 20/20. Bad agent (guardrails stripped): 3/20. The gap is the point: the evals catch prompt injection, PII leaks and made-up prices that a live demo would miss. Next step: one real Haiku run (about 1 cent) with a $10 cap on the key.

## The resume line this earns (only once it's real)

> Built AgentWatch plus 3 test agents (good vs bad receptionist, research agent),
> with a 20-case eval suite. Caught prompt injection, PII leaks and price
> hallucinations in the bad agent, with a live dashboard.

It only counts if the agents are real: real tool calls, a real calendar, real
failures, real reruns — not a dashboard with typed-in fake numbers.
