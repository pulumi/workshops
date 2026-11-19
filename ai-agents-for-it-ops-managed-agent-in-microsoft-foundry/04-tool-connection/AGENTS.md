# AGENTS.md — 04-tool-connection

Pulumi Python project: uploads sample runbooks to blob storage, connects
the container to the Foundry project, and re-creates the agent with a
file-search tool that references the connection. Depends on
`02-foundry-platform` and `03-agent` via `pulumi.StackReference`.

## What this provisions

- A storage account (config `storage_account_name`) and a private blob
  container (config `container_name`, default `runbooks`), `public_access`
  set to `None` -- the agent and any human operator reach the container
  through Azure AD, never a connection string or account key
  (`allow_shared_key_access=False` on the account).
- Three sample runbooks uploaded as blobs from `runbooks/`:
  `restart-service.md`, `disk-space-cleanup.md`, `network-outage-triage.md`.
  These are the whole point of the demo: the agent should cite one of these
  three file names when it answers a question the runbook covers.
- A `cognitiveservices.ProjectConnection` (config `connection_name`,
  default `runbooks-blob-connection`) wiring the container into the
  `02-foundry-platform` project, `auth_type="AAD"`.
- A second `pulumi_command.local.Command` (`agent_with_tool.py`) that calls
  `create_version` again on the same agent name from `03-agent`, this time
  with a file-search tool referencing the connection -- this is how the
  demo attaches the tool without a native azure-native agent resource to
  update in place.

## Deviations from the brief and why

- `agent_with_tool.py` duplicates `03-agent/agent.py`'s create/delete
  pattern instead of importing it across the folder boundary. Each
  numbered folder in this workshop stands alone (its own `Pulumi.yaml`, its
  own venv), so importing a sibling folder's script would break that
  independence to save a small amount of duplication.
- `__main__.py` also reads `deployment_name` from `02-foundry-platform`'s
  StackReference, which is not in the file list this folder was built
  from but is required: `agent_with_tool.py`'s `create` calls
  `create_version` again, and that call needs a `model=` deployment name,
  the same as `03-agent/agent.py`'s did.

## Assumptions flagged for the orchestrator

- **StackReference targets**: `organization/itops-foundry-platform/dev`
  (config `platform_stack`) and `organization/itops-agent/dev` (config
  `agent_stack`). Neither sibling folder existed yet when this folder was
  built; override both configs if the real `Pulumi.yaml` `name:` fields
  differ. This is the same assumption `03-agent` made for its own
  StackReference -- keep them in sync if either changes.
- **Storage account name default** (`itopsrunbooksdemo`, config
  `storage_account_name`): storage account names are globally unique
  across all of Azure, 3-24 lowercase-alphanumeric characters. The default
  is very likely already taken by someone else's subscription; a
  presenter must override it with
  `pulumi config set storage_account_name <unique name>` before running
  against a real subscription.
- **`location` default** (`eastus`, config `location`): set independently
  of `02-foundry-platform`, which does not export its own location in the
  naming contract. For the demo it is cleanest if this matches
  `02-foundry-platform`'s location; nothing here validates that.
- **`ProjectConnection` shape**: `category="AzureBlob"`, `auth_type="AAD"`,
  `is_shared_to_all_projects=False`, `target=<container URL>` are
  best-current-knowledge from the build brief's 2026-09-29 research. The
  orchestrator's `pulumi preview` run on this folder dispatched every
  resource constructor, including this one, without a Python
  keyword-argument `TypeError` -- the SDK raises that immediately and
  synchronously if a property name is wrong, before any network call --
  which is real but partial evidence: it rules out a wrong kwarg name, not
  a wrong value or a missing required property that the provider itself
  would reject. Preview then failed on missing `az` credentials before any
  resource reached the provider. Run `pulumi package info azure-native
  --module cognitiveservices --resource ProjectConnection` against a real
  tenant and trust it over this file if they disagree.
- **`FileSearchToolDefinition(connection_names=[...])`**: best-current-
  knowledge guess at the SDK's tool-definition class and its constructor
  shape for a connection-based file-search tool. `agent_with_tool.py`
  compiles and imports cleanly against the pinned `azure-ai-projects`
  release (`python -m compileall`, run by the orchestrator), which confirms
  the class exists with this name at this version but not that its fields
  are the ones used here. Inspect `azure.ai.projects.models` against a real
  tenant and correct the class name/fields if it disagrees -- see the brief.
- **`delete_version(..., agent_version="2")`**: assumes this folder's
  `create_version` call is always the *second* version created against
  the agent name (version 1 comes from `03-agent`). Holds only if
  teardown runs in folder order (04 before 03); flagged in
  `03-agent/AGENTS.md` too since both scripts share the assumption.
- **Package pins**: `pulumi-azure-native==3.28.0`, `azure-ai-projects==2.7.0`,
  `azure-identity==1.25.3` -- the latter two confirmed as current PyPI
  releases via `pip index versions` on 2026-09-29 (network access worked
  from this build workstation). `pulumi-command>=1.0.0,<2.0.0` matches the
  floor/ceiling convention of the root `pulumi>=3.0.0,<4.0.0` pin (current
  release 1.2.1 as of the same check).
- **Storage resource shapes** (`StorageAccount`'s `kind`/`sku`/
  `allow_shared_key_access`, `BlobContainer`'s `public_access`, `Blob`'s
  `type`): best-current-knowledge from general azure-native SDK
  conventions, not verified against the installed provider schema this
  run -- same "orchestrator verifies with `pulumi preview`" caveat as the
  `ProjectConnection` shape above.

## How to work here

- This folder never runs `az` CLI commands from this build workstation (no
  `az` binary here, and none installable in this read-only venv). A
  presenter's real run resolves `DefaultAzureCredential` via their local
  `az login` session; nothing here was executable against a live Azure
  tenant during this build.

## Verification

- `python3 -m py_compile __main__.py agent_with_tool.py`
