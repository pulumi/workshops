using Pulumi;
using Pulumi.AzureNative.Insights;
using Pulumi.AzureNative.Resources;
using Pulumi.AzureNative.Sql;
using Pulumi.AzureNative.Storage;
using Pulumi.AzureNative.Storage.Inputs;
using Pulumi.AzureNative.Web;
using Pulumi.AzureNative.Web.Inputs;

class StackRefsBaseInfra: Stack
{
    public StackRefsBaseInfra()
    {
        var config = new Config();
        var baseName = config.Require("baseName");
        var username = config.Get("sqlAdmin") ?? "pulumi";
        var password = config.RequireSecret("sqlPassword");

        var resourceGroup = new ResourceGroup($"{baseName}-rg");

        var storageAccount = new StorageAccount($"{baseName}sa", new StorageAccountArgs
        {
            ResourceGroupName = resourceGroup.Name,
            Kind = "StorageV2",
            Sku = new SkuArgs
            {
                Name = SkuName.Standard_LRS,
            },
        });

        var appServicePlan = new AppServicePlan($"{baseName}-asp", new AppServicePlanArgs
        {
            ResourceGroupName = resourceGroup.Name,
            Kind = "App",
            Sku = new SkuDescriptionArgs
            {
                Tier = "Basic",
                Name = "B1",
            },
        });

        var container = new BlobContainer("zips", new BlobContainerArgs
        {
            AccountName = storageAccount.Name,
            PublicAccess = PublicAccess.None,
            ResourceGroupName = resourceGroup.Name,
        });

        var appInsights = new Component($"{baseName}-appInsights", new ComponentArgs
        {
            ApplicationType = "web",
            Kind = "web",
            ResourceGroupName = resourceGroup.Name,
        });

        var sqlServer = new Server($"{baseName}-sqlserver", new ServerArgs
        {
            ResourceGroupName = resourceGroup.Name,
            AdministratorLogin = username,
            AdministratorLoginPassword = password,
            Version = "12.0",
        });

        var database = new Database($"{baseName}-db", new DatabaseArgs
        {
            ResourceGroupName = resourceGroup.Name,
            ServerName = sqlServer.Name,
            Sku = new Pulumi.AzureNative.Sql.Inputs.SkuArgs
            {
                Name =  "S0"
            }
        });

        this.ResourceGroupName = resourceGroup.Name;
        this.DbUserName = Output.Format($"{username}");
        this.DbPassword = password;
        this.StorageAccountName = storageAccount.Name;
        this.StorageContainerName = container.Name;
        this.AppServicePlanId = appServicePlan.Id;
        this.AppInsightsInstrumentationKey = appInsights.InstrumentationKey;
        this.SqlConnectionString = Output.Format($"Server=tcp:{sqlServer.Name}.database.windows.net;initial catalog={database.Name};user ID={username};password={password};Min Pool Size=0;Max Pool Size=30;Persist Security Info=true;");
    }

    [Output] public Output<string> ResourceGroupName { get; set; }
    [Output] public Output<string> DbUserName { get; set; }
    [Output] public Output<string> DbPassword { get; set; }
    [Output] public Output<string> StorageAccountName {get; set; }
    [Output] public Output<string> StorageContainerName {get; set; }
    [Output] public Output<string> AppServicePlanId {get; set; }
    [Output] public Output<string> AppInsightsInstrumentationKey {get; set; }
    [Output] public Output<string> SqlConnectionString {get; set; }
}
