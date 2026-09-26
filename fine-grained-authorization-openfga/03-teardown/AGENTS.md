# AGENTS.md — 03-teardown

`verify-teardown.sh` confirms `pulumi destroy` (run in `../01-stack`) left
nothing behind: no OpenFGA container, no stack outputs. Demo step 8.

## Rules

- This script only verifies; it never destroys anything itself. The
  presenter runs `pulumi destroy` in `01-stack` first.

## Verification

- `shellcheck --rcfile ../.shellcheckrc verify-teardown.sh`.
- Running it for real needs Docker and a stack that has just been
  destroyed; cannot be exercised without Docker.
