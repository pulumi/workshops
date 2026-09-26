# Agent-Driven Orchestration You Can Govern, Trust and Repeat

A local, credential-free demo: a scripted stand-in agent drives a Pulumi
program through four infrastructure changes via Automation API, every change
is gated by a mandatory Pulumi Policies pack, and every attempt — approved or
blocked — lands in an append-only audit log the presenter reads back at the
end. No cloud account, no AWS/Azure/GCP credentials: the only provider in
play is `@pulumi/random`, so every `pulumi up` completes in seconds and costs
$0.

Delivery date: 2026-10-28 (Pulumi's internal delivery calendar; no public
event page, session times, or speakers assigned as of this build).

## What it teaches

By the end, participants can orchestrate a multi-step infrastructure change
through an agent while keeping every action auditable, subject to explicit
approval, and repeatable on demand — the promise from the workshop brief.

## Layout

```
.
├── .gitignore
├── .shellcheckrc
├── 01-fleet/            # Target program: WorkerFleet component + configVersion
├── 02-policy/           # Policy pack: require-approval-flag (mandatory)
├── 03-orchestrator/     # The "agent": Automation API driver + JSON audit log
├── 04-audit/            # Audit-trail reader the presenter walks through
├── 05-llm-stretch/      # Optional: LLM proposes the next action (dry-run, no key needed)
├── 06-teardown/         # teardown.sh — also the between-runs reset
└── scripts/
    └── setup.sh         # Presenter's one-time setup
```

Steps 3–6 of the brief (blocked scale-up, approved scale-up, rotation,
scale-down) are grouped into the single `03-orchestrator/` folder rather than
four separate folders: they are four invocations of the *same* orchestrator
script with different action arguments, and four folders would mean four
copies of the same Automation API wiring and audit-log code. See
`03-orchestrator/AGENTS.md`.

## Versions (resolved at build time, 2026-09-26)

| Package | Declared | Resolved |
|---|---|---|
| Pulumi CLI | latest stable | v3.263.0 |
| `@pulumi/pulumi` | `^3.262.0` | 3.265.0 |
| `@pulumi/policy` | `^1.13.0` | 1.21.0 |
| `@pulumi/random` | `^4.21.2` | 4.21.2 |
| Node.js | 20.x LTS (brief) | v22.23.2 (build/verification machine) |

**Node version note:** the brief pins Node 20.x LTS. This build's verification
ran on Node v22.23.2, the only runtime available on the build machine; a 20.x
LTS toolchain could not be installed there. Every project's `tsconfig.json`
targets `es2020`/`commonjs` and nothing in the demo code depends on a
Node-22-only API, so it is expected to run unchanged on Node 20.x, but that
has not been verified on this build. Re-verify on Node 20.x before the
2026-10-28 delivery.

## Running it

```
scripts/setup.sh                     # once per machine (or after teardown)
cd 03-orchestrator
node bin/orchestrator.js scale-up --replicas 4              # blocked: no approval
node bin/orchestrator.js scale-up --replicas 4 --approve     # approved: replicaCount 2 -> 4
node bin/orchestrator.js rotate --approve                    # approved: configVersion rotates
node bin/orchestrator.js scale-down --replicas 2 --approve   # approved: replicaCount 4 -> 2
cd ..
node 04-audit/bin/read-audit.js                               # prints all four attempts
node 05-llm-stretch/bin/propose-next-action.js                # optional stretch, dry-run
06-teardown/teardown.sh                                        # reset to a clean checkout
```

`scripts/setup.sh` and `06-teardown/teardown.sh` both compile against a demo
passphrase (`PULUMI_CONFIG_PASSPHRASE`, default
`agent-driven-orchestration-governable-demo` unless already set in the
shell). It protects only the throwaway local backend created by this demo —
it is not a secret, and rotating or losing it costs nothing.

## Per-step end states (each verified against a real run, see PR description)

1. **01-fleet** previews/ups cleanly. `pulumi stack output` shows
   `replicaCountOut: 2`, a `configVersion`, `approvedOut: false`.
2. **02-policy** compiles and its unit tests pass: `npm test` (7 cases).
3. **Blocked scale-up**: orchestrator exits 1; `pulumi up` reports the policy
   pack's `require-approval-flag` violation; `replicaCountOut` stays 2; the
   audit log gets a `BLOCKED` entry naming the rule.
4. **Approved scale-up**: `replicaCountOut` becomes 4; audit log gets an
   `APPROVED` entry with `before`/`after` and a timestamp.
5. **Rotation**: `configVersion` output changes; `replicaCountOut` unchanged;
   audit entry recorded.
6. **Scale-down**: `replicaCountOut` returns to 2; audit entry recorded.
7. **04-audit** prints all four attempts in order, each marked approved or
   blocked with its reason, plus a summary line.
8. **05-llm-stretch** (optional): with no `OPENAI_API_KEY` set, prints a
   deterministic proposal and states plainly that no live model call was
   made. It never applies its own proposal — it prints the exact
   `03-orchestrator` command to run, gated by the same unmodified policy
   pack.
9. **06-teardown**: destroys the stack, removes the stack registration,
   deletes the local backend state directory and the audit log. A repeat run
   of the whole sequence afterward starts from the same clean state — a real
   clean checkout, not one carrying leftover state from a prior run.

## What `require-approval-flag` actually inspects

The brief describes the policy as inspecting stack configuration directly
(`demo:approved = true`). Pulumi Policies do not expose a documented way to
read `pulumi.Config` values from inside a policy; they validate resources
(`validateResource`) or a stack's resource list (`validateStack`, over
`args.resources` filtered by type). So `01-fleet/workerFleet.ts` carries the
approval flag onto a `random.RandomId` change-marker resource's `keepers`,
and the policy reads it from there. Full rationale, with doc sources, in
`02-policy/AGENTS.md`.

## Cost and cleanup

Estimated cost: **$0**. Every resource is `@pulumi/random`, a local-only
provider with no cloud calls. `06-teardown/teardown.sh` leaves no stack, no
local state, and no audit log; presenters should run it at the end of every
delivery and rehearsal.

## Presenter checklist not covered by this repository

The following require a live rehearsal and cannot be verified from a build
machine: slide markers matching the rehearsed screen state exactly,
capturing a pre-recorded fallback of the four-step run, re-verifying the
demo 3 business days before the 2026-10-28 delivery, and a teardown check on
the actual presenter machine (this build's teardown was verified on the
build machine's local backend only).
