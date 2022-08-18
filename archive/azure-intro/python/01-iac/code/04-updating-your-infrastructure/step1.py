import pulumi
from pulumi_azure import core, storage

# Create an Azure Resource Group
resource_group = core.ResourceGroup('my-group')

storage_account = storage.Account('mystorage',
    resource_group_name=resource_group.name,
    account_tier='Standard',
    account_replication_type='LRS')