"""Step 3 - a service account with a single least-privilege binding.

Resources, in order:

1. A `gcp.serviceaccount.Account`.
2. A `gcp.serviceaccount.IAMMember` granting exactly one principal
   `roles/iam.serviceAccountUser` scoped to this one service account - the
   principal can act as this service account and nothing else. This is the
   resource step 6 widens on purpose: `IAMMember`'s `service_account_id`
   argument scopes the binding to one account, but nothing stops someone
   from pointing an equivalent binding at the project instead and handing
   out `roles/owner` - that is exactly the mistake the policy pack in
   `05-policy-pack/` is written to catch, and step 6 in `06-over-broad-binding/`
   makes it happen on purpose.

   Casing note (call this out to participants): the type name is
   `IAMMember`, not `IamMember` - it breaks the casing pattern of
   `DatasetIamMember` (step 1) and `SecretIamMember` (step 2). Confirmed
   exact casing live on the registry.
   Source: pulumi.com/registry/packages/gcp/api-docs/serviceaccount/iammember/
   (read 2026-09-24, Google Cloud v9.36.1).

End state (brief step 3): the service account has only the specific role it
needs, not project-level access - verify in the GCP console that the
service account's permissions tab shows only `roles/iam.serviceAccountUser`
for this one principal, and that the project's IAM page shows no binding at
all for this service account.
"""

import pulumi
import pulumi_gcp as gcp

config = pulumi.Config()
principal = config.require("principal")

ACCOUNT_ID = "policy-access-governance"

service_account = gcp.serviceaccount.Account(
    "demo-service-account",
    account_id=ACCOUNT_ID,
    display_name="Access-governance-as-code workshop demo service account",
)

user_binding = gcp.serviceaccount.IAMMember(
    "service-account-user",
    service_account_id=service_account.name,
    role="roles/iam.serviceAccountUser",
    member=principal,
)

pulumi.export("serviceAccountEmail", service_account.email)
pulumi.export("boundPrincipal", principal)
pulumi.export("boundRole", user_binding.role)
