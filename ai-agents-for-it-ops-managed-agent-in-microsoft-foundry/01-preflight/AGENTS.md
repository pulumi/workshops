# AGENTS.md — 01-preflight

Shell only, not a Pulumi project. One script, `preflight.sh`, that a presenter
runs before `02-foundry-platform` to confirm the machine and Azure account
are ready.

## What it checks, in order

1. Pulumi CLI installed and >= `3.263.0` — OK/FAIL.
2. Python installed and >= `3.11` — OK/FAIL.
3. `az account show` succeeds (logged in, a subscription selected) — OK/FAIL.
4. Reminder: the target region (`$AZURE_LOCATION`, default `eastus2`) has
   Azure AI Foundry and a gpt-4o-class model available for deployment.
5. Reminder: Foundry / Azure OpenAI access has been approved for the
   subscription.

Checks 4 and 5 print as `INFO` reminders with a documentation link, not
OK/FAIL: region/model catalog availability and access approval are
account-level state, not something a single deterministic CLI call can
confirm, and the brief this folder was built from explicitly allows a
printed reminder for both. Exit code is 0 only if checks 1-3 all pass;
the reminders never affect it.

## How to work here

- Keep it POSIX-ish bash: `set -euo pipefail`, every check function returns
  0 even on its own failure path (it records the failure in the `failures`
  counter instead), so one failing check never aborts the rest via
  `errexit`. If you add a check, follow that pattern — a bare failing
  command as a top-level statement under `set -e` will short-circuit every
  check after it.
- `version_ge` compares dotted version strings with `sort -V`; reuse it
  rather than adding a second comparison method.

## What could not be run this build

The `az` CLI is not installed on this build workstation (and is not
installable here), so check 3 was executed for real and observed to `FAIL`
with "az CLI not found on PATH" — that is the expected, correct behavior on
this machine, not a bug. On a presenter's machine with `az` installed and
`az login` already run, that check will pass instead. Checks 1 and 2 ran for
real against this workstation's toolchain and passed.

## Verification

Both run for real during this build:

- `shellcheck` against the workshop root's `.shellcheckrc`
  (`source-path=SCRIPTDIR`, `external-sources=true`) — clean, no warnings.
- `./preflight.sh` executed directly — printed OK for Pulumi (`3.263.0`) and
  Python (`3.12.13`), FAIL for the Azure CLI check (`az` absent on this
  workstation, expected here), and both reminders, exiting `1` (one
  scriptable check failed, as expected without `az`).
