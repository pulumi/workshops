# AI Agents for IT Ops: Custom Agent on AKS with Azure OpenAI

A 90-minute workshop for platform and cloud infra engineers running their own
agent workload on Azure, rather than a managed agent service.

> Most "AI agent" demos assume someone else's platform under the agent. This
> one does not: you provision the AKS cluster and the Azure OpenAI
> deployment yourself, from one Pulumi program, deploy a small containerized
> agent onto that cluster, and tear the whole thing down without leaving a
> bill running. No packaged Pulumi component exists yet for this exact
> pattern (checked 2026-09-22) — that gap is the reason this workshop is
> useful.

## Sessions and speakers

| Session | Date | Length |
|---|---|---|
| First delivery | September 23, 2026 | 90 min |
| Second regional delivery | date not yet set | 90 min |

Speakers: not yet assigned.

## What attendees learn

1. Provision an AKS cluster and an Azure OpenAI model deployment from a
   single Pulumi program, in one language.
2. Explain how a workload inside AKS authenticates to Azure OpenAI without a
   long-lived static secret (managed identity + OIDC federation, the same
   mechanism Pulumi ESC's `azure-login` provider uses for CI credentials).
3. Deploy a small containerized agent onto the cluster and have it make a
   real call to the deployed model.
4. Tear the entire stack down cleanly with `pulumi destroy` and verify
   nothing billable remains.

## Layout

```
itops-agent-aks-azure-openai/
├── README.md                    this file
├── AGENTS.md                    conventions for agents (and humans) editing this folder
├── .gitignore                   *.md ignored except README.md/AGENTS.md/slides/slides.md
├── .shellcheckrc                shellcheck config shared by every *.sh below
├── 01-empty-program/            step 1 — `pulumi new azure-native-python`, one resource group
├── 02-aks-cluster/              step 2 — the AKS cluster (ManagedCluster)
├── 03-azure-openai/             step 3 — the Cognitive Services account (kind OpenAI) + GPT-4o deployment
├── 04-workload-identity/        step 4 — managed identity + OIDC federation + role assignment, no static secret
├── 05-agent-deployment/         step 5 — Kubernetes provider, namespace, deployment, service
│   └── agent-app/               source + Dockerfile for the pre-built agent container image
└── 06-teardown/                 step 6 — `teardown.sh`: destroy + verify + purge
```

## Prerequisites

### Participants

- An Azure subscription with Owner or Contributor, **and Azure OpenAI access
  enabled**. Some subscriptions require prior approval for this — flag it in
  registration materials, since approval can take days.
- Pulumi CLI 3.263.0 or later.
- Python 3.11+.
- `az` CLI, logged in (`az login`).
- `kubectl`.

### Presenter

- **Pre-verify Azure OpenAI quota** in the demo region/subscription well
  before the session. Approval can take days and this is the single most
  likely live failure — see Risks below.
- **Pre-build and push the agent container image** to a registry the
  workshop subscription can pull from (see
  `05-agent-deployment/agent-app/AGENTS.md`), so step 5 does not depend on a
  live container build. Which registry to use is an open question — see
  below.

## Run the demo

One-time setup, before the session:

1. Verify Azure OpenAI quota is approved in the target subscription/region.
2. Build and push the agent container image (see
   `05-agent-deployment/agent-app/AGENTS.md`).
3. `cd 01-empty-program && pulumi up --stack dev` — creates the resource
   group `rg-itops-agent-aks-azure-openai`.

Live, in session order:

4. **Step 2 — AKS cluster**: `cd 02-aks-cluster && pulumi up --stack dev`.
   Verify: `az aks show --resource-group rg-itops-agent-aks-azure-openai
   --name itops-agent-aks`. Takes 5-10 minutes — see Risks below for the
   pre-staged fallback.
5. **Step 3 — Azure OpenAI**: `cd 03-azure-openai && pulumi up --stack dev`.
   Verify: `az cognitiveservices account show` and `az cognitiveservices
   account deployment list` both show the account and the `gpt-4o`
   deployment.
6. **Step 4 — workload identity**: copy the `oidcIssuerUrl` output from step
   2 and the `accountId` output from step 3 into
   `04-workload-identity/Pulumi.dev.yaml`'s `oidcIssuerUrl` /
   `openaiAccountId`, then `cd 04-workload-identity && pulumi up --stack
   dev`. Verify: `az role assignment list --assignee <identityClientId
   output>` shows "Cognitive Services OpenAI User", and grepping this
   program and `05-agent-deployment/` for `accessKey` or `apiKey` returns
   nothing.
7. **Step 5 — agent deployment**: copy the `identityClientId` output from
   step 4 and the `endpoint` output from step 3, plus the pushed image
   reference, into `05-agent-deployment/Pulumi.dev.yaml`, then `cd
   05-agent-deployment && pulumi up --stack dev`. Verify: `kubectl get pods
   -n itops-agent` shows the agent running, then `kubectl port-forward
   svc/itops-agent 8080:80 -n itops-agent` and, in another terminal, `curl
   -X POST localhost:8080/prompt -H 'Content-Type: application/json' -d
   '{"prompt": "Say hello from AKS"}'` returns a real model response.

Teardown, at the end of the session (and after the second regional
delivery):

8. **Step 6 — teardown**: `06-teardown/teardown.sh`. Verify: `az resource
   list --resource-group rg-itops-agent-aks-azure-openai` returns empty.

Between the two deliveries, run step 6 after the first session, and repeat
steps 3-8 fresh for the second — including the Cognitive Services purge
check, since a soft-deleted account blocks reusing the same name.

## Cost

Directional only — not a Pulumi-published figure. From
azure.microsoft.com/pricing/details/kubernetes-service and
azure.microsoft.com/pricing/details/cognitive-services/openai-service (read
2026-09-22): a small 2-3 node AKS cluster plus a few dollars of
workshop-scale GPT-4o tokens runs roughly $150-$300 for a full month if left
running. A single workshop session with immediate teardown (step 6) is
closer to a few dollars total. The monthly figure only matters if teardown
is skipped — which is exactly what step 6 exists to prevent.

## Risks and fallbacks

- **Azure OpenAI quota/region approval can take days** — the single most
  likely live failure. Pre-provision the account and deployment before the
  session; set `itops-agent-openai:createOpenAI` to `"false"` and
  `existingResourceGroup` / `existingAccountName` / `existingDeploymentName`
  in `03-azure-openai/Pulumi.dev.yaml`, run steps 1-2 and 4-6 live, and
  narrate step 3 instead of running it.
- **AKS cluster provisioning takes 5-10 minutes** — pre-provision the
  cluster before the session; set `itops-agent-aks-cluster:createCluster` to
  `"false"` and `existingClusterName` in `02-aks-cluster/Pulumi.dev.yaml`,
  and start the live portion of the demo at step 3 instead.
- **OIDC federation is fiddly live** — if `04-workload-identity` does not
  come together in front of the room, fall back to a short-lived key minted
  by Pulumi ESC and shown once on screen. Never fall back to a persisted
  static secret in the program or the container spec.
- **Soft-deleted Cognitive Services accounts block name reuse** —
  `06-teardown/teardown.sh` purges the account after every delivery,
  including the second regional one; skipping this on any delivery blocks
  the next one from reusing the same account name.

## Open questions

- Which container registry should hold the pre-built agent image? None is
  named in the brief; `05-agent-deployment/agent-app/AGENTS.md` documents
  build-and-push commands against a placeholder and leaves the registry a
  required config value rather than inventing one.
- Whether a live AKS + GPT-4o deployment fits the 90-minute session length
  end-to-end, or whether cluster provisioning needs to be pre-staged before
  every delivery (see Risks above) rather than only as a fallback.

## Sources

Read 2026-09-22 unless noted otherwise.

| Topic | Source |
|---|---|
| `azure-native.containerservice.ManagedCluster` (incl. `identity`, `oidcIssuerProfile`, `securityProfile.workloadIdentity`) | https://www.pulumi.com/registry/packages/azure-native/api-docs/containerservice/managedcluster/ |
| `azure-native.cognitiveservices.Account` | https://www.pulumi.com/registry/packages/azure-native/api-docs/cognitiveservices/account/ |
| `azure-native.cognitiveservices.Deployment` | https://www.pulumi.com/registry/packages/azure-native/api-docs/cognitiveservices/deployment/ |
| `azure-native.managedidentity.UserAssignedIdentity` | https://www.pulumi.com/registry/packages/azure-native/api-docs/managedidentity/userassignedidentity/ |
| `azure-native.managedidentity.FederatedIdentityCredential` | https://www.pulumi.com/registry/packages/azure-native/api-docs/managedidentity/federatedidentitycredential/ |
| `azure-native.authorization.RoleAssignment` and `getClientConfig` | https://www.pulumi.com/registry/packages/azure-native/api-docs/authorization/roleassignment/ , https://www.pulumi.com/registry/packages/azure-native/api-docs/authorization/getclientconfig/ |
| Kubernetes provider from an AKS kubeconfig (`listManagedClusterUserCredentials`) | https://www.pulumi.com/blog/top-5-things-for-azure-devs-kubernetes-infrastructure/ , https://www.pulumi.com/registry/packages/azure-native/api-docs/containerservice/listmanagedclusterusercredentials/ |
| Pulumi ESC `azure-login` dynamic credentials | https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/azure-login/ |
| `pulumi-azure-native` v3.28.0 on PyPI | https://pypi.org/project/pulumi-azure-native/ |
| Azure OpenAI deployment types (`GlobalStandard` SKU) | https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/deployment-types |
| GPT-4o model version lifecycle (2024-11-20 current, 2024-05-13/2024-08-06 deprecated) | https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/retired-models , https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirement-schedule |
| "Cognitive Services OpenAI User" built-in role (`5e0bd9bd-7b93-4f28-af87-19fc36ad61bd`) | https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/ai-machine-learning |
| Azure OpenAI chat completions data-plane API version 2024-10-21 | https://learn.microsoft.com/en-us/azure/foundry/openai/reference |
| AKS pricing | https://azure.microsoft.com/pricing/details/kubernetes-service |
| Azure OpenAI Service pricing | https://azure.microsoft.com/pricing/details/cognitive-services/openai-service |
