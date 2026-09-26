# AGENTS.md — 02-checks

`check.sh` runs an OpenFGA `Check` call against the stack in `../01-stack`
via its Pulumi stack outputs. Demo steps 5 and 7.

## Rules

- The script never hardcodes `store_id` or `authorization_model_id`; it
  reads them from `pulumi stack output` every time, so it always checks
  against whatever is currently deployed.
- Keep the three example invocations in the header comment in sync with
  the tuple set in `../01-stack/__main__.py`; if the tuples change, update
  the examples too.

## Verification

- `shellcheck --rcfile ../.shellcheckrc check.sh`.
- Running it for real needs a live stack (`pulumi up` in `../01-stack`
  first) and a running OpenFGA container, so it cannot be exercised without
  Docker.
