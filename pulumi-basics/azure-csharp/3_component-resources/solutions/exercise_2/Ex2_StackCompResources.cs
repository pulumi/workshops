using Pulumi;
using Pulumi.AzureNative.Insights;
using Pulumi.AzureNative.Resources;
using Pulumi.AzureNative.Sql;
using Pulumi.AzureNative.Storage;
using Pulumi.AzureNative.Web;
using Pulumi.AzureNative.Web.Inputs;

class Ex2_StackCompResources: Stack
{
    public Ex2_StackCompResources()
    {
        var config = new Config();
        var baseName = config.Require("baseName");
        var username = config.Get("sqlAdmin") ?? "pulumi";
        var password = config.RequireSecret("sqlPassword");

        var resourceGroup = new ResourceGroup($"{baseName}-rg");

        var storageInfra = new Ex2StorageInfra($"{baseName}", new Ex2StorageInfraArgs
        {
            ResourceGroupName = resourceGroup.Name,
        }, new ComponentResourceOptions { Protect = true });

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

        var app = new WebApp($"{baseName}-app", new WebAppArgs
        {
            ResourceGroupName = resourceGroup.Name,
            ServerFarmId = appServicePlan.Id,
            SiteConfig = new SiteConfigArgs
            {
                AppSettings = {
                    new NameValuePairArgs{
                        Name = "WEBSITE_RUN_FROM_PACKAGE",
                        Value = storageInfra.CodeBlobUrl,
                    },
                    new NameValuePairArgs{
                        Name = "APPINSIGHTS_INSTRUMENTATIONKEY",
                        Value = appInsights.InstrumentationKey
                    },
                    new NameValuePairArgs{
                        Name = "APPLICATIONINSIGHTS_CONNECTION_STRING",
                        Value = appInsights.InstrumentationKey.Apply(key => $"InstrumentationKey={key}"),
                    },
                    new NameValuePairArgs{
                        Name = "ApplicationInsightsAgent_EXTENSION_VERSION",
                        Value = "~2",
                    },
                },
                ConnectionStrings = {
                    new ConnStringInfoArgs
                    {
                        Name = $"{baseName}-db",
                        Type = ConnectionStringType.SQLAzure,
                        ConnectionString = Output.Tuple<string, string, string>(sqlServer.Name, database.Name, password).Apply(t =>
                        {
                            (string server, string database, string pwd) = t;
                            return
                                $"Server= tcp:{server}.database.windows.net;initial catalog={database};userID={username};password={pwd};Min Pool Size=0;Max Pool Size=30;Persist Security Info=true;";
                        }),
                    },
                },
            }
        });

        this.Endpoint=  Output.Format($"http://{app.DefaultHostName}");
        this.ResourceGroupName = resourceGroup.Name;
    }

    [Output] public Output<string> Endpoint { get; set; }
    [Output] public Output<string> ResourceGroupName { get; set; }
}
