#!/usr/bin/env bash
# Tears down everything this workshop's demo can have created.
#
# The workshop plan's own teardown note blurs two different Pulumi stacks together: the
# per-bucket demo stack the scaffolder action creates (project
# backstage-s3-bucket, one stack per bucket name) only ever holds a bucket and a
# bucket policy, never the IAM role or OIDC provider. Those two live in the
# separate, presenter-run-once bootstrap stack under 04-esc-oidc/bootstrap. This
# script tears down both, plus the Backstage host, as three distinct steps -- see
# README.md in this folder for why they cannot be one step.
set -euo pipefail

PULUMI_PROJECT_NAME="backstage-s3-bucket"

usage() {
  cat <<'EOF'
Usage: ./teardown.sh [--demo-stacks-only | --full]

  --demo-stacks-only  Destroy every per-bucket stack under the
                       backstage-s3-bucket project (what participants created
                       by clicking "Create"). Leaves the OIDC bootstrap stack
                       and the Backstage host running, so the workshop can be
                       re-run for another cohort without repeating steps 1 and 4.

  --full               Also destroys the 04-esc-oidc bootstrap stack (IAM role
                       + OIDC provider) and stops the Backstage Docker Compose
                       host. Use this once the workshop is fully decommissioned.

With no flag, runs --demo-stacks-only.
EOF
}

mode="demo-stacks-only"
case "${1:-}" in
  --demo-stacks-only) mode="demo-stacks-only" ;;
  --full) mode="full" ;;
  -h|--help) usage; exit 0 ;;
  "") ;;
  *) echo "Unknown argument: ${1}" >&2; usage; exit 1 ;;
esac

echo "==> Listing stacks in project '${PULUMI_PROJECT_NAME}'"
stack_names=$(pulumi stack ls --project "${PULUMI_PROJECT_NAME}" --output json | \
  python3 -c 'import json,sys; print("\n".join(s["name"] for s in json.load(sys.stdin)))')

if [ -z "${stack_names}" ]; then
  echo "==> No stacks found under project '${PULUMI_PROJECT_NAME}' -- nothing to destroy."
else
  while IFS= read -r stack_name; do
    [ -z "${stack_name}" ] && continue
    full_ref="${PULUMI_PROJECT_NAME}/${stack_name}"
    echo "==> Destroying resources in stack '${full_ref}' (bucket + bucket policy)"
    pulumi destroy --yes --stack "${full_ref}"
    echo "==> Removing stack record '${full_ref}' from Pulumi Cloud"
    pulumi stack rm "${full_ref}" --yes
  done <<< "${stack_names}"
fi

if [ "${mode}" = "full" ]; then
  echo "==> Full teardown: destroying the OIDC bootstrap stack (IAM role + OIDC provider)"
  ( cd ../04-esc-oidc/bootstrap && pulumi destroy --yes )

  echo "==> Full teardown: stopping the Backstage Docker Compose host"
  ( cd ../01-backstage-host && docker compose down )

  cat <<'EOF'
==> Full teardown complete for everything this repo manages. Two things are
    outside Pulumi's and Docker Compose's reach and need a manual or separate
    action:
      1. The EC2 host running the Backstage Docker Compose stack -- stop or
         terminate it directly in the AWS console or CLI; it was provisioned
         by hand per 01-backstage-host/README.md, not by a Pulumi program.
      2. The Pulumi Policies pack published in 06-policy/ -- it carries no
         ongoing cost, so leaving it published is safe. To remove it instead,
         run `pulumi policy disable <org>/<policy-group>` to unbind it from
         the project, then `pulumi policy remove <org>/backstage-demo-guardrails`
         (confirm the exact pack name in 06-policy/PulumiPolicy.yaml).
EOF
else
  echo "==> Demo-stack teardown complete. Bootstrap stack and Backstage host left running."
fi
