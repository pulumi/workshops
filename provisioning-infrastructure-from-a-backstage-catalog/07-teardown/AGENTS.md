In this step we tear down everything the workshop can have created, in the order the brief specifies (brief §4, step 7): the Pulumi-managed resources first, then the stack record, then the EC2 host that sits outside the Pulumi-managed stack.

## Why teardown is two tiers, not one

The brief's teardown note blurs two different Pulumi stacks together. Each participant's "Create" click produces its own stack in the `backstage-s3-bucket` project (one bucket + one bucket policy per stack); the IAM role and OIDC provider from `04-esc-oidc` live in a separate, presenter-run-once bootstrap stack under `04-esc-oidc/bootstrap`. Destroying the bootstrap stack mid-workshop would strand every participant's Automation API call without credentials, so `teardown.sh` keeps the two tiers apart and defaults to the safe one.

## Usage

```bash
# Destroy every per-bucket demo stack (what "Create" produced). Leaves the
# OIDC bootstrap stack and the Backstage host running, so the workshop can be
# re-run for another cohort without repeating steps 1 and 4.
./teardown.sh
./teardown.sh --demo-stacks-only

# Also destroy the bootstrap stack (IAM role + OIDC provider) and stop the
# Backstage Docker Compose host. Use this once the workshop is fully
# decommissioned.
./teardown.sh --full
```

With no flag, the script runs `--demo-stacks-only`. Either mode first lists every stack under the `backstage-s3-bucket` project with `pulumi stack ls --project backstage-s3-bucket --output json`, then for each one runs `pulumi destroy --yes` followed by `pulumi stack rm --yes` — so a workshop with ten participants tears down all ten stacks in one call, not one at a time by name.

`--full` additionally runs `pulumi destroy --yes` inside `../04-esc-oidc/bootstrap` and `docker compose down` inside `../01-backstage-host`, then prints the two things neither Pulumi nor Docker Compose can reach: the EC2 host itself (provisioned by hand per `01-backstage-host/README.md`, stop or terminate it directly), and the `06-policy` policy pack (carries no ongoing cost, so leaving it published is safe; the script prints the `pulumi policy disable`/`remove` commands to remove it if desired).

## Verification actually performed

- `shellcheck teardown.sh` — clean, exit 0.
- Read against `pulumi destroy --help`, `pulumi stack rm --help`, `pulumi stack ls --help`, and `pulumi policy --help` output captured from the installed CLI (v3.263.0) to confirm every flag used (`--stack`, `--project`, `--output json`, `--yes`) is real and behaves as described.
- **Not run**: the script was not executed end-to-end against a live stack, because doing so requires a stack that a real Backstage "Create" click already created, and this workstation has no AWS credentials to create one. The individual `pulumi` and `docker compose` commands it wraps are standard, documented CLI operations; wrapping them in a small script does not change their behavior.