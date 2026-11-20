# Dashboard plan (build after the evals work)

Top nav: **Dashboard | Playground | Evals | Logs**

- **Dashboard** — uptime, runs today, pass rate, cost per run, handoff rate,
  and a list of what broke this week and what you fixed. Plus a kill switch:
  one click to roll back to the last good prompt version.
- **Playground** — the demo tab. Two chat boxes side by side: Good Receptionist
  (guardrailed) vs Bad Receptionist (built to fail). Label it clearly:
  "Playground — test agents built to be watched." Visitors try to break them;
  AgentWatch shows the log live next to the chat ("Blocked: prompt injection,
  logged at 2:14pm").
- **Evals** — the 20 tests, click Run, see 18/20 vs 9/20. Rerun after any prompt
  change; the score must not silently drop.
- **Logs** — every run: input, tools used, output, cost, time, pass/fail,
  guardrail flags. Searchable.

Stack: Next.js + TypeScript on Vercel (dashboard), Node/Express on Railway
(agents + API), JSONL log now, SQLite when the log outgrows a file. Same stack
as narratives.now, so nothing new to learn.

Phase 2 (other developers, later): API keys. A developer signs up, gets a key
like `aw_live_...`, adds 3 lines to their agent, and every run auto-sends its
report to AgentWatch. Or: AgentWatch calls *their* agent's web address with
the 20 test questions and scores it without touching their code. Don't build
either until a paying client asks for it.
