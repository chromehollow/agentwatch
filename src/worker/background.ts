// Background worker skeleton (phase 2).
// On-demand agents wake when someone talks to them in the Playground.
// Background agents stay awake: they poll for new work on their own —
// e.g. the vendor agent watches a folder for a new vendor PDF, starts the
// review, and emails a human when it's done.
// Vercel alone can't do this (it sleeps between clicks). This worker runs on
// Railway, where the backend stays on. Same agent code, different trigger.
//
// Usage: node src/worker/background.ts        (poll loop, every 10 min)
//        node src/worker/background.ts --once (one poll, for testing)

const POLL_MS = 10 * 60 * 1000;

async function pollOnce(): Promise<void> {
  // TODO (Day 11+): list the watched inbox/folder, and for each new item:
  //   1. run the vendor agent on it (read PDF -> map to questions -> score)
  //   2. log the run to AgentWatch
  //   3. alert a human if the failure rate spikes or a guardrail trips
  console.log(`[${new Date().toISOString()}] background poll: no watched items yet (skeleton)`);
}

if (process.argv.includes("--once")) {
  await pollOnce();
} else {
  console.log("AgentWatch background worker started — polling every 10 min.");
  await pollOnce();
  setInterval(pollOnce, POLL_MS);
}
