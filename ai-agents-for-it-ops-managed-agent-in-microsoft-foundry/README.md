# AI Agents for IT Ops: Managed Agent in Microsoft Foundry

A workshop on provisioning an Azure AI Foundry-managed agent as Pulumi code:
the Foundry project it lives in, the agent itself, a real IT-ops tool
connection, and a clean, verified teardown.

> A self-managed agent (see the sibling AKS workshop) means you run the
> model server, the orchestration and the scaling. A Foundry-managed agent
> means Azure runs all of that, and what you own is the project, the model
> deployment and the tools you connect it to. This workshop provisions that
> ownership boundary as Pulumi code, connects the agent to a real IT-ops
> data source, and tears it down cleanly enough to prove nothing billable
> is left behind.
>
> — Workshop page: not yet published.

## Sessions and speakers

| Session | Date | Length |
|---|---|---|
| Scheduled delivery | December 9, 2026 | TBD |
| Second regional delivery | date not yet set | TBD |

Speakers have not been assigned as of this run.

## What attendees learn

1. The difference between a self-managed agent (the sibling AKS workshop)
   and a Foundry-managed agent, and when to choose each.
2. How to provision a Foundry project and a managed agent as Pulumi code.
3. How to connect the managed agent to a real IT-ops data source (here, a
   set of runbooks in blob storage) so it answers with a citation.
4. How to tear the deployment down cleanly and verify nothing billable
   remains, including Cognitive Services' soft-delete behavior.

## Layout

```
ai-agents-for-it-ops-managed-agent-in-microsoft-foundry/
├── README.md                 this file
├── AGENTS.md                 conventions for agents (and humans) editing this folder
├── 01-preflight/              bash: Pulumi CLI, Python, az login, region/quota and access reminders
├── 02-foundry-platform/       Pulumi Python: resource group, Foundry account + project + model deployment
├── 03-agent/                  Pulumi Python: the IT-ops prompt agent, via a local.Command wrapping the Foundry SDK
├── 04-tool-connection/        Pulumi Python: runbook blobs (runbooks/), a project connection, agent re-created with file-search
├── 05-exercise/               a real IT-ops query against the agent, printing its (grounded) answer
├── 06-teardown/               pulumi destroy in reverse order, plus a Cognitive Services purge check
└── slides/                    not built yet — a follow-up run on this branch adds the Slidev deck
```

The numbered folders follow the demo order: preflight (`01`), the platform
the agent lives in (`02`), the agent (`03`), its tool connection (`04`), the
live exercise (`05`) and teardown (`06`). The brief this was built from did
not number its demo-plan steps; this layout is this run's own derivation
from the brief's slide order and learning outcomes — see the pull request
for that gap.

## Prerequisites

- An Azure subscription with Azure AI Foundry access enabled. This can
  require prior approval on the subscription; request it before the day of
  the workshop.
- The [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli),
  logged in (`az login`) with a subscription selected. Every resource here
  authenticates through it (directly for `pulumi-azure-native`, and via the
  `azure-ai-projects` SDK's `DefaultAzureCredential` for the agent).
- The [Pulumi CLI](https://www.pulumi.com/docs/iac/download-install/),
  **≥ 3.263.0**. (3.265.0 is the current release as of this run; 3.263.0 is
  the floor the brief pinned and this demo was built against.)
- Python **≥ 3.11**, one virtualenv per numbered Pulumi folder (each folder
  has its own `requirements.txt`; do not share a single venv across them).
- A region with both Azure AI Foundry and a `gpt-4o`-class model deployment
  available — `01-preflight/preflight.sh` defaults to `eastus2` and prints
  a reminder, but availability is account-level state no script can check
  for you; confirm in the [Foundry model catalog](https://ai.azure.com/) for
  your subscription before the day of the workshop.

## Run the slides

Not yet available. This run built the demo code only; a follow-up run adds
the Slidev deck to this same branch. Once it lands, this section will carry
the usual `npm install` / `npm run dev` / `npm run build` / `npm run export`
sequence.

## Run the demo

Each numbered folder is its own Pulumi project with its own venv. Run them
in order; each depends on the previous one's stack outputs via
`pulumi.StackReference`.

```bash
# 0. once per machine: confirm the CLI, Python, az login and region are ready
01-preflight/preflight.sh

# 1. the platform: resource group, Foundry account + project + model deployment
cd 02-foundry-platform
python3 -m venv venv && ./venv/bin/pip install -r requirements.txt
pulumi stack init dev
./venv/bin/pulumi up --yes    # exports project_endpoint, deployment_name
cd ..

# 2. the agent: a local.Command wrapping the Foundry SDK's create_version/delete_version
cd 03-agent
python3 -m venv venv && ./venv/bin/pip install -r requirements.txt
pulumi stack init dev
./venv/bin/pulumi up --yes
cd ..

# 3. the tool connection: upload the sample runbooks, connect them to the project,
#    re-create the agent with the file-search tool attached
cd 04-tool-connection
python3 -m venv venv && ./venv/bin/pip install -r requirements.txt
pulumi stack init dev
./venv/bin/pulumi up --yes
cd ..

# 4. live: ask the agent a real IT-ops question and print its grounded answer
cd 05-exercise
python3 -m venv venv && ./venv/bin/pip install -r requirements.txt
./venv/bin/python3 ask-agent.py
cd ..

# 5. teardown, in reverse order, plus a purge check (Cognitive Services soft-deletes)
06-teardown/teardown.sh
06-teardown/verify-clean.sh
```

Each project reads its config with `pulumi config set <key> <value>` before
`up` if you need a non-default name; see that folder's `AGENTS.md` for the
config keys it defines (account/project/deployment names in
`02-foundry-platform`, `agent_name` and `platform_stack` in `03-agent`,
storage/container/connection names in `04-tool-connection`). All resource
names that must be globally unique (the Foundry account becomes part of a
DNS name) fall back to a stack-name-derived default and can collide; override
them if they do.

### What this run could verify, and what it could not

This demo was built on a workstation with no Azure tenant, no `az` CLI
installed, and no network path to install one. That bounds what could
actually be checked here, and every check below is a real, executed result,
not an assumption:

- **Every Python program imports and compiles** against its pinned
  `requirements.txt` (`python -m compileall`, one venv per folder).
- **`pulumi preview` was run on every Pulumi folder.** On `02-foundry-platform`
  and `04-tool-connection` it dispatched every resource constructor — the
  point at which the SDK raises a Python `TypeError` immediately if a
  property name is wrong — without one, then failed on missing `az`
  credentials during provider configuration, before contacting Azure. On
  `03-agent` it failed differently: because `02-foundry-platform` was never
  actually deployed (no credentials to do so), its `StackReference` outputs
  resolve to `None`, and `Output.concat` cannot join that into a command
  string. That is the expected shape of previewing a downstream stack whose
  upstream was never applied, not a bug in `03-agent`'s own code — see that
  folder's `AGENTS.md`.
- **`shellcheck` is clean** on every script in `01-preflight/` and
  `06-teardown/`, using this folder's `.shellcheckrc`.
- **Not run**: `az`-based checks (`01-preflight/preflight.sh`'s own account
  check fails here with "az CLI not found", which is the correct, honest
  result on this machine), any `pulumi up`, the live exercise in
  `05-exercise/`, and `06-teardown/`'s actual cleanup and purge check. A
  presenter with a real Azure subscription and `az login` already run needs
  to exercise the full sequence at least once before presenting.

## Sources

Facts in this workshop come from these pages, read on September 29, 2026:

- `pulumi/pulumi-azure-native#4354` (closed, `resolution/fixed`, fixed by
  PR #4522, shipped in provider 3.14.0):
  https://github.com/pulumi/pulumi-azure-native/issues/4354
- `azure-native:cognitiveservices:Account`:
  https://www.pulumi.com/registry/packages/azure-native/api-docs/cognitiveservices/account/
- `azure-native:cognitiveservices:Project`:
  https://www.pulumi.com/registry/packages/azure-native/api-docs/cognitiveservices/project/
- `azure-native:cognitiveservices:Deployment`:
  https://www.pulumi.com/registry/packages/azure-native/api-docs/cognitiveservices/deployment/
- `azure.aifoundry.Project` (legacy, not used here):
  https://www.pulumi.com/registry/packages/azure/api-docs/aifoundry/project/
- `pulumi/pulumi-azure#3257` (still open, classic C# provider, not used
  here): https://github.com/pulumi/pulumi-azure/issues/3257
- Microsoft Learn, "Create a prompt agent" (data-plane only, no
  Bicep/ARM/Terraform tab):
  https://learn.microsoft.com/en-us/azure/foundry/agents/quickstarts/prompt-agent
- Pulumi CLI releases: https://www.pulumi.com/docs/iac/download-install/
- `pulumi-azure-native` PyPI release history:
  https://pypi.org/project/pulumi-azure-native/#history
