using Pulumi;
using Pulumi.AzureNative.Resources;
using Pulumi.AzureNative.Storage;
using StorageInputs = Pulumi.AzureNative.Storage.Inputs;
using Pulumi.AzureNative.Web;
using Pulumi.AzureNative.Web.Inputs;
using Pulumi.AzureNative.CognitiveServices;
using CognitiveInputs = Pulumi.AzureNative.CognitiveServices.Inputs;
using CognitiveServices = Pulumi.AzureNative.CognitiveServices;
using System.Collections.Generic;
using System;

return await Pulumi.Deployment.RunAsync(() =>
{
    // Get stack name for resource tagging
    var stackName = Pulumi.Deployment.Instance.StackName;
    var commonTags = new Dictionary<string, string>
    {
        ["Owner"] = "v-adam@pulumi.com",
        ["Description"] = $"Azure workshop {stackName}",
        ["Environment"] = stackName,
        ["Project"] = "AzureCSharpWorkshop",
        ["ManagedBy"] = "Pulumi"
    };

    var rg = new ResourceGroup("dad-joke-rg", new ResourceGroupArgs
    {
        Location = "eastus",
        Tags = commonTags
    });

    var stg = new StorageAccount("dadjokesa", new StorageAccountArgs
    {
        ResourceGroupName = rg.Name,
        Sku = new StorageInputs.SkuArgs { Name = SkuName.Standard_LRS },
        Kind = Kind.StorageV2,
        AllowBlobPublicAccess = false,
        Tags = commonTags
    });

     // Connection string for Functions runtime
    var storageConn = Output.Tuple(rg.Name, stg.Name).Apply(async t =>
    {
        var (rgName, acctName) = t;
        var keys = await ListStorageAccountKeys.InvokeAsync(new ListStorageAccountKeysArgs
        {
            ResourceGroupName = rgName,
            AccountName = acctName
        });
        var key = keys.Keys[0].Value;
        return $"DefaultEndpointsProtocol=https;AccountName={acctName};AccountKey={key};EndpointSuffix=core.windows.net";
    });

    // Azure OpenAI (Cognitive Services)
    var openAI = new Account("dad-joke-openai", new AccountArgs
    {
        ResourceGroupName = rg.Name,
        Location = "eastus",
        Kind = "OpenAI",
        Sku = new CognitiveInputs.SkuArgs
        {
            Name = "S0"
        },
        Properties = new CognitiveInputs.AccountPropertiesArgs
        {
            PublicNetworkAccess = CognitiveServices.PublicNetworkAccess.Enabled
        },
        Tags = commonTags
    });

    // GPT-4o-mini deployment
    var gptDeployment = new CognitiveServices.Deployment("gpt-4o-mini-deployment", new CognitiveServices.DeploymentArgs
    {
        AccountName = openAI.Name,
        ResourceGroupName = rg.Name,
        DeploymentName = "gpt-4o-mini",
        Properties = new CognitiveInputs.DeploymentPropertiesArgs
        {
            Model = new CognitiveInputs.DeploymentModelArgs
            {
                Format = "OpenAI",
                Name = "gpt-4o-mini",
                Version = "2024-07-18"
            },
            VersionUpgradeOption = CognitiveServices.DeploymentModelVersionUpgradeOption.OnceCurrentVersionExpired
        },
        Sku = new CognitiveInputs.SkuArgs
        {
            Name = "Standard",
            Capacity = 10
        }
    });

    // Linux Consumption plan for Functions
    var plan = new AppServicePlan("dad-joke-plan", new AppServicePlanArgs
    {
        ResourceGroupName = rg.Name,
        Kind = "functionapp",
        Reserved = true,                  // IMPORTANT: Linux
        Sku = new SkuDescriptionArgs { Name = "Y1", Tier = "Dynamic" },
        Tags = commonTags
    });

    // Blob container to hold packages
    var container = new BlobContainer("packages", new BlobContainerArgs
    {
        AccountName = stg.Name,
        ResourceGroupName = rg.Name,
        PublicAccess = PublicAccess.None
    });

    // Upload function-app.zip to the container
    var packageBlob = new Blob("function-app.zip", new BlobArgs
    {
        AccountName = stg.Name,
        ResourceGroupName = rg.Name,
        ContainerName = container.Name,
        Type = BlobType.Block,
        Source = new FileAsset("../function/bin/function-app.zip"),
        ContentType = "application/zip",
    });

    // Build a SAS URL for the container so the app can fetch the zip
    var packageSasUrl = Output.Tuple(stg.Name, rg.Name, container.Name, packageBlob.Name).Apply(async t =>
    {
        var (acct, rgName, cont, blob) = t;
        var sas = await ListStorageAccountServiceSAS.InvokeAsync(new ListStorageAccountServiceSASArgs
        {
            AccountName = acct,
            ResourceGroupName = rgName,
            Protocols = HttpProtocol.Https,
            SharedAccessStartTime = "2024-01-01",
            SharedAccessExpiryTime = "2050-01-01",
            Resource = SignedResource.C,     // container
            Permissions = Permissions.R,     // read
            CanonicalizedResource = $"/blob/{acct}/{cont}",
            ContentType = "application/zip",
        });
        return $"https://{acct}.blob.core.windows.net/{cont}/{blob}?{sas.ServiceSasToken}";
    });

    // Function App (Linux, .NET 8 isolated)
    var app = new WebApp("dad-joke-function", new WebAppArgs
    {
        ResourceGroupName = rg.Name,
        ServerFarmId = plan.Id,
        Kind = "functionapp,linux",
        HttpsOnly = true,
        Tags = commonTags,
        SiteConfig = new SiteConfigArgs
        {
            LinuxFxVersion = "DOTNET-ISOLATED|8.0",
            AppSettings = new[]
            {
                new NameValuePairArgs { Name = "FUNCTIONS_EXTENSION_VERSION", Value = "~4" },
                new NameValuePairArgs { Name = "FUNCTIONS_WORKER_RUNTIME",   Value = "dotnet-isolated" },
                new NameValuePairArgs { Name = "AzureWebJobsStorage",        Value = storageConn },
                new NameValuePairArgs { Name = "WEBSITE_RUN_FROM_PACKAGE",   Value = packageSasUrl },
                // Azure OpenAI configuration
                new NameValuePairArgs { Name = "AZURE_OPENAI_ENDPOINT", Value = openAI.Properties.Apply(p => p.Endpoint!) },
                new NameValuePairArgs {
                    Name = "AZURE_OPENAI_API_KEY",
                    Value = Output.Tuple(rg.Name, openAI.Name).Apply(async t => {
                        var (rgName, acctName) = t;
                        var keys = await CognitiveServices.ListAccountKeys.InvokeAsync(new()
                        {
                            ResourceGroupName = rgName,
                            AccountName = acctName
                        });
                        return keys.Key1!;
                    })
                },
            },
            Http20Enabled = true,
        }
    });

    // Using API key authentication for OpenAI access

    return new Dictionary<string, object?>
    {
        ["functionAppUrl"] = app.DefaultHostName.Apply(h => $"https://{h}"),
        ["jokeEndpoint"]   = app.DefaultHostName.Apply(h => $"https://{h}/api/joke"),
    };
});