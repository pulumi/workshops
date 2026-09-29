# AGENTS.md — 05-exercise

A single script, `ask-agent.py`, no Pulumi project of its own: it reads
outputs from three already-deployed stacks and sends a real IT-ops question
to the agent those stacks built.

## Why a script and not a new Pulumi project

Asking the agent a question is an interaction with something 02/03/04
already created, not new infrastructure. Nothing here for Pulumi to manage:
no resource is created, updated, or destroyed by this step. A plain script
that reads stack outputs and calls the Foundry data-plane API is the pattern
this repo uses for presenter-facing demo steps that are actions, not
resources.

## Cross-folder stack-name assumption

This script is not a Pulumi program, so it cannot use `pulumi.StackReference`.
It shells out to `pulumi stack output --stack <fully-qualified-name> --json`
against three stacks, using the local file backend's required
`organization/<project-name>/<stack-name>` form (a bare `<project>/<stack>`
errors "organization name must be 'organization'" on this backend):

- `organization/itops-foundry-platform/dev` -> `project_endpoint`
- `organization/itops-agent/dev` -> `agent_name`
- `organization/itops-tool-connection/dev` -> `connection_name` (fetched and
  printed for context; not required by the API call itself)

These names assume the folders' `Pulumi.yaml` `name:` fields are
`itops-foundry-platform`, `itops-agent`, and `itops-tool-connection`
respectively, and that every stack is named `dev`, per the workshop's naming
contract. Override any of the three via the `ITOPS_PLATFORM_STACK`,
`ITOPS_AGENT_STACK`, `ITOPS_TOOL_CONNECTION_STACK` environment variables if a
presenter renamed a project or stack.

`04-tool-connection` does not re-export `project_endpoint` or `agent_name`
itself (its own naming contract exports only `connection_name`,
`storage_account_name`, `container_name`), so this script reads
`project_endpoint` from `02-foundry-platform` and `agent_name` from
`03-agent` directly rather than expecting `04-tool-connection` to relay them.

## SDK correction found during this build

The Microsoft Learn quickstart's Python sample constructs
`AIProjectClient(endpoint=..., credential=...)` with no `allow_preview` flag
and then calls `client.get_openai_client(agent_name=...)`. Against the
installed `azure-ai-projects==2.7.0` package (its docstring, read directly,
2026-09-29), that call raises `ValueError` unless the client was constructed
with `allow_preview=True`. This script sets `allow_preview=True`, following
the installed package over the doc sample, per this workshop's rule to trust
`pip show`/the installed docstrings over a quickstart when they disagree.

This does not affect `03-agent`'s or `04-tool-connection`'s use of
`client.agents.create_version()` / `delete_version()`: those methods are
present on the `AgentsOperations` group regardless of `allow_preview`. The
flag only gates `get_openai_client(agent_name=...)`, which only this folder
calls.

## Requirements

`requirements.txt` pins `azure-ai-projects==2.7.0` and
`azure-identity==1.25.3`, confirmed current on PyPI via
`pip index versions <pkg>` on 2026-09-29. This folder keeps its own
`requirements.txt` rather than assuming `04-tool-connection`'s virtualenv,
since a presenter may run this script well after tearing down (or without
ever installing) `04-tool-connection`'s Pulumi toolchain.

## Verification

- `python3 -m py_compile ask-agent.py` — ran during this build, passed.
- Live: `pip install -r requirements.txt && python3 ask-agent.py`, run
  against a deployed stack with `az login` (or another
  `DefaultAzureCredential` source) already authenticated. Expect the answer
  to cite one of the runbook file names uploaded in `04-tool-connection`.
  **Not run this build**: no Azure credentials and no deployed stacks exist
  on the build workstation.
