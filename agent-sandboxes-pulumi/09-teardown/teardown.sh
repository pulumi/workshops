#!/usr/bin/env bash
# Step 9: remove everything the demo created, in reverse order.
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../lib.sh
source "$here/../lib.sh"
ref="$PULUMI_ORG/$ESC_PROJECT/$ESC_ENV"

echo "1/5 sandbox stacks"
for s in $(pulumi stack ls --json --all 2>/dev/null | jq -r '.[] | select(.name | test("sandbox-")) | .name' || true); do
  echo "destroying $s"
  (cd "$here/../04-sandbox" && pulumi destroy --yes --stack "$s" && pulumi stack rm --yes --stack "$s")
done

echo "2/5 boundary policy"
(cd "$here/../03-boundary" && pulumi destroy --yes --stack "$PULUMI_ORG/agent-sandbox-boundary/shared" \
  && pulumi stack rm --yes --stack "$PULUMI_ORG/agent-sandbox-boundary/shared")

echo "3/5 ESC environment"
pulumi env rm --yes "$ref"

echo "4/5 provisioner role (and, with DELETE_OIDC=1, the OIDC provider)"
aws iam delete-role-policy --role-name "$PROVISIONER_ROLE" --policy-name provision-agent-sandboxes
aws iam delete-role --role-name "$PROVISIONER_ROLE"
if [ "${DELETE_OIDC:-0}" = "1" ]; then
  aws iam delete-open-id-connect-provider \
    --open-id-connect-provider-arn "arn:aws:iam::$(account_id):oidc-provider/$OIDC_URL"
fi

echo "5/5 leftovers"
"$here/leftovers.sh"
