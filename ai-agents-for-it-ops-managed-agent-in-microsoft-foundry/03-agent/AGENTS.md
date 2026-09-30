# AGENTS.md — 03-agent

Pulumi Python project: creates the IT-ops Foundry prompt agent. Depends on
`02-foundry-platform` via `pulumi.StackReference`.

## What this provisions

- No azure-native resource: Foundry agents are data-plane-only (Microsoft
  Learn's "Create a prompt agent" quickstart, read 2026-09-29, has no
  Bicep/ARM/Terraform tab). `agent.py` calls the `azure-ai-projects` SDK
  directly; `__main__.py` wraps it in a `pulumi_command.local.Command` so
  `pulumi up` / `pulumi destroy` still drive its lifecycle.
- The agent `it-ops-runbook-agent` (config `agent_name`), a
  `PromptAgentDefinition` using the `02-foundry-platform` deployment as its
  model and the IT-ops system prompt from the build brief as its
  instructions.

## Assumptions flagged for the orchestrator

- **`02-foundry-platform`'s Pulumi project name**: that folder did not exist
  yet when this one was built, so the StackReference target is assumed to
  be `organization/itops-foundry-platform/dev` (config key `platform_stack`,
  overridable with `pulumi config set platform_stack <real-fqn>` if the
  platform folder's `Pulumi.yaml` `name:` field differs).
- **SDK method names** (`create_version`, `delete_version`,
  `PromptAgentDefinition(model=..., instructions=...)`): best-current-
  knowledge from the quickstart cited in the root build brief. The
  orchestrator later built this folder's venv and ran
  `python -m compileall` against it, which passed -- that confirms
  `agent.py` imports and compiles against the pinned `azure-ai-projects`
  release, but compiling a call is not the same as exercising it, and this
  build workstation has no Azure tenant to run `agent.py create` against.
  Confirm the method names with
  `python3 -c "from azure.ai.projects.models import PromptAgentDefinition;
  help(PromptAgentDefinition)"` against a real tenant before presenting,
  and correct `agent.py` if the installed SDK disagrees.
- **`delete_version`'s `agent_version="1"`**: assumes `create_version`
  always starts a new agent at version 1. `04-tool-connection`'s
  `agent_with_tool.py` assumes its own `create_version` call produces
  version 2; teardown order (04 before 03, per `06-teardown`) depends on
  that assumption holding.
- **Package pins**: `pulumi-azure-native==3.28.0` is pinned here for
  consistency with the sibling folders' `requirements.txt`, even though
  `__main__.py` does not import it directly -- this folder's only resource
  is the `pulumi_command.local.Command`. `pulumi-command>=1.0.0,<2.0.0`
  matches the floor/ceiling convention of the root `pulumi>=3.0.0,<4.0.0`
  pin (current release 1.2.1 as of the check below). `azure-ai-projects`
  and `azure-identity` were pinned to `2.7.0` and `1.25.3`, confirmed as the
  current PyPI releases via `pip index versions` on 2026-09-29 (network
  access worked from this build workstation).

## How to work here

- This folder never runs `az` CLI commands; the agent lifecycle goes
  through the `azure-ai-projects` SDK's own `DefaultAzureCredential`, which
  a presenter's real run resolves via their local `az login` session, VS
  Code, or a managed identity. Nothing here was runnable against a live
  Azure tenant from this build workstation.

## What `pulumi preview` actually showed here

Run in isolation on this build workstation (`02-foundry-platform` was never
`pulumi up`'d -- no `az` CLI here, see that folder's AGENTS.md), this
folder's preview does not fail on `az`: it fails with
`TypeError: sequence item 3: expected str instance, NoneType found` inside
the Pulumi runtime's `wait_for_rpcs`. That is not a bug in this program. It
is the expected shape of previewing a downstream stack whose upstream was
never applied: `platform.get_output("project_endpoint")` resolves to `None`
because the referenced `02-foundry-platform` stack has no recorded outputs
at all, and `pulumi.Output.concat` cannot join a `None` into the command
string. Against a real deployment, `02-foundry-platform` would have been
`up`'d first and `project_endpoint` would resolve to a real string. Do not
"fix" this by special-casing `None` in `__main__.py`; fix it by deploying
`02-foundry-platform` first, exactly as the root README's run order
requires.

## Verification

- `python3 -m py_compile __main__.py agent.py` -- passes.
- `pulumi preview` -- reaches program dispatch (both StackReference reads
  resolve) and fails as described above; it never reaches the
  `command.local.Command` registration itself.
