# AGENTS.md — 05-failover-drill

Host-side bash: the live failover demo (brief section 1's promised
outcome), in `drill.sh` and `lib.sh`.

## What this does

- Locates the node running the `record-writer` pod (from
  `04-stateful-app`), captures how many records it has written, cordons and
  drains that node, waits for the Deployment to reschedule the pod onto a
  different worker, and checks the record count did not go backwards --
  proof the Longhorn-backed volume's data survived the node becoming
  unavailable. Uncordons the drained node at the end.

## How to work here

- macOS and Linux, shellcheck clean against this folder's `.shellcheckrc`
  (shared with the workshop root).
- `drill.sh` is idempotent and safely re-runnable: it uncordons every node
  before starting, regardless of what a previous run left behind. The
  brief's risk section caps live retries at two before falling back to the
  presenter's recording -- that is a presenter judgment call the script
  does not and cannot enforce.
- Requires `04-stateful-app` already applied against a live cluster; there
  is nothing to render offline here (no Pulumi project in this folder).

## Verification

- `shellcheck drill.sh lib.sh` (via this folder's `.shellcheckrc`) -- run
  during this build; see the root README's verification section for the
  actual result.
- End-to-end run against a live cluster was not performed during this
  build (no docker/kind on this workstation) -- named as an open
  verification item in the pull request.
