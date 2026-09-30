"""Pulumi program: uploads sample runbooks, wires them into the Foundry
project as a connection, and re-creates the agent with a file-search tool
that references it.

Depends on `02-foundry-platform` (resource group, account, project) and
`03-agent` (the base agent) via `pulumi.StackReference`. See AGENTS.md for
the assumptions this file makes about both StackReference targets, the
storage account name, and the connection shape.
"""

import os

import pulumi
import pulumi_azure_native as azure_native
import pulumi_command as command

config = pulumi.Config()

# Assumptions: neither sibling folder existed yet when this one was built --
# see AGENTS.md.
platform_stack_name = config.get("platform_stack") or "organization/itops-foundry-platform/dev"
agent_stack_name = config.get("agent_stack") or "organization/itops-agent/dev"

platform = pulumi.StackReference(platform_stack_name)
agent_stack = pulumi.StackReference(agent_stack_name)

resource_group_name = platform.get_output("resource_group_name")
account_name = platform.get_output("account_name")
project_name = platform.get_output("project_name")
project_endpoint = platform.get_output("project_endpoint")
deployment_name = platform.get_output("deployment_name")
agent_name = agent_stack.get_output("agent_name")

# Storage account names are 3-24 lowercase-alphanumeric characters and
# globally unique across all of Azure -- override this default before
# running against a real subscription, since a generic demo name is very
# likely already taken. See AGENTS.md.
storage_account_name = config.get("storage_account_name") or "itopsrunbooksdemo"
container_name = config.get("container_name") or "runbooks"
connection_name = config.get("connection_name") or "runbooks-blob-connection"
location = config.get("location") or "eastus"

storage_account = azure_native.storage.StorageAccount(
    "runbooks-storage",
    resource_group_name=resource_group_name,
    account_name=storage_account_name,
    location=location,
    kind=azure_native.storage.Kind.STORAGE_V2,
    sku=azure_native.storage.SkuArgs(name=azure_native.storage.SkuName.STANDARD_LRS),
    # AAD-only access -- the connection and the agent read the container
    # through Azure AD, never a shared account key. See AGENTS.md.
    allow_shared_key_access=False,
)

container = azure_native.storage.BlobContainer(
    "runbooks-container",
    resource_group_name=resource_group_name,
    account_name=storage_account.name,
    container_name=container_name,
    public_access=azure_native.storage.PublicAccess.NONE,
    opts=pulumi.ResourceOptions(parent=storage_account),
)

runbooks_dir = os.path.join(os.path.dirname(__file__), "runbooks")
runbook_filenames = (
    "restart-service.md",
    "disk-space-cleanup.md",
    "network-outage-triage.md",
)
runbook_blobs = []
for filename in runbook_filenames:
    blob = azure_native.storage.Blob(
        f"runbook-{filename}",
        resource_group_name=resource_group_name,
        account_name=storage_account.name,
        container_name=container.name,
        blob_name=filename,
        type=azure_native.storage.BlobType.BLOCK,
        source=pulumi.FileAsset(os.path.join(runbooks_dir, filename)),
        opts=pulumi.ResourceOptions(parent=container),
    )
    runbook_blobs.append(blob)

container_url = pulumi.Output.concat(
    "https://", storage_account.name, ".blob.core.windows.net/", container.name,
)

project_connection = azure_native.cognitiveservices.ProjectConnection(
    "runbooks-connection",
    resource_group_name=resource_group_name,
    account_name=account_name,
    project_name=project_name,
    connection_name=connection_name,
    properties=azure_native.cognitiveservices.ConnectionPropertiesArgs(
        category="AzureBlob",
        target=container_url,
        auth_type="AAD",
        is_shared_to_all_projects=False,
    ),
    opts=pulumi.ResourceOptions(depends_on=runbook_blobs),
)

script_path = os.path.join(os.path.dirname(__file__), "agent_with_tool.py")

agent_tool_lifecycle = command.local.Command(
    "it-ops-agent-tool",
    create=pulumi.Output.concat(
        "python3 ", script_path,
        " create --endpoint '", project_endpoint,
        "' --agent-name '", agent_name,
        "' --deployment '", deployment_name,
        "' --connection-name '", project_connection.name, "'",
    ),
    delete=pulumi.Output.concat(
        "python3 ", script_path,
        " delete --endpoint '", project_endpoint,
        "' --agent-name '", agent_name, "'",
    ),
    triggers=[project_connection.name, project_connection.id, agent_name, deployment_name],
)

pulumi.export("connection_name", project_connection.name)
pulumi.export("storage_account_name", storage_account.name)
pulumi.export("container_name", container.name)
