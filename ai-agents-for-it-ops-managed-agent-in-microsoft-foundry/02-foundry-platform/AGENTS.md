# AGENTS.md — 02-foundry-platform

Pulumi Python project: the Azure AI Foundry management-plane platform this
workshop's agent (`03-agent`) and tool connection (`04-tool-connection`) build
on top of. Everything here is provisioned with `pulumi_azure_native`; there is
no `azure-native` resource for the agent itself — see `03-agent/AGENTS.md`.

## What this provisions (`__main__.py`)

- `ResourceGroup` — the workshop's resource group.
- `cognitiveservices.Account` (`kind="AIServices"`, `SystemAssigned` identity,
  a custom subdomain equal to the account name, `allow_project_management=True`)
  — the Foundry account.
- `cognitiveservices.Project`, a child of the account (`parent`/`depends_on`
  both set on the account).
- `cognitiveservices.Deployment` of a `gpt-4o` model (`2024-11-20`) on the
  account.

Location comes from `azure_native.config.location`
(`pulumi config set azure-native:location <region>`), falling back to
`eastus2` if unset — never hardcoded on a resource. `accountName`,
`projectName`, and `deploymentName` are Pulumi config values with sensible
defaults (see the top of `__main__.py`); override `accountName` if the
default collides with an existing Cognitive Services account, since it
becomes part of a globally-unique DNS name.

## Stack outputs (exact names — 03-agent, 04-tool-connection, 05-exercise depend on these)

- `resource_group_name` — string.
- `account_name` — string.
- `account_endpoint` — string, the management-plane endpoint
  (`https://<account_name>.cognitiveservices.azure.com/`).
- `project_name` — string.
- `project_endpoint` — string, the **data-plane** URL
  `https://{account_name}.services.ai.azure.com/api/projects/{project_name}`,
  built with `pulumi.Output.all(...).apply(...)` string formatting only
  (never a resource created inside `.apply()`, per pulumi-best-practices).
- `deployment_name` — string.

## Non-obvious rules

- Resource property names (`custom_sub_domain_name`, `allow_project_management`,
  and the `Account`/`Project`/`Deployment` constructor shapes generally) are
  best-current-knowledge from research read 2026-09-29, not yet
  schema-verified against the installed provider; the orchestrator verifies
  with `pulumi preview` once every folder in this workshop has landed and a
  venv exists, and corrects any property name this program got wrong.
- `project_endpoint` must stay the data-plane host
  (`services.ai.azure.com/api/projects/...`) — it is a different host than
  `account_endpoint`, and the provider does not return it as a single field.
- Outputs are passed directly between resources (`resource_group.name`,
  `account.name`, `project.name`) rather than extracted and re-used as plain
  values, so Pulumi's dependency graph stays correct.

## Verification

Run for real during this build:

- `python3 -m py_compile __main__.py` — passed. This checks syntax only, not
  import resolution (`pulumi_azure_native` is not installed in this build
  sandbox), so it does not confirm the resource shapes above.

Not run this build, by design:

- `pulumi preview` — no venv exists yet for this project; the orchestrator
  installs `requirements.txt` and runs `pulumi preview` after every folder in
  this workshop has landed, which is what actually confirms the property
  names above against the real provider schema.
