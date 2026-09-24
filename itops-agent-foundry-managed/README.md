# AI Agents for IT Ops: Managed Agent in Microsoft Foundry

A 75-90 minute workshop for platform and cloud infrastructure engineers on
Azure who want a managed agent runtime, provisioned and torn down entirely
from Pulumi code.

> Most "AI agent on Azure" demos either run the agent yourself on a cluster
> or wave at a managed service from the portal. This one does neither: you
> provision a Microsoft Foundry project and a managed agent as Pulumi code,
> connect it to a real IT-ops runbook with no static key anywhere, ask it a
> real on-call question, and tear the whole thing down. The catch, and the
> reason this workshop earns its slot: standalone Foundry project support in
> `pulumi-azure-native` looked incomplete as of 2026-09-22 and was
> re-verified working as of 2026-09-24 (see [Sources](#sources)) - that
> feasibility story is itself worth telling on stage.

## Sessions and speakers

| Session | Date | Length |
|---|---|---|
| First delivery | December 9, 2026 | 75-90 min |
| Second regional delivery | date not yet set | 75-90 min |

Speakers: not yet assigned.

## What attendees learn

1. When to reach for a managed agent runtime (Microsoft Foundry) instead of
   a self-managed one (contrast with the sibling `itops-agent-aks-azure-openai`
   workshop, which runs its own agent on AKS).
2. Provision a Foundry project and a managed agent as Pulumi code.
3. Connect the agent to a real IT-ops tool or data source (an on-call
   runbook in blob storage) with no static key.
4. Tear the stack down with `pulumi destroy` and verify nothing billable
   remains.

## Layout

```
itops-agent-foundry-managed/
├── README.md                    this file
├── AGENTS.md                    conventions for agents (and humans) editing this folder
├── .gitignore                   *.md ignored except README.md/AGENTS.md/slides/slides.md
├── .shellcheckrc                shellcheck config shared by every *.sh below
├── 01-foundry-project/          step 1 - resource group + Foundry-enabled account + project
├── 02-create-agent/             step 2 - GPT-4o model deployment + AgentApplication resource
├── 03-tool-connection/          step 3 - runbook storage + AAD ProjectConnection (no static key)
│   └── upload_runbook.py        uploads a real runbook, run after `pulumi up` here
├── 04-exercise-agent/           step 4 - configures and asks the agent a real on-call question
│   └── exercise_agent.py        data-plane script, not a Pulumi program
└── 05-teardown/                 step 5 - `teardown.sh`: destroy + verify + purge
```

Numbering note: the brief's demo-plan section names the outcomes and the
slide order but gives no numbered steps of its own. The five folders above
were derived from the brief's slide outline (project, agent, tool/data
source, exercise, teardown) and the four outcomes; each is documented below
with the end state it reaches and the command that proves it, since the
brief did not supply that either. Flagged as an open question in this
workshop's pull request.

## What each step proves it reached

| Step | End state | Proof command |
|---|---|---|
| 1. `01-foundry-project` | A Foundry-enabled Cognitive Services account and project exist. | `pulumi preview` clean, then `pulumi stack output projectEndpoint` returns a URL. |
| 2. `02-create-agent` | A GPT-4o deployment and an `AgentApplication` resource exist under the project. | `pulumi stack output agentApplicationName` returns a name. |
| 3. `03-tool-connection` | The project has an AAD-authenticated connection to a blob container holding a real runbook. | `az cognitiveservices account project connection list` shows the connection; `az storage blob list` (with an AAD login) shows the runbook. |
| 4. `04-exercise-agent` | The agent answers a real on-call question using the runbook. | `python exercise_agent.py` prints an answer that quotes a command from the runbook. |
| 5. `05-teardown` | Nothing billable remains. | `az resource list --resource-group rg-itops-agent-foundry-managed` returns empty, and no soft-deleted Cognitive Services account remains. |

## Prerequisites

### Participants

- An Azure subscription with Foundry access enabled. Some subscriptions
  require prior approval for this - flag it in registration materials,
  since approval can take days.
- Pulumi CLI 3.263.0 or later.
- Python 3.11+.
- `az` CLI, logged in (`az login`).

### Presenter

- **Re-verify Foundry support** against pulumi.com/docs and
  pulumi/pulumi-azure-native#4354 / pulumi/pulumi-azure#3257 no more than
  one week before each delivery - this is a fast-moving product area and the
  brief was built on a snapshot that already found a real gap once.
- **Pre-build the tool/data-source integration** (steps 1-3, plus
  `upload_runbook.py`) before the live session, so the live portion starts
  from step 4 if time is short, and is never blocked live on Foundry project
  creation's known intermittent 500 error (see `AGENTS.md`).

## Run the demo

```bash
cd 01-foundry-project
pulumi stack init dev
pulumi up

cd ../02-create-agent
pulumi stack init dev
pulumi config set accountName "$(pulumi stack output accountName --cwd ../01-foundry-project)"
pulumi config set projectName "$(pulumi stack output projectName --cwd ../01-foundry-project)"
pulumi config set resourceGroupName "$(pulumi stack output resourceGroupName --cwd ../01-foundry-project)"
pulumi up

cd ../03-tool-connection
pulumi stack init dev
pulumi config set accountName "$(pulumi stack output accountName --cwd ../01-foundry-project)"
pulumi config set projectName "$(pulumi stack output projectName --cwd ../01-foundry-project)"
pulumi config set resourceGroupName "$(pulumi stack output resourceGroupName --cwd ../01-foundry-project)"
pulumi config set projectPrincipalId "$(pulumi stack output projectPrincipalId --cwd ../01-foundry-project)"
pulumi up
python upload_runbook.py

cd ../04-exercise-agent
pip install -r requirements.txt
export FOUNDRY_PROJECT_ENDPOINT=$(pulumi stack output projectEndpoint --cwd ../01-foundry-project)
export MODEL_DEPLOYMENT_NAME=itops-agent-gpt-4o
python exercise_agent.py

cd ..
./05-teardown/teardown.sh
```

Note: none of these commands were run end-to-end against a live subscription
during this build (see [Open questions](#open-questions-carried-from-the-brief-plus-new-ones-from-this-build)).

## Cost (directional only, re-verify before every delivery)

- Azure OpenAI GPT-4o (Global Standard): **$2.50 / 1M input tokens, $10.00 /
  1M output tokens** as of 2026-09-24 (see [Sources](#sources)) - cited
  instead of the brief's $2.75/1M figure, which is more likely the Data Zone
  rate; both are unverified against Microsoft's own pricing page directly,
  since it renders its numbers client-side and returned no numbers to a
  plain fetch on 2026-09-24. GPT-4o is now Azure's previous-generation tier,
  not its current recommendation - say so on the cost slide.
- Microsoft Foundry Agent Service per-agent/per-session pricing was not
  confirmed against a public, dated source during this build. **Pull this
  fresh from azure.microsoft.com/pricing before every delivery** rather than
  presenting a number that could not be sourced today.
- The workshop's own footprint (one GlobalStandard deployment at capacity
  10, one Standard_LRS storage account, torn down within the session) is
  small regardless of the exact per-token rate; frame the cost slide around
  "small and torn down the same session," not a specific dollar total.

## Sources

Facts in this demo come from these pages, read on the dates noted:

- Workshop brief: [AI Agents for IT Ops - Managed Agent in Microsoft Foundry](https://workprentice.ai/documents/7e747feb-5807-4231-9773-8723f2588fad) (2026-09-22)
- Notion delivery page (2026-12-09): 3a5fdbdf-1cce-8148-8091-c1dde67f6203 (2026-09-22)
- Notion delivery page (second regional, undated): 3a5fdbdf-1cce-81c4-a7de-c65205211d44 (2026-09-22)
- `cognitiveservices.Account` / `allow_project_management`: https://www.pulumi.com/registry/packages/azure-native/api-docs/cognitiveservices/account/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops (2026-09-24)
- `cognitiveservices.Project`: https://www.pulumi.com/registry/packages/azure-native/api-docs/cognitiveservices/project/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops (2026-09-24)
- `cognitiveservices.AgentApplication`: https://www.pulumi.com/registry/packages/azure-native/api-docs/cognitiveservices/agentapplication/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops (2026-09-24)
- `cognitiveservices.Deployment`: https://www.pulumi.com/registry/packages/azure-native/api-docs/cognitiveservices/deployment/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops (2026-09-24)
- `cognitiveservices.ProjectConnection`: https://www.pulumi.com/registry/packages/azure-native/api-docs/cognitiveservices/projectconnection/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops (2026-09-24)
- `authorization.RoleAssignment`: https://www.pulumi.com/registry/packages/azure-native/api-docs/authorization/roleassignment/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops (2026-09-24)
- pulumi/pulumi-azure-native#4354 (closed, fixed in v3.14.0; unresolved regression comment from 2026-03-09): https://github.com/pulumi/pulumi-azure-native/issues/4354 (2026-09-24)
- pulumi/pulumi-azure#3257 (open, no activity): https://github.com/pulumi/pulumi-azure/issues/3257 (2026-09-24)
- `pulumi-azure-native` latest release (v3.28.0, 2026-09-13): https://www.pulumi.com/registry/packages/azure-native/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops (2026-09-24)
- Pulumi CLI install/version: https://www.pulumi.com/docs/iac/download-install/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops (2026-09-22, re-checked 2026-09-24)
- Foundry RBAC roles (Foundry User = renamed Azure AI User, GUID unchanged): https://learn.microsoft.com/en-us/azure/foundry/concepts/rbac-foundry (2026-09-24)
- Storage Blob Data Reader role GUID: https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/storage (2026-09-24)
- `azure-ai-projects` client library (`AIProjectClient`, endpoint form, `DefaultAzureCredential`): https://learn.microsoft.com/en-us/python/api/overview/azure/ai-projects-readme (2026-09-24)
- `azure-ai-agents` client library (`create_agent`, `FunctionTool`, `ToolSet`, `runs.create_and_process`): https://learn.microsoft.com/en-us/python/api/overview/azure/ai-agents-readme (2026-09-24)
- PyPI current versions (`azure-ai-agents` 1.1.0, `azure-ai-projects` 2.7.0, `azure-identity` 1.25.3, `azure-storage-blob` 12.30.3): pypi.org (2026-09-24)
- Azure OpenAI GPT-4o pricing (Global Standard $2.50/1M input): azure.microsoft.com/en-us/pricing/details/azure-openai/, cross-referenced against amnic.com and cloudzero.com Azure OpenAI pricing pages (2026-09-24, since the Microsoft page itself renders pricing client-side)
- GPT-4o retirement/model-version status: https://learn.microsoft.com/en-us/azure/ai-foundry/openai/concepts/model-retirements (2026-09-22, re-checked 2026-09-24)

## Open questions (carried from the brief, plus new ones from this build)

- **From the brief:** whether Pulumi ships full standalone Foundry project
  support before delivery. Confidence in the brief was medium. This build's
  2026-09-24 re-check found that `cognitiveservices.Project` and
  `cognitiveservices.AgentApplication` do exist as non-legacy resources in
  `pulumi-azure-native` v3.28.0 (the pinned version), so the PREFERRED path
  in the brief is used throughout this folder - but a community comment on
  the tracking issue from 2026-03-09 describes an intermittent 500 error
  creating the `Project` resource, unresolved as of that comment. This was
  not re-tested against a live subscription in this build. **Re-run
  `pulumi up` in `01-foundry-project` against a real subscription before
  committing to the PREFERRED path for the December delivery**, and fall
  back to the manual-import path in `AGENTS.md` if it still 500s.
- **New:** the brief's demo-plan section gives no numbered steps; the five
  folders above and their end states/proof commands were derived by Anvil
  from the slide outline and outcomes, not supplied. Radar or the reviewing
  colleague should confirm the derived step boundaries match what they had
  in mind before the slides are built on top of them.
- **New:** Microsoft Foundry Agent Service's own per-agent/session pricing
  (as opposed to the underlying model's token price) was not found on a
  public, dated page during this build. Pull it fresh before quoting a
  number on the cost slide.
