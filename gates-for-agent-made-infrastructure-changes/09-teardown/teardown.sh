#!/usr/bin/env bash
# teardown.sh: remove everything the workshop created, in the order that works.
#
#   09-teardown/teardown.sh
#
# Order matters. pulumi destroy opens the credential environment, so the Open
# approval ruleset must be disabled first, or the destroy needs a grant too.
#   1. disable the Open ruleset (console; no CLI route in the docs read)
#   2. pulumi destroy
#   3. pulumi stack rm
#   4. delete the ESC environments
#   5. disable the policy pack in its policy group, then remove the pack
#   6. delete the IAM OIDC role (console or your AWS tooling)
#   7. check that no buckets remain (AWS console or CLI)
# Every destructive step asks first. There is no --yes default here.
# Set POLICY_GROUP and POLICY_PACK to the names you used in step 2; PROGRAM_DIR
# to the program folder. The pack name is the one in PulumiPolicy.yaml.
set -euo pipefail
# shellcheck source=../lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

require_org
require_cmd pulumi

PROGRAM_DIR="${PROGRAM_DIR:-$(folder_dir 01-baseline)}"
POLICY_GROUP="${POLICY_GROUP:-}"   # empty: the org's default policy group, as in 02-policy-pack/publish.sh
POLICY_PACK="${POLICY_PACK:-agent-gates-s3}"
ROLE_NAME="${ROLE_NAME:-agent-gates-esc}"
[ -f "$PROGRAM_DIR/Pulumi.yaml" ] || die "no Pulumi.yaml in $PROGRAM_DIR; set PROGRAM_DIR"

info "org: $ORG  stack: $STACK  environment: $(esc_fqn)  policy pack: $ORG/$POLICY_PACK (group ${POLICY_GROUP:-default})"

info "step 1: disable the Open ruleset on $(esc_fqn)"
echo "  Console > environment > Settings > Approval Rulesets > the Open ruleset > disable."
confirm "Open ruleset disabled?" || die "disable it first, then re-run"

info "step 2: pulumi destroy on $STACK"
confirm "Destroy all resources in $STACK?" || die "stopped before destroy"
pulumi destroy --cwd "$PROGRAM_DIR" --stack "$STACK"

info "step 3: remove the stack"
confirm "Remove stack $STACK (its history goes with it)?" || die "stopped before stack rm"
pulumi stack rm "$STACK" --cwd "$PROGRAM_DIR"

info "step 4: delete the ESC environment $(esc_fqn)"
confirm "Delete environment $(esc_fqn)?" || die "stopped before env rm"
pulumi env remove "$(esc_fqn)"
echo "  If you created other environments for the workshop, remove them the same way: pulumi env remove $ORG/$ESC_PROJECT/<name>"

info "step 5: disable the policy pack in group ${POLICY_GROUP:-default}, then remove it"
confirm "Disable $ORG/$POLICY_PACK in policy group ${POLICY_GROUP:-default}?" || die "stopped before policy disable"
if [[ -n "$POLICY_GROUP" ]]; then
  pulumi policy disable "$ORG/$POLICY_PACK" --policy-group "$POLICY_GROUP"
else
  pulumi policy disable "$ORG/$POLICY_PACK"
fi
confirm "Remove all versions of $ORG/$POLICY_PACK?" || die "stopped before policy rm"
pulumi policy remove "$ORG/$POLICY_PACK" all
echo "  The policy group itself is deleted in the console: Policies > Policy Groups > ${POLICY_GROUP:-<your group>} > delete (the default group stays)."
confirm "Policy group deleted (if you created one)?" || die "delete the group, then re-run the final checks by hand"

info "step 6: delete the IAM OIDC role $ROLE_NAME (and the OIDC provider if you created it for this workshop)"
echo "  AWS console > IAM > Roles > $ROLE_NAME > delete. Provider: IAM > Identity providers."
confirm "IAM role deleted?" || die "delete the role, then check for buckets by hand"

info "step 7: verify no buckets remain"
if command -v aws >/dev/null 2>&1; then
  echo "  Run with your own AWS credentials (the ESC environment is gone):"
  echo "    aws s3api list-buckets --query 'Buckets[].Name' --region $AWS_REGION_DEMO"
fi
echo "  Or: AWS console > S3 > general purpose buckets. Expect no agent-gates buckets."
confirm "No workshop buckets remain?" || die "find and delete the remaining buckets"

info "teardown complete"
