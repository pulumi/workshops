using Pulumi;

using Azure = Pulumi.Azure;

class MyStack : Stack
{
    public MyStack()
    {
        var resourceGroup = new Azure.Core.ResourceGroup("my-group");

        var storageAccount = new Azure.Storage.Account("storage", new Azure.Storage.AccountArgs
        {
            ResourceGroupName = resourceGroup.Name,
            AccountReplicationType = "LRS",
            AccountTier = "Standard"
        });

        var plan = new Azure.AppService.Plan("asp", new Azure.AppService.PlanArgs
        {
            ResourceGroupName = resourceGroup.Name,
            Kind = "FunctionApp",
            Sku = new Azure.AppService.Inputs.PlanSkuArgs
            {
                Tier = "Dynamic",
                Size = "Y1"
            }
        });
    }
}
