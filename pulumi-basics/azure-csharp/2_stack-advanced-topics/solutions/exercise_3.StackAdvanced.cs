using Pulumi;
using Pulumi.AzureNative.Insights;
using Pulumi.AzureNative.Resources;
using Pulumi.AzureNative.Sql;
using Pulumi.AzureNative.Storage;
using Pulumi.AzureNative.Storage.Inputs;
using Pulumi.AzureNative.Web;
using Pulumi.AzureNative.Web.Inputs;

class Ex3_StackAdvanced: Stack
{
    public Ex3_StackAdvanced()
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

        var blob = new Blob($"{baseName}-appservice-blob", new BlobArgs
        {
            ResourceGroupName = resourceGroup.Name,
            AccountName = storageAccount.Name,
            ContainerName = container.Name,
            Type = BlobType.Block,
            Source = new FileArchive("wwwroot"),
        });

        var codeBlobUrl = SignedBlobReadUrl(blob, container, storageAccount, resourceGroup);

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
                        Value = codeBlobUrl,
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

        // This way does not work. It is included to show the type of output one gets when trying this.
        this.EndpointBad = Output.Create("http://"+app.DefaultHostName);
        // Using "Apply" (or it's relative "All") is a surefire way to get to the raw value.
        this.EndpointApply = app.DefaultHostName.Apply(hostName => "http://"+hostName);
        // Using "Format" is a bit of syntactic sugar to make one's life easier.
        this.EndpointFormat = Output.Format($"http://{app.DefaultHostName}");

        this.ResourceGroupName = Output.CreateSecret(resourceGroup.Name);
        this.SqlServerPassword = password;
    }

    private static Output<string> SignedBlobReadUrl(Blob blob, BlobContainer container, StorageAccount account, ResourceGroup resourceGroup)
    {
        var serviceSasToken = ListStorageAccountServiceSAS.Invoke(new ListStorageAccountServiceSASInvokeArgs
        {
            AccountName = account.Name,
            Protocols = HttpProtocol.Https,
            SharedAccessStartTime = "2021-01-01",
            SharedAccessExpiryTime = "2030-01-01",
            Resource = SignedResource.C,
            ResourceGroupName = resourceGroup.Name,
            Permissions = Permissions.R,
            CanonicalizedResource = Output.Format($"/blob/{account.Name}/{container.Name}"),
            ContentType = "application/json",
            CacheControl = "max-age=5",
            ContentDisposition = "inline",
            ContentEncoding = "deflate",
        }).Apply(blobSAS => blobSAS.ServiceSasToken);

        return Output.Format($"https://{account.Name}.blob.core.windows.net/{container.Name}/{blob.Name}?{serviceSasToken}");
    }

    [Output] public Output<string> EndpointBad { get; set; }
    [Output] public Output<string> EndpointApply { get; set; }
    [Output] public Output<string> EndpointFormat { get; set; }
    [Output] public Output<string> ResourceGroupName { get; set; }
    [Output] public Output<string> SqlServerPassword { get; set; }
}
