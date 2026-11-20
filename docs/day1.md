# Day 1 — the smallest step that unlocks the rest

**Goal:** get the run model right and prove the eval harness works. About 1–2 hours.

1. Read `src/lib/agentwatch.ts`. One run = input, tools used, output, cost, time,
   pass/fail. If you change this shape later, everything downstream changes too.
2. Run `npm run eval:dry`. You should see the good receptionist pass most of
   the 20 and the bad one fail most of them. Those are SIMULATED scores — they
   prove the harness, not the agents.
3. Pick the 3 failures that surprise you most and read the matching case in
   `src/evals/golden-set.ts`. Change the good agent's prompt or rules, rerun,
   watch the score move. That's regression testing — the Zip habit.
4. Set a $10 cap on your Claude API key, put it in `.env`, run `npm run eval`
   once. That's your first REAL eval number. Write one paragraph in your eval
   notes: time, cost, quality vs the dry run.

**Then stop.** Day 2–3 is the booking flow only; don't build the dashboard yet.
Mornings stay for job applications — this build is afternoons, ~2 hours a day.
