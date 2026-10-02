using Pulumi;
using Pulumi.AzureNative.Insights;
using Pulumi.AzureNative.Resources;
using Pulumi.AzureNative.Sql;
using Pulumi.AzureNative.Storage;
using Pulumi.AzureNative.Storage.Inputs;
using Pulumi.AzureNative.Web;
using Pulumi.AzureNative.Web.Inputs;

class StackRefsApp: Stack
{
    public StackRefsApp()
    {
        var config = new Config();
        var baseName = config.Require("baseName");
        var username = config.Get("sqlAdmin") ?? "pulumi";
        var password = config.RequireSecret("sqlPassword");

        var blob = new Blob($"{baseName}-appservice-blob", new BlobArgs
        {
            ResourceGroupName = ResourceGroupName,
            AccountName = StorageAccountName,
            ContainerName = StorageContainerName,
            Type = BlobType.Block,
            Source = new FileArchive("wwwroot"),
        });

        var codeBlobUrl = SignedBlobReadUrl(blob.Name, StorageContainerName, StorageAccountName, ResourceGroupName);

        var app = new WebApp($"{baseName}-app", new WebAppArgs
        {
            ResourceGroupName = ResourceGroupName,
            ServerFarmId = AppServicePlanId,
            SiteConfig = new SiteConfigArgs
            {
                AppSettings = {
                    new NameValuePairArgs{
                        Name = "WEBSITE_RUN_FROM_PACKAGE",
                        Value = codeBlobUrl,
                    },
                    new NameValuePairArgs{
                        Name = "APPINSIGHTS_INSTRUMENTATIONKEY",
                        Value = AppInsightsInstrumentationKey
                    },
                    new NameValuePairArgs{
                        Name = "APPLICATIONINSIGHTS_CONNECTION_STRING",
                        Value = AppInsightsInstrumentationKey.Apply(key => $"InstrumentationKey={key}"),
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
                        ConnectionString = SqlConnectionString,
                    },
                },
            }
        });

        this.Endpoint = Output.Format($"https://{app.DefaultHostName}");
    }

    private static Output<string> SignedBlobReadUrl(Output<string> blobName, Output<string> containerName, Output<string> accountName, Output<string> resourceGroupName)
    {
        var serviceSasToken = ListStorageAccountServiceSAS.Invoke(new ListStorageAccountServiceSASInvokeArgs
        {
            AccountName = accountName,
            Protocols = HttpProtocol.Https,
            SharedAccessStartTime = "2021-01-01",
            SharedAccessExpiryTime = "2030-01-01",
            Resource = SignedResource.C,
            ResourceGroupName = resourceGroupName,
            Permissions = Permissions.R,
            CanonicalizedResource = Output.Format($"/blob/{accountName}/{containerName}"),
            ContentType = "application/json",
            CacheControl = "max-age=5",
            ContentDisposition = "inline",
            ContentEncoding = "deflate",
        }).Apply(blobSAS => blobSAS.ServiceSasToken);

        return Output.Format($"https://{accountName}.blob.core.windows.net/{containerName}/{blobName}?{serviceSasToken}");
    }

    [Output] public Output<string> Endpoint { get; set; }
}
