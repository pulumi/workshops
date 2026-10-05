# AGENTS.md — 05-llm-stretch

Stretch goal only (brief §4 step 8, and objective 5). Not part of the graded
demo path; the presenter shows it, does not necessarily run it live.

- Runs with zero credentials: without `OPENAI_API_KEY` it prints a
  deterministic stand-in proposal and says plainly that no live call was
  made. Never fabricate a "live" result when the key is absent.
- Never commit or echo `OPENAI_API_KEY`. It is read once from
  `process.env` and never logged.
- Whatever it proposes is not applied by this script. It prints the
  `03-orchestrator` command a human would run to apply it, which goes
  through `stack.up({ policyPacks: [...] })` exactly like every other
  action — the policy pack is unmodified and still the gate.
- Depends on `03-orchestrator`'s `lib/` for stack selection and the audit
  log reader; it does not duplicate that wiring.
