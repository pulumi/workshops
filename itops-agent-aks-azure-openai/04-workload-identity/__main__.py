"""Step 4: workload identity — no static secret, anywhere.

Three resources wire the AKS workload to Azure OpenAI without a key:

1. `UserAssignedIdentity` — the identity the agent pod will present as.
2. `FederatedIdentityCredential` — trusts tokens issued by the AKS cluster's
   OIDC issuer (from step 2) for one Kubernetes service account, so the pod
   gets a short-lived Azure AD token with no secret material involved.
3. `RoleAssignment` — grants that identity "Cognitive Services OpenAI User"
   (built-in role `5e0bd9bd-7b93-4f28-af87-19fc36ad61bd`, confirmed against
   learn.microsoft.com/azure/role-based-access-control/built-in-roles/
   ai-machine-learning on 2026-09-22) scoped to the account from step 3.

End state: `az role assignment list --assignee <identity-client-id>` shows
the role, and grep across this program and `05-agent-deployment/` for
`accessKey`, `apiKey`, or a literal secret value returns nothing.

Fallback for the "OIDC federation fiddly live" risk in the brief: if the
federated-credential setup does not work live, fall back to a short-lived
key minted by Pulumi ESC and shown once on screen — never a persisted
static secret. That fallback is a presenter script, not code, so it is not
represented here; see the root README's "Run the demo" section.
"""

import pulumi
from pulumi_azure_native import authorization, managedidentity

config = pulumi.Config()
resource_group_name = config.require("resourceGroupName")
oidc_issuer_url = config.require("oidcIssuerUrl")
openai_account_id = config.require("openaiAccountId")
namespace = config.get("namespace") or "itops-agent"
service_account_name = config.get("serviceAccountName") or "itops-agent"

COGNITIVE_SERVICES_OPENAI_USER_ROLE_ID = "5e0bd9bd-7b93-4f28-af87-19fc36ad61bd"

identity = managedidentity.UserAssignedIdentity(
    "itops-agent-identity",
    resource_name_="itops-agent-identity",
    resource_group_name=resource_group_name,
    tags={
        "workshop": "itops-agent-aks-azure-openai",
        "managed-by": "pulumi",
    },
)

federated_credential = managedidentity.FederatedIdentityCredential(
    "itops-agent-federated-credential",
    resource_name_=identity.name,
    federated_identity_credential_resource_name="itops-agent-federated-credential",
    resource_group_name=resource_group_name,
    issuer=oidc_issuer_url,
    subject=f"system:serviceaccount:{namespace}:{service_account_name}",
    audiences=["api://AzureADTokenExchange"],
)

client_config = authorization.get_client_config_output()

role_assignment = authorization.RoleAssignment(
    "itops-agent-openai-role",
    principal_id=identity.principal_id,
    principal_type=authorization.PrincipalType.SERVICE_PRINCIPAL,
    role_definition_id=client_config.subscription_id.apply(
        lambda sub_id: (
            f"/subscriptions/{sub_id}/providers/Microsoft.Authorization/"
            f"roleDefinitions/{COGNITIVE_SERVICES_OPENAI_USER_ROLE_ID}"
        )
    ),
    scope=openai_account_id,
    opts=pulumi.ResourceOptions(depends_on=[identity, federated_credential]),
)

pulumi.export("identityClientId", identity.client_id)
pulumi.export("identityPrincipalId", identity.principal_id)
pulumi.export("namespace", namespace)
pulumi.export("serviceAccountName", service_account_name)
