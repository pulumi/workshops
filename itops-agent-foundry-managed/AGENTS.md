<!-- FOR AI AGENTS - Human readability is a side effect, not a goal -->
<!-- Last updated: 2026-09-24 -->

# AGENTS.md - itops-agent-foundry-managed

Scope: this folder only. Nearest AGENTS.md wins (see the repo root's).

## What this is

Demo code for "AI Agents for IT Ops: Managed Agent in Microsoft Foundry", a
75-90 minute workshop. Five numbered folders; the first three are
self-contained Pulumi Python projects mirroring one demo step, the last two
are plain data-plane scripts (no Pulumi program, no infrastructure of their
own). Contrast: the sibling `itops-agent-aks-azure-openai` workshop runs a
self-managed agent on AKS; this one runs a Foundry-managed agent instead  - 
say that contrast out loud in the demo, it is outcome 1 of the brief.

## Fact sources

Product facts (resource type names, arguments, SDK client shapes, model
versions, role definition GUIDs, API versions) come from pulumi.com/registry
and learn.microsoft.com, read the day noted in the root README's `## Sources`
table. Never rely on training-data memory for these; re-read the docs before
changing any resource's arguments, and update the Sources table's read date
when you do. This workshop sits on a fast-moving product area (Microsoft
Foundry standalone projects) with a real feasibility gap found on 2026-09-22
and re-checked on 2026-09-24 - re-run that check again within a week of any
delivery, per the brief's own instruction.

## Canonical Pulumi names

Pulumi Neo (or Neo), Pulumi ESC, Pulumi Cloud, Pulumi IaC, Pulumi console
(lowercase console). Never "Copilot", "Pulumi Service", "Insights", never
"CrossGuard" as a product name. None of these appear in this folder's demo
code (it does not use Neo); keep them right if you add narration.

## Language and versions

Python only, per the brief. Pulumi CLI 3.263.0 (re-verify against
pulumi.com/docs/iac/download-install/ before each delivery), `pulumi-azure-native`
3.28.0 (the latest published version as of 2026-09-24 - re-verify), data-plane
SDKs `azure-ai-agents` 1.1.0, `azure-ai-projects` 2.7.0, `azure-identity`
1.25.3, `azure-storage-blob` 12.30.3 (all current on PyPI as of 2026-09-24).
If a pinned version stops resolving, say so in the PR rather than silently
upgrading.

## Per-folder conventions

- `01-foundry-project/`: resource group + `cognitiveservices.Account` (kind
  `AIServices`, `allow_project_management=True`) + `cognitiveservices.Project`
  + a role assignment granting the deploying user "Foundry User" on the
  project. Fixed names so later folders can reference them by string
  (`rg-itops-agent-foundry-managed`, `itops-agent-foundry`,
  `itops-agent-project`) instead of by generated output, matching the AKS
  sibling's convention. Verify: `pulumi preview`. Known risk: a community
  report on pulumi/pulumi-azure-native#4354 describes an intermittent HTTP
  500 creating the `Project` resource even after the issue was closed as
  fixed - say this on stage if it happens, do not silently retry past a
  second failure.
- `02-create-agent/`: a GPT-4o (`2024-11-20`) model `Deployment` and a
  `cognitiveservices.AgentApplication` resource, both children of the
  account/project from step 1. `AgentApplication`'s own properties are only
  `description`/`display_name` - it registers the agent as a billable,
  access-controlled Azure resource but does not carry model/instructions/
  tools, which are data-plane concepts set in step 4. Do not assume
  otherwise; this split was confirmed against the live registry schema on
  2026-09-24, not assumed from other Azure resources' shape.
- `03-tool-connection/`: a storage account + blob container (the "real
  IT-ops data source": an on-call runbook) + a role assignment granting the
  *project's* managed identity ("Storage Blob Data Reader") + a
  `ProjectConnection` (`category=AzureBlob`, `auth_type=AAD`) wiring them
  together with no static key anywhere. Run `python upload_runbook.py`
  after `pulumi up` here.
- `04-exercise-agent/`: plain script, `exercise_agent.py`. Uses
  `azure-ai-projects`/`azure-ai-agents` to configure the agent (model,
  instructions, a `FunctionTool` wrapping `get_runbook()` which reads the
  blob through the same AAD connection) and asks it a real on-call question.
  Deletes the agent object at the end of the run - this is a data-plane
  object distinct from the `AgentApplication` Pulumi resource, so it does
  not affect what `pulumi destroy` needs to do in step 5.
- `05-teardown/`: `teardown.sh` - `pulumi destroy` for 03, 02, 01 in that
  order, verifies the resource group is empty, and purges any soft-deleted
  Cognitive Services (Foundry) account so the same account name can be
  reused for the second, undated regional delivery. Storage accounts do not
  soft-delete the way Cognitive Services accounts do, so no purge step is
  needed for the runbook storage account.

## Manual fallback if standalone Foundry projects stop working

If `pulumi up` in `01-foundry-project` fails repeatedly (the known 500 risk
above, or a regression discovered closer to delivery), the documented
fallback is: create the project with
`az cognitiveservices account project create` and `pulumi import` it into
the stack, rather than replacing the Pulumi resource with a manual,
unscripted portal step. Only fall further back to a fully manual, narrated
portal step if `pulumi import` also fails - and say so plainly on the
slide that shows this step, per the brief's slide 4 contingency.

## Verification actually run this build (2026-09-24)

No live Azure subscription was available. `pulumi preview` was attempted in
each of the three Pulumi folders and failed at the Azure provider
credential/auth step (expected without a subscription) - the Python
programs themselves imported and constructed their resource graphs without
error. `pulumi destroy`, the exercise script's live agent run, and the
teardown script's `az` calls were **not** run end-to-end; they need a real
subscription. Say so in the PR rather than claiming otherwise.
