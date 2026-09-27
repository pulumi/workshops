
# AGENTS.md — 07-teardown

Two shell scripts, no Pulumi project: `teardown.sh` destroys the four
stacks in reverse build order and checks for orphaned PVCs; `verify-clean.sh`
confirms no kind cluster remains afterward.

## How to work here

- `chmod +x teardown.sh verify-clean.sh`; both must pass `shellcheck`
  against this folder's inherited `.shellcheckrc`.
- Run order matters: `04-clients -> 03-topic -> 02-kafka -> 01-cluster`.
  `01-cluster`'s destroy also removes the kind cluster itself (its
  `local.Command` delete hook runs `kind delete cluster`), so it must run
  last.
- The PVC check assumes `strimzi.io/cluster=demo-cluster` labels every PVC
  Strimzi creates for this cluster's node pools; that label convention is
  documented, but this build had no live cluster to confirm the label
  actually lands on the PVC objects it creates (no `docker`/`kind`/`kubectl`
  on the build workstation — see root `AGENTS.md`). Confirm this label
  against a real cluster during rehearsal, and adjust the selector here if
  it turns out to differ.
- `teardown.sh` runs `pulumi destroy` sequentially and stops on the first
  failure (`set -euo pipefail`), unlike the CloudNativePG workshop's
  teardown, which tolerates one project (`06-pitr-restore`) never having
  been stood up. Every project in this workshop is expected to always be
  up by the time teardown runs, so there is no equivalent "optional" stack
  here.

## Verification

- `shellcheck teardown.sh verify-clean.sh`.
- Live: run `teardown.sh` then `verify-clean.sh` after a full demo pass;
  `verify-clean.sh` should print `PASS` and exit 0.
