using Pulumi;
using Azure = Pulumi.AzureNative;
using Pulumi.AzureNative.Resources;
using Pulumi.AzureNative.Storage;
using Pulumi.AzureNative.Storage.Inputs;
class MyStack : Stack
{
    public MyStack()
    {
        // Add your resources here
        // Create an Azure Resource Group
        var resourceGroup = new ResourceGroup("myrgroup");
        // Export the resource group name
        this.resourcegroup_name = resourceGroup.Name;

        // Create an Azure resource (Storage Account)
        var storageAccount = new StorageAccount("mystorageact", new StorageAccountArgs
        {
            ResourceGroupName = resourceGroup.Name,
            Sku = new SkuArgs
            {
                Name = SkuName.Standard_LRS
            },
            Kind = Kind.StorageV2
        });
        // Export the Storage Account Name
        this.AccountName =  storageAccount.Name;
    }
    // Add Outputs here
    [Output("resourcegroup_name")] public Output<string> resourcegroup_name { get; set; }
    [Output("AccountName")] public Output<string> AccountName { get; set; }
}