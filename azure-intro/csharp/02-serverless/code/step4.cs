using Pulumi;
using Pulumi.Serialization;

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

        var app = new Azure.AppService.FunctionApp("fa", new Azure.AppService.FunctionAppArgs
        {
            ResourceGroupName = resourceGroup.Name,
            AppServicePlanId = plan.Id,
            StorageConnectionString = storageAccount.PrimaryConnectionString,
            Version = "~2",
            AppSettings =
            {
                { "FUNCTIONS_WORKER_RUNTIME", "node" },
                { "WEBSITE_NODE_DEFAULT_VERSION", "10.14.1" },
                { "WEBSITE_RUN_FROM_PACKAGE", "https://mikhailworkshop.blob.core.windows.net/zips/app.zip" }
            }
        });

        this.Endpoint = Output.Format($"https://{app.DefaultHostname}/api/hello");
    }

    [Output]
    public Output<string> Endpoint { get; set; }
}
