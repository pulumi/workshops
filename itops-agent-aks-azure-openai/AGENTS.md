<!-- FOR AI AGENTS - Human readability is a side effect, not a goal -->
<!-- Last updated: 2026-09-23 -->

# AGENTS.md, itops-agent-aks-azure-openai

Scope: this folder only. Nearest AGENTS.md wins (see the repo root's).

## What this is

Demo code for "AI Agents for IT Ops: Custom Agent on AKS with Azure OpenAI",
a 90-minute workshop. Six numbered folders. Steps 1-5 are one Pulumi project
(`itops-agent-aks-azure-openai`, stack `dev`) and each folder is cumulative:
it holds everything from the previous folder plus the new resources. No packaged Pulumi component exists
for AKS + Azure OpenAI + workload identity as of 2026-09-22, that gap is
what the workshop teaches around, so do not introduce one; the resource
types stay first-class `azure-native` and `kubernetes` resources.

## Fact sources

Product facts (resource type names, arguments, deployment SKUs, model
versions, role definition GUIDs, API versions) come from pulumi.com/registry
and learn.microsoft.com, read the day noted in the root README's `## Sources`
table. Never rely on training-data memory for these; re-read the docs before
changing any resource's arguments, and update the Sources table's read date
when you do.

## Canonical Pulumi names

Pulumi Neo (or Neo), Pulumi ESC, Pulumi Cloud, Pulumi IaC, Pulumi console
(lowercase console). Never "Copilot", "Pulumi Service", "Insights", never
"CrossGuard" as a product name. None of these appear in this folder's demo
code (it does not use Neo), but keep them right if you add narration.

## Language and versions

Python only, per the brief. Pulumi CLI 3.263.0, `pulumi-azure-native`
3.28.0, `pulumi-kubernetes` >=4.0.0,<5.0.0 (see each folder's
`requirements.txt`). If a pinned version stops resolving, say so in the PR
rather than silently upgrading.

## Per-folder conventions

- `01-empty-program/`: resource group only, fixed name
  `rg-itops-agent-aks-azure-openai` so az commands and teardown can name it. Verify: `pulumi preview`.
- `02-aks-cluster/`: `ManagedCluster` with `oidcIssuerProfile.enabled=True`
  and `securityProfile.workloadIdentity.enabled=True`, required for step 4.
  The "AKS takes 5-10 min" fallback is to `pulumi up` here before the
  session (shared stack state). Verify: `pulumi preview`; presenter verifies
  with `az aks show`.
- `03-azure-openai/`: `Account` (kind `OpenAI`, `disableLocalAuth=True`) +
  `Deployment` (model `gpt-4o`, version `2024-11-20`, sku `GlobalStandard`).
  The quota/region fallback is to `pulumi up` here before the session. Never re-add `disableLocalAuth=False`
  or export an API key, the whole point of step 4 is no static secret.
- `04-workload-identity/`: `UserAssignedIdentity` +
  `FederatedIdentityCredential` (subject
  `system:serviceaccount:<namespace>:<serviceAccountName>`) +
  `RoleAssignment` scoped to the OpenAI account with role definition id
  `5e0bd9bd-7b93-4f28-af87-19fc36ad61bd` ("Cognitive Services OpenAI User").
  `esc/azure-login.yaml` is the Pulumi ESC `azure-login` (OIDC) environment
  definition for Pulumi's own Azure access; placeholders only, never a
  client secret. End state to preserve: no static secret in this program's
  output, ever.
- `05-agent-deployment/`: `kubernetes.Provider` built from
  `listManagedClusterUserCredentials`, not a static kubeconfig file. The
  ServiceAccount carries `azure.workload.identity/client-id` and the pod
  labels carry `azure.workload.identity/use: "true"`, both required for
  workload identity to actually apply. `agent-app/` is source only; the
  image is built and pushed before the session (see its own AGENTS.md).
  Never bake a key into `agent-app/app.py`.
- `06-teardown/`: `teardown.sh` runs one `pulumi destroy` in 05 (it holds steps 1-5), then
  `az group show`, checks `az resource list` is empty and purges any soft-deleted Cognitive
  Services account. Check: `shellcheck --rcfile ../.shellcheckrc teardown.sh`.

## Commit convention

Conventional Commits scoped to this folder's slug:
`feat(itops-agent-aks-azure-openai): …`,
`docs(itops-agent-aks-azure-openai): …`.

## Never commit

`venv/`, `__pycache__/`, `*.pyc`, any `Pulumi.<stack>.yaml.bak`, any file
holding an Azure client secret, API key, or kubeconfig with embedded
credentials. `.gitignore` already ignores presenter-only `*.md` scratch
files (DEMO, REHEARSAL, OPEN-QUESTIONS, FACTCHECK) except `README.md`,
`AGENTS.md`, and `slides/slides.md`, do not force-add one.

## When instructions conflict

The nearest AGENTS.md wins (this file, or `agent-app/AGENTS.md` for that
subfolder). Explicit user prompts override files.
