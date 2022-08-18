using Pulumi;
using Pulumi.Serialization;
using Azure = Pulumi.Azure;

class MyStack : Stack
{
    public MyStack()
    {
        var resourceGroup = new Azure.Core.ResourceGroup("my-group");

        var storageAccount = new Azure.Storage.Account("mystorage", new Azure.Storage.AccountArgs
        {
            ResourceGroupName = resourceGroup.Name,
            AccountReplicationType = "LRS",
            AccountTier = "Standard"
        });

        this.AccountName =  storageAccount.Name;
    }

    [Output]
    public Output<string> AccountName { get; set; }
}
