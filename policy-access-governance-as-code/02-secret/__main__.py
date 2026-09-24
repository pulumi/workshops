"""Step 2 - a Secret Manager secret with a single least-privilege binding.

Resources, in order:

1. A `gcp.secretmanager.Secret` with automatic replication
   (`replication={"auto": {}}`) - the simplest replication policy, letting
   Google Cloud choose regions rather than pinning a `user_managed` replica
   list, which is not needed for a workshop demo.
   Source: pulumi.com/registry/packages/gcp/api-docs/secretmanager/secret/
   (read 2026-09-24, Google Cloud v9.36.1).
2. A `gcp.secretmanager.SecretIamMember` granting exactly one principal
   `roles/secretmanager.secretAccessor` on this one secret. Like
   `DatasetIamMember` in step 1, `SecretIamMember` is additive: it adds one
   member to one role on one secret without touching any other binding,
   which is why it is the right resource for this step rather than
   `SecretIamPolicy` (replaces the whole policy) or `SecretIamBinding`
   (replaces every member of one role).
   Source: pulumi.com/registry/packages/gcp/api-docs/secretmanager/secretiammember/
   (read 2026-09-24, Google Cloud v9.36.1).

No secret version is created here on purpose: the demo shows the access
model, not secret material, so there is nothing to leak and nothing to
rotate.

End state (brief step 2): the secret is readable only by the intended
principal - verify in the GCP console that the secret's permissions tab
shows only `roles/secretmanager.secretAccessor` for this one principal.
"""

import pulumi
import pulumi_gcp as gcp

config = pulumi.Config()
principal = config.require("principal")

SECRET_ID = "policy-access-governance-demo"

secret = gcp.secretmanager.Secret(
    "demo-secret",
    secret_id=SECRET_ID,
    labels={"workshop": "policy-access-governance-as-code"},
    replication={"auto": {}},
)

accessor_binding = gcp.secretmanager.SecretIamMember(
    "secret-accessor",
    secret_id=secret.secret_id,
    role="roles/secretmanager.secretAccessor",
    member=principal,
)

pulumi.export("secretId", secret.secret_id)
pulumi.export("boundPrincipal", principal)
pulumi.export("boundRole", accessor_binding.role)
