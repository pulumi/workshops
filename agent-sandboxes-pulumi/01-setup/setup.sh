#!/usr/bin/env bash
# Step 1: the one-time AWS side of the demo. Run with sandbox-account admin credentials.
# Creates the Pulumi Cloud OIDC provider and the base role agent-sandbox-provisioner.
# Nothing here writes a long-lived key to disk.
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../lib.sh
source "$here/../lib.sh"

acct="$(account_id)"
echo "Setting up OIDC trust in account $acct for Pulumi organization $PULUMI_ORG"

if ! aws iam get-open-id-connect-provider \
  --open-id-connect-provider-arn "arn:aws:iam::$acct:oidc-provider/$OIDC_URL" >/dev/null 2>&1; then
  aws iam create-open-id-connect-provider \
    --url "https://$OIDC_URL" \
    --client-id-list "aws:$PULUMI_ORG" >/dev/null
  echo "created OIDC provider $OIDC_URL"
else
  echo "OIDC provider $OIDC_URL already exists"
fi

trust="$STATE_DIR/trust-policy.json"
perm="$STATE_DIR/provisioner-policy.json"
sed -e "s/__ACCOUNT__/$acct/g" -e "s/__ORG__/$PULUMI_ORG/g" "$here/trust-policy.json.tmpl" >"$trust"
sed -e "s/__ACCOUNT__/$acct/g" "$here/provisioner-policy.json.tmpl" >"$perm"

if aws iam get-role --role-name "$PROVISIONER_ROLE" >/dev/null 2>&1; then
  aws iam update-assume-role-policy --role-name "$PROVISIONER_ROLE" \
    --policy-document "file://$trust"
else
  aws iam create-role --role-name "$PROVISIONER_ROLE" \
    --assume-role-policy-document "file://$trust" \
    --max-session-duration 3600 >/dev/null
fi
aws iam put-role-policy --role-name "$PROVISIONER_ROLE" \
  --policy-name provision-agent-sandboxes --policy-document "file://$perm"

echo "provisioner role: arn:aws:iam::$acct:role/$PROVISIONER_ROLE"
echo "$acct" >"$STATE_DIR/account-id"
