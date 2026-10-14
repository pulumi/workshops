# AGENTS.md — 03-orchestrator

One script, four invocations. Steps 3-6 of the brief (blocked scale-up,
approved scale-up, rotation, scale-down) are grouped into this single
`orchestrator.ts` rather than four separate folders, because they are four
invocations of the same orchestrator with different `action`/`--replicas`/
`--approve` arguments — four folders would mean four copies of the same
Automation API wiring and audit-log code.

`lib/automation.ts` holds the Automation API setup shared by every action
(stack selection, the local `file://` backend, the policy pack path).
`lib/audit.ts` holds the audit-log read/append shared by every action and by
`04-audit/read-audit.ts`.

`stack.up({ policyPacks: [...] })` throws when the policy blocks the update;
the orchestrator catches that, logs a `blocked` entry, and exits 1. A
successful `up()` logs an `approved` entry and exits 0. Both paths always
write to the audit log — there is no third, silent outcome.
