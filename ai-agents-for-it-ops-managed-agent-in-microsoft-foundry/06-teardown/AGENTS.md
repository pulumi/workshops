# AGENTS.md — 06-teardown

Two shell scripts, no Pulumi project: `teardown.sh` destroys the three
stacks in reverse build order; `verify-clean.sh` confirms nothing billable
is left behind, including a Cognitive Services soft-delete purge.

## Run order, and why

`teardown.sh` destroys:

```text
04-tool-connection -> 03-agent -> 02-foundry-platform
```

There is no `01-preflight` stack to destroy — it is a checks-only folder,
not a Pulumi project, so it never creates a stack in the first place.

`02-foundry-platform` goes last because nothing else depends on it once
`03-agent` and `04-tool-connection` are gone: it holds the resource group,
the Cognitive Services / AI Foundry account, the project and the model
deployment that the other two stacks reference via `StackReference`.
Destroying it first would strand `03-agent`'s and `04-tool-connection`'s
Pulumi state pointing at resources that no longer exist. This mirrors the
kafka workshop's own teardown, where the platform-level stack
(`01-cluster`) is destroyed last because it is the one everything else was
built on top of.

Each stack is addressed by its fully-qualified name
(`organization/<project>/dev`) against the local file backend, same as
every other cross-folder reference in this workshop — see
`02-foundry-platform/AGENTS.md` (or the workshop root) for why the bare
`<project>/<stack>` form fails here.

`teardown.sh` runs `pulumi destroy` sequentially under `set -euo pipefail`
and stops on the first failure. Every stack in this workshop is expected to
always be up by the time teardown runs — unlike a workshop with an optional
late-stage stack, there is no "tolerate one project never having been
stood up" case to handle here.

## The soft-delete purge is the step people forget

`pulumi destroy` on `02-foundry-platform` deletes the
`azure_native.cognitiveservices.Account` resource, but Azure Cognitive
Services accounts soft-delete by default: the account moves to a
recoverable, hidden state rather than disappearing outright. A
soft-deleted account:

- still counts toward the subscription's Cognitive Services account quota,
  and
- can block creating a *new* account with the same custom subdomain
  (`account_name`), which matters for a workshop run repeatedly against the
  same subscription.

`verify-clean.sh` checks for this explicitly with
`az cognitiveservices account list-deleted` and, if the account shows up
there, purges it with `az cognitiveservices account purge`. Skipping this
step is the main reason a demo subscription used for repeated workshop
rehearsals accumulates orphaned Cognitive Services accounts that nobody
notices until the quota is hit.

## What could not be run this build

Both scripts assume the `az` CLI (logged in to the workshop's
subscription) and a live `pulumi` state to read stack outputs from. The
build workstation has neither `az` available nor a way to install it (this
is a read-only sandbox, and there was no live Azure deployment to tear
down in the first place). Every `az` and `pulumi stack output` invocation
in both scripts was written against the documented CLI flags and command
behavior, and checked with `shellcheck`, but was **not executed live**
during this build. Confirm both scripts against a real deployment during
rehearsal before relying on them in front of an audience.

## How to work here

- `chmod +x teardown.sh verify-clean.sh`; both must pass `shellcheck`
  against the workshop root's `.shellcheckrc`.
- If a presenter renames a stack or resource group, `verify-clean.sh` reads
  the account, resource group, and storage account names back from stack
  outputs rather than hardcoding them, so it should not need edits.

## Verification

- `shellcheck teardown.sh verify-clean.sh` — run and passing (see PR
  description for output).
- Live: run `teardown.sh` then `verify-clean.sh` after a full demo pass;
  `verify-clean.sh` should print `PASS` and exit 0. Not exercised this
  build — see "What could not be run this build" above.
