#!/usr/bin/env bash
# verify-clean.sh - confirm nothing billable remains in either cloud.
#
#   07-teardown/verify-clean.sh
#
# `pulumi destroy` removes the resources it created, but GCP service accounts
# soft-delete for 30 days by default: a service account with the same
# account ID cannot be recreated until the soft-deleted one is purged. This
# script checks for exactly that, plus a general sweep of the two GCP
# resource types and the AWS role, in case a stack destroy was interrupted.
#
# Needs: gcloud and aws CLIs authenticated to the workshop's GCP project and
# AWS account. Set GCP_PROJECT to the workshop's project ID before running.
set -euo pipefail

GCP_PROJECT="${GCP_PROJECT:-your-gcp-project-id}"
SA_ACCOUNT_ID="policy-access-governance"

say() { printf '\n=== %s ===\n' "$1"; }

say "checking for a live service account (should be gone after destroy)"
if gcloud iam service-accounts describe \
    "${SA_ACCOUNT_ID}@${GCP_PROJECT}.iam.gserviceaccount.com" \
    --project "$GCP_PROJECT" >/dev/null 2>&1; then
  echo "WARNING: service account ${SA_ACCOUNT_ID} still exists"
else
  echo "clean: no live service account named ${SA_ACCOUNT_ID}"
fi

say "checking for a soft-deleted service account (30-day retention by default)"
if gcloud iam service-accounts list \
    --project "$GCP_PROJECT" --show-deleted \
    --filter="disabled=true AND email:${SA_ACCOUNT_ID}@*" \
    --format="value(email)" 2>/dev/null | grep -q .; then
  echo "NOTE: a soft-deleted service account matching ${SA_ACCOUNT_ID} was found."
  echo "It does not bill, but it blocks reusing that exact account ID for the"
  echo "next 30 days (or until purged with 'gcloud iam service-accounts undelete'"
  echo "then delete again, which GCP does not support for immediate purge)."
else
  echo "clean: no soft-deleted service account found"
fi

say "checking for a leftover BigQuery dataset"
if bq show --project_id="$GCP_PROJECT" "policy_access_governance_demo" >/dev/null 2>&1; then
  echo "WARNING: dataset policy_access_governance_demo still exists"
else
  echo "clean: no leftover dataset"
fi

say "checking for a leftover Secret Manager secret"
if gcloud secrets describe policy-access-governance-demo --project "$GCP_PROJECT" >/dev/null 2>&1; then
  echo "WARNING: secret policy-access-governance-demo still exists"
else
  echo "clean: no leftover secret"
fi

say "checking for a leftover AWS IAM role"
if aws iam get-role --role-name policy-access-governance-demo-role >/dev/null 2>&1; then
  echo "WARNING: AWS role policy-access-governance-demo-role still exists"
else
  echo "clean: no leftover AWS role"
fi

say "verification complete"
