# Dad Joke Function App - Complete Tutorial

A step-by-step tutorial to build and deploy a serverless Azure Function that generates AI-powered dad jokes using Azure OpenAI.

## 🎯 What You'll Build

By the end of this tutorial, you'll have:
- A working Azure Function App with one HTTP endpoint
- AI-powered joke generation using Azure OpenAI
- Complete Azure infrastructure managed with Pulumi
- Pure Infrastructure as Code deployment

## 📋 Prerequisites

Before starting, install these tools:

```bash
# Install .NET 8
brew install --cask dotnet@8

# Install Azure CLI
brew install azure-cli

# Install Pulumi CLI
brew install pulumi
```

### Environment Setup

```bash
# Authenticate with Azure
az login

# Set DOTNET_ROOT for .NET 8 (add to ~/.zshrc permanently)
export DOTNET_ROOT=/opt/homebrew/Cellar/dotnet@8/8.0.120/libexec

# Verify installations
dotnet --version          # Should show 8.x
az --version             # Should show Azure CLI info
pulumi version           # Should show Pulumi version
```

## 🏗️ Step 1: Set Up Project Structure

Create the project directory structure:

```bash
mkdir c3-azure
cd c3-azure

# Create subdirectories
mkdir infrastructure function

# Initialize git repository
git init
```

## 🔧 Step 2: Build the Infrastructure (Pulumi)

### Create Infrastructure Project

```bash
cd infrastructure

# Initialize Pulumi project
pulumi new azure-csharp --name c3-azure --stack dev
# Follow prompts, set location to your preferred region (e.g., canadacentral)
```

### Configure Infrastructure Code

The infrastructure code sets up:
- Resource Group
- Storage Account for function packages
- Function App with Linux consumption plan
- Azure OpenAI integration
- Secure blob storage deployment

**Key features:**
- Zip-based deployment via blob storage
- Secure SAS URL generation
- Azure OpenAI endpoint configuration
- Linux .NET 8 isolated runtime

## 💻 Step 3: Build the Azure Function

The Azure Function code includes:
- `JokeFunctions.cs` - HTTP trigger function with single `/api/joke` endpoint
- `Program.cs` - Function app configuration with Azure OpenAI client setup
- `package.sh` - Convenient build and packaging script
- API key authentication for reliable OpenAI access
- Clean error handling and logging

## 🚀 Step 4: Deploy to Azure

### Prepare Function Package

Build and package the function code using the provided script:

```bash
cd function

# Use the package script to build and package
./package.sh
```

**This creates `bin/function-app.zip` that Pulumi will deploy automatically.**

### Pure Pulumi Deployment

Everything happens with one Pulumi command - no Azure CLI needed:

```bash
# Preview what will be created (infrastructure + function deployment)
pulumi preview

# Deploy infrastructure and function code together
pulumi up
# Type 'yes' when prompted

# Get the deployment outputs
pulumi stack output
```

**Expected Output:**
```
Current stack outputs (3):
    OUTPUT              VALUE
    functionAppUrl      https://dad-joke-function[hash].azurewebsites.net
    jokeEndpoint        https://dad-joke-function[hash].azurewebsites.net/api/joke
    openAIAccountName   dad-joke-openai[hash]
```

**What happens during deployment:**
1. ✅ Creates all Azure infrastructure (Function App, Storage, OpenAI)
2. ✅ Uploads `function-app.zip` to blob storage
3. ✅ Generates secure SAS URL for package access
4. ✅ Configures Function App to run from the package
5. ✅ Sets up Azure OpenAI endpoint configuration
6. ✅ Returns working endpoint URLs

**🎯 Pure Infrastructure as Code** - No manual deployment steps!

## 🧪 Step 5: Test Deployed Function

### Test the Live Endpoint

```bash
# Test the basic joke endpoint
curl "$(pulumi stack output jokeEndpoint)"

# Expected Response:
# {"joke":"Why did the scarecrow win an award? Because he was outstanding in his field!"}

# Test with keywords
curl "$(pulumi stack output jokeEndpoint)?keywords=cats"

# Expected Response:
# {"joke":"Why was the cat sitting on the computer? Because it wanted to keep an eye on the mouse!"}

# Test with programming keywords
curl "$(pulumi stack output jokeEndpoint)?keywords=programming"

# Expected Response:
# {"joke":"Why do programmers prefer dark mode? Because light attracts bugs!"}
```

### Quick Test Commands

```bash
# Get ready-to-use curl commands
echo "Joke endpoint: curl \"$(pulumi stack output jokeEndpoint)\""

# Test with keywords
echo "With keywords: curl \"$(pulumi stack output jokeEndpoint)?keywords=programming\""
```

## 📊 Step 6: Monitor and Observe

### View Function Logs

```bash
# View logs in Azure Portal
az webapp log tail --name $(pulumi stack output functionAppUrl | cut -d'/' -f3) --resource-group $(pulumi stack output --show-secrets | grep resourceGroup)
```

### Check Application Insights

1. Go to Azure Portal
2. Navigate to your resource group
3. Open Application Insights resource
4. View Live Metrics, Logs, and Performance data

## 🧹 Step 7: Clean Up

When you're done experimenting:

```bash
cd infrastructure
pulumi destroy
# Type 'yes' when prompted to delete all resources
```

## 🎯 What You've Accomplished

✅ **Pure Infrastructure as Code**: Complete Azure infrastructure with Pulumi
✅ **Zip-Based Deployment**: Function code deployed via blob storage + SAS URL
✅ **Linux Serverless Functions**: Modern .NET 8 isolated Azure Functions
✅ **AI Integration**: Azure OpenAI-powered joke generation
✅ **No Manual Steps**: Fully automated deployment without Azure CLI function commands
✅ **Clean Architecture**: Simple, focused function with one purpose

## 💰 Cost Breakdown

**Monthly costs for moderate usage (1K requests/day):**
- Azure Functions (Consumption): ~$1
- Storage Account: ~$1
- Azure OpenAI (gpt-4o-mini): ~$2-5
- Application Insights: Free tier

**Total: ~$4-7/month**

## 🔄 Next Steps

Consider adding:
- Web frontend interface
- Rate limiting per user/IP
- Multiple joke categories
- Slack/Teams integration webhooks
- Caching layer for performance
- CI/CD pipeline with GitHub Actions

## 🐛 Common Issues

**Deployment fails:**
- Ensure you're logged into Azure CLI (`az login`)
- Check you have Contributor permissions on the subscription
- Verify all required tools are installed

**Function returns errors:**
- Check Azure OpenAI resource is properly provisioned
- Verify API key authentication is working
- Check Application Insights logs for detailed error messages

**No jokes generated:**
- Verify Azure OpenAI deployment is active
- Check the gpt-4o-mini model is available in your region
- Function should return graceful error messages

## ⚠️ Local Development Limitations

**This architecture is designed for cloud-first development:**
- Local testing requires Azure OpenAI credentials
- No local fallbacks or mock responses
- Best tested directly in Azure after deployment

**For local development, you would need:**
- Azure OpenAI API key and endpoint configured locally
- Environment variables set for `AZURE_OPENAI_ENDPOINT` and `AZURE_OPENAI_API_KEY`
- Local debugging is possible with proper API key configuration

## 🔄 Complete Workflow Summary

Here's the entire deployment process from start to finish:

```bash
# 1. Build and package function code
cd function
./package.sh

# 2. Deploy everything with Pulumi
cd ../infrastructure
pulumi up --yes

# 3. Test the deployed function immediately
curl "$(pulumi stack output jokeEndpoint)"
curl "$(pulumi stack output jokeEndpoint)?keywords=azure"
```

**That's it!** Just 3 commands for complete deployment. The approach:
- ✅ **Pure Pulumi** - No Azure CLI function deployment needed
- ✅ **Zip-based deployment** - Upload to blob storage with SAS URL
- ✅ **Linux serverless** - Modern container-based Function Apps
- ✅ **WEBSITE_RUN_FROM_PACKAGE** - Secure, efficient code deployment
- ✅ **Infrastructure as Code** - Everything versioned and reproducible

## 🎯 Expected Results

After following the complete tutorial, you should have:

✅ **Deployed Azure Infrastructure**: Function App, Storage, Azure OpenAI resources

✅ **Live API Endpoint**:
- `https://[your-function-app].azurewebsites.net/api/joke`
- Support for `?keywords=programming` parameter

✅ **Full Functionality**: AI-powered jokes with keyword support

✅ **Pulumi Outputs**: Easy access to endpoints via `pulumi stack output`

---

🎉 **Congratulations!** You've built a complete serverless application with AI integration and infrastructure automation. This clean, focused pattern can be adapted for many other use cases!

Full pulumi program:
```
using Pulumi;
using Pulumi.AzureNative.Resources;
using Pulumi.AzureNative.Storage;
using Pulumi.AzureNative.Storage.Inputs;
using Pulumi.AzureNative.Web;
using Pulumi.AzureNative.Web.Inputs;
using Pulumi.AzureNative.CognitiveServices;
using System.Collections.Generic;
using System;

return await Pulumi.Deployment.RunAsync(() =>
{
    var rg = new ResourceGroup("dad-joke-rg");

    var stg = new StorageAccount("dadjokesa", new StorageAccountArgs
    {
        ResourceGroupName = rg.Name,
        Sku = new Pulumi.AzureNative.Storage.Inputs.SkuArgs { Name = SkuName.Standard_LRS },
        Kind = Kind.StorageV2,
        AllowBlobPublicAccess = false
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
        Sku = new Pulumi.AzureNative.CognitiveServices.Inputs.SkuArgs
        {
            Name = "S0"
        }
    });

    // GPT-4o-mini deployment
    var gptDeployment = new Pulumi.AzureNative.CognitiveServices.Deployment("gpt-4o-mini-deployment", new Pulumi.AzureNative.CognitiveServices.DeploymentArgs
    {
        AccountName = openAI.Name,
        ResourceGroupName = rg.Name,
        DeploymentName = "gpt-4o-mini",
        Properties = new Pulumi.AzureNative.CognitiveServices.Inputs.DeploymentPropertiesArgs
        {
            Model = new Pulumi.AzureNative.CognitiveServices.Inputs.DeploymentModelArgs
            {
                Format = "OpenAI",
                Name = "gpt-4o-mini",
                Version = "2024-07-18"
            },
            VersionUpgradeOption = Pulumi.AzureNative.CognitiveServices.DeploymentModelVersionUpgradeOption.OnceCurrentVersionExpired
        },
        Sku = new Pulumi.AzureNative.CognitiveServices.Inputs.SkuArgs
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
        Sku = new SkuDescriptionArgs { Name = "Y1", Tier = "Dynamic" }
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
        Source = new Pulumi.FileAsset("../function/bin/function-app.zip"),
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
                        var keys = await Pulumi.AzureNative.CognitiveServices.ListAccountKeys.InvokeAsync(new()
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
        ["openAIAccountName"] = openAI.Name
    };
});
```