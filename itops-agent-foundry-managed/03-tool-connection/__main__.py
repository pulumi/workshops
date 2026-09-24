"""Step 3 - a real IT-ops data source, wired to the project with no static key.

The "real IT-ops tool or data source" the brief asks for is a storage
account holding the on-call runbook (a markdown file uploaded by the
demo's setup step) in a blob container. Resources:

1. A `storage.StorageAccount` + `storage.BlobContainer` ("runbooks").
2. A `authorization.RoleAssignment` granting the *project's* system-assigned
   managed identity (its `principal_id`, passed in as config from step 1's
   stack output) the built-in "Storage Blob Data Reader" role
   (2a2b9908-6ea1-4ae2-8e65-a410df84e7d1 - confirmed against
   learn.microsoft.com/azure/role-based-access-control/built-in-roles/storage,
   read 2026-09-24) on the storage account, scoped to the account only.
3. A `cognitiveservices.ProjectConnection` with `category="AzureBlob"` and
   `auth_type="AAD"`, pointing at the container. `AADAuthTypeConnectionPropertiesArgs`
   confirmed against pulumi.com/registry/packages/azure-native/api-docs/
   cognitiveservices/projectconnection/ (read 2026-09-24) - no key or
   connection string is generated or stored anywhere in this program.

Run `python upload_runbook.py` (a plain script, not part of the Pulumi
program) after `pulumi up` here to put a real runbook file in the
container; the exercise agent in step 4 reads it through this connection.
"""

import pulumi
from pulumi_azure_native import authorization, cognitiveservices, storage

config = pulumi.Config()
account_name = config.require("accountName")
project_name = config.require("projectName")
resource_group_name = config.get("resourceGroupName") or "rg-itops-agent-foundry-managed"
project_principal_id = config.require("projectPrincipalId")

STORAGE_ACCOUNT_NAME = "itopsagentrunbooks"
CONTAINER_NAME = "runbooks"
CONNECTION_NAME = "runbook-storage"

storage_account = storage.StorageAccount(
    "runbook-storage-account",
    account_name=STORAGE_ACCOUNT_NAME,
    resource_group_name=resource_group_name,
    kind=storage.Kind.STORAGE_V2,
    sku=storage.SkuArgs(name=storage.SkuName.STANDARD_LRS),
    allow_blob_public_access=False,
)

runbook_container = storage.BlobContainer(
    "runbooks-container",
    account_name=storage_account.name,
    container_name=CONTAINER_NAME,
    resource_group_name=resource_group_name,
    public_access=storage.PublicAccess.NONE,
)

blob_reader_role_assignment = authorization.RoleAssignment(
    "project-blob-reader-role-assignment",
    scope=storage_account.id,
    principal_id=project_principal_id,
    principal_type=authorization.PrincipalType.SERVICE_PRINCIPAL,
    role_definition_id=pulumi.Output.concat(
        "/providers/Microsoft.Authorization/roleDefinitions/",
        "2a2b9908-6ea1-4ae2-8e65-a410df84e7d1",
    ),
)

connection = cognitiveservices.ProjectConnection(
    "runbook-connection",
    account_name=account_name,
    project_name=project_name,
    connection_name=CONNECTION_NAME,
    resource_group_name=resource_group_name,
    properties=cognitiveservices.AADAuthTypeConnectionPropertiesArgs(
        auth_type="AAD",
        category=cognitiveservices.ConnectionCategory.AZURE_BLOB,
        target=pulumi.Output.concat(
            "https://", storage_account.name, ".blob.core.windows.net/", CONTAINER_NAME
        ),
        metadata={"ApiType": "Azure", "ResourceId": storage_account.id},
    ),
    opts=pulumi.ResourceOptions(depends_on=[blob_reader_role_assignment, runbook_container]),
)

pulumi.export("storageAccountName", storage_account.name)
pulumi.export("containerName", runbook_container.name)
pulumi.export("connectionName", connection.name)
