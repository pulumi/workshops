# Deploying Serverless Applications with Azure Functions

In this lab, you will deploy a Azure Function Apps with HTTP-triggered serverless functions.

> This lab assumes you have a project set up and configured to use Azure. If you don't yet, please complete lab 1 steps [1](../01-iac/01-creating-a-new-project.md), [2](../01-iac/02-configuring-azure.md) and [3](../01-iac/03-provisioning-infrastructure.md) first.

If you haven't created a stack yet, run `pulumi config set azure:location westus --stack dev` to create a stack called `dev` and to set your Azure region (replace `westus` with the closest one).

Start with a program which defines a single resource: a Resource Group.

> :white_check_mark: Your initial `MyStack.cs` should [look like this](../01-iac/code/03-provisioning-infrastructure/step1.cs).

## Step 1 &mdash; Create a Storage Account

Before you can deploy a serverless application, you need to create a Storage Account. Every Azure Functions application requires a Storage Account for its internal needs.

Add the following code to your stack constructor:

```csharp
var storageAccount = new Azure.Storage.Account("storage", new Azure.Storage.AccountArgs
{
    ResourceGroupName = resourceGroup.Name,
    AccountReplicationType = "LRS",
    AccountTier = "Standard"
});
```

It defines a locally-redundant standard Storage Account, and it is a part of the Resource Group that you defined before.

> :white_check_mark: After these changes, your `MyStack.cs` should [look like this](./code/step1.cs).

## Step 2 &mdash; Define a Consumption Plan

There are several options to deploy Azure Functions. The serverless pay-per-execution hosting plan is called _Consumption Plan_.

There’s no resource named Consumption Plan, however. The resource name is inherited from Azure App Service: Consumption is one kind of an App Service Plan. It’s the SKU property of the resource that defines the type of hosting plan.

Here is the block that define a Consumption Plan:

```csharp
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
```

Note the specific way that the properties `Sku` and `Kind` are configured. If you ever want to deploy to another type of service plan, you would need to change these values accordingly.

> :white_check_mark: After these changes, your `MyStack.cs` should [look like this](./code/step2.cs).

## Step 3 &mdash; Create a Function App

Finally, it’s time to create the main component of our serverless application: the Function App. Define it with the following snippet:

```csharp
var app = new Azure.AppService.FunctionApp("fa", new Azure.AppService.FunctionAppArgs
{
    ResourceGroupName = /*TODO: reference the rg name*/,
    AppServicePlanId = /*TODO: reference the plan id*/,
    StorageConnectionString = /*TODO: reference the storage account's `PrimaryConnectionString`*/,
    Version = "~2",
    AppSettings =
    {
        { "FUNCTIONS_WORKER_RUNTIME", "node" },
        { "WEBSITE_NODE_DEFAULT_VERSION", "10.14.1" },
        { "WEBSITE_RUN_FROM_PACKAGE", "https://mikhailworkshop.blob.core.windows.net/zips/app.zip" }
    }
});
```

As an excercise, fill in the TODO blocks as the hints suggest.

The applications settings configure the app to run on Node.js v10 runtime and deploy the specified zip file to the Function App. The app will download the specified file, extract the code from it, discover the functions, and run them. We’ve prepared this zip file for you to get started faster, you can find its code [here](https://github.com/mikhailshilkov/mikhailio-hugo/tree/master/content/lab/materials/app). The code contains a single HTTP-triggered Azure Function.

You don’t need to configure application settings related to Azure Storage connections explicitly: the `StorageConnectionString` property takes care of this.

> :white_check_mark: After these changes, your `MyStack.cs` should [look like this](./code/step3.cs).

## Step 4 &mdash; Provision the Function App

Finally, declare a stack output called `Endpoint` to export the URL of the Azure Function using the `DefaultHostname` property of the Function App.

Define the stack property:

```csharp
[Output]
public Output<string> Endpoint { get; set; }
```

Now, if you inspect the type of the `app.DefaultHostname`, you will see that it's `Output<string>` not just `string`. That’s because Pulumi runs your program before it creates any infrastructure, and it wouldn’t be able to put an actual string into the variable. You can think of `Output<T>` as similar to `Task<T>`, although they are not the same thing.

You want to export the full endpoint of your Function App. The following line is NOT CORRECT:

```csharp
this.Endpoint = $"https://{app.DefaultHostname}/api/hello";
```

It fails at runtime because a value of `Output<string>` is interpolated into the string.

Instead, you should use one of the Pulumi’s helper functions:

```csharp
this.Endpoint = Output.Format($"https://{app.DefaultHostname}/api/hello");
```

> :white_check_mark: After these changes, your `MyStack.cs` should [look like this](./code/step4.cs).

## Step 5 &mdash; Provision the Function App

Deploy the program to stand up your Azure Function App:

```bash
pulumi up
```

This will output the status and resulting public URL:

```
Updating (dev):

     Type                                 Name              Status
 +   pulumi:pulumi:Stack                  iac-workshop-dev  created
 +   ├─ azure:core:ResourceGroup          my-group          created
 +   ├─ azure:storage:Account             storage           created
 +   ├─ azure:appservice:Plan             asp               created
 +   └─ azure:appservice:FunctionApp      fa                created

Outputs:
    Endpoint: "https://fabcd0bf8a.azurewebsites.net/api/hello"

Resources:
    + 5 created

Duration: 1m22s

Permalink: https://app.pulumi.com/myuser/iac-workshop/dev/updates/1
```

You can now open the resulting endpoint in the browser or curl it:

```bash
curl $(pulumi stack output Endpoint)
```

And you'll see a greeting message:

```
You've successfully deployed a Function App!
```

## Step 6 &mdash; Use Custom Application Code

Up until now, you haven’t touched the application code: you deployed the provided zip file. Let’s see how to start changing it.

Download the [zip file](https://mikhailworkshop.blob.core.windows.net/zips/app.zip). Create an `functions` folder inside your Pulumi’s working directory. Extract the contents of the zip file directly to the `functions` folder.

The folder contents should look like this now:

```
functions                            <-- extracted zip
functions/host.json                  <-- Functions host configuration
functions/local.settings.json
functions/hello                      <-- 'hello' function
functions/hello/function.json        <-- 'hello' bindings
functions/hello/index.js             <-- 'hello' JavaScript code
MyStack.cs
Program.cs
Pulumi.yaml
...other Pulumi and .NET files
```

Navigate to `functions/hello` folder and edit the code in the `index.js` file. For example, change the body assignment to

```
  body: "This is my code running in a Function App!",
```

Add the following lines before the `FunctionApp` definition in your stack to upload the Function files as an Azure Storage Blob.

```csharp
var container = new Azure.Storage.Container("zips", new Azure.Storage.ContainerArgs
{
    StorageAccountName = storageAccount.Name,
    ContainerAccessType = "private",
});


var blob = new Azure.Storage.Blob("zip", new Azure.Storage.BlobArgs
{
    StorageAccountName = storageAccount.Name,
    StorageContainerName = container.Name,
    Type = "Block",
    Source = new FileArchive("./functions"),
});

var codeBlobUrl = Azure.Storage.SharedAccessSignature.SignedBlobReadUrl(blob, storageAccount);
```

Change the `AppSettings` of the `FunctionApp` to point to the new blob:

```csharp
        { "WEBSITE_RUN_FROM_PACKAGE", codeBlobUrl }
```

> :white_check_mark: After these changes, your `MyStack.cs` should [look like this](./code/step6.cs).

## Step 7 &mdash; Redeploy to Run the Custom Code

Redeploy the program to upload your code and reconfigure your Azure Function App:

```bash
pulumi up
```

This will output the status and resulting public URL:

```
Updating (dev):

     Type                                      Name              Status
 +   pulumi:pulumi:Stack                       iac-workshop-dev  created
 +   ├─ azure:storage:Container       zips     created
 +   ├─ azure:storage:ZipBlob         zip      created
 ~   └─ azure:appservice:FunctionApp  fa       updated     [diff: ~appSettings]

Outputs:
    Endpoint: "https://fabcd0bf8a.azurewebsites.net/api/hello"

Resources:
    + 2 created
    ~ 1 updated
    3 changes. 4 unchanged

Duration: 26s

Permalink: https://app.pulumi.com/myuser/iac-workshop/dev/updates/2
```

You can now open the resulting endpoint in the browser or curl it:

```bash
curl $(pulumi stack output Endpoint)
```

And see your own message back:

```
This is my code running in a Function App!
```

## Step 8 &mdash; Destroy Everything

Finally, destroy the resources and the stack itself:

```
pulumi destroy
pulumi stack rm
```

## Next Steps

Congratulations! :tada: You have successfully created a modern serverless application that uses Azure Functions for compute &mdash; resulting in dynamic pay-per-use infrastructure.

Next, choose amongst these labs:

- [Deploying Containers to Azure Container Instances](../03-aci/README.md)
- [Provisioning Virtual Machines](../04-vms/README.md)
- [Deploying Containers to a Kubernetes Cluster](../05-kubernetes/README.md)

Or view the [suggested next steps](/#next-steps) after completing all labs.
