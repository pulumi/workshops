# Updating Your Infrastructure

We just saw how to create new infrastructure from scratch. Next, let's add an Azure Storage Account to the existing resource group.

This demonstrates how declarative infrastructure as code tools can be used not just for initial provisioning, but also subsequent changes to existing resources.

## Step 1 &mdash; Add a Storage Account

Edit your `MyStack.cs` file to add a new `using` at the top of file under `using Pulumi.AzureNative.Resources;`:

```csharp
...
using Pulumi.AzureNative.Storage;
using Pulumi.AzureNative.Storage.Inputs; // This is needed for the SkuArgs
```

And then add these lines to `MyStack.cs` right after creating the resource group:

```csharp
...
// Create an Azure resource (Storage Account)
    var storageAccount = new StorageAccount("mystorageact", new StorageAccountArgs
    {
        ResourceGroupName = resourceGroup.Name,
        Sku = new SkuArgs
        {
            Name = SkuName.Standard_LRS
        },
        Kind = Kind.StorageV2
    });
...
```

> :white_check_mark: After these changes, your `MyStack.cs` should [look like this](./code/04-updating-your-infrastructure/step1.cs).

Deploy the changes:

```bash
pulumi up
```

This will give you a preview and selecting `yes` will apply the changes:

```
Updating (dev):

     Type                                       Name              Status
     pulumi:pulumi:Stack                     iac-workshop-dev
 +   └─ azure-native:storage:StorageAccount  mystorageact         created

Resources:
    + 1 created
    2 unchanged

Duration: 4s

Permalink: https://app.pulumi.com/myuser/iac-workshop/dev/updates/2
```

A single resource is added and the 2 existing resources are left unchanged. This is a key attribute of infrastructure as code &mdash; such tools determine the minimal set of changes necessary to update your infrastructure from one version to the next.

## Step 2 &mdash; Export Your New Storage Account Name

To inspect your new storage account, you will need its physical Azure name. Pulumi records a logical name, `mystorage`, however the resulting Azure name will be different.

Programs can export variables which will be shown in the CLI and recorded for each deployment. Export your storage account's name by by adding this output under the `Outputs` section in `MyStack.cs`:

```csharp
...
// Storage Account Name Output
[Output("AccountName")] public Output<string> AccountName { get; set; }
...
```

Then inside your `MyStack` class, we can set the output variable:

```csharp
// Export the Storage Account Name
this.AccountName =  storageAccount.Name;
```    

> :white_check_mark: After these changes, your `MyStack.cs` should [look like this](./code/04-updating-your-infrastructure/step2.cs).

Now deploy the changes:

```bash
pulumi up
```

Notice a new `Outputs` section is included in the output containing the account's name:

```
...

Outputs:
  + AccountName: "mystorage872202e3"

Resources:
    3 unchanged

Duration: 7s

Permalink: https://app.pulumi.com/myuser/iac-workshop/dev/updates/3
```

As we already learned, Pulumi generated a longer physical name for the Storage Account. Autonaming is very handy in our case: Each Storage Account receives a subdomain of `blob.core.windows.net`, therefore the name has to be globally unique across all Azure subscriptions worldwide. Instead of inventing such a name, we can trust Pulumi to generate one.

Also, we haven’t defined an explicit location for the Storage Account. By default, Pulumi inherits the location from the Resource Group. You can always override it with the `Location` property if needed.

## Step 3 &mdash; Inspect Your New Storage Account

Now run the `az` CLI to list the containers in this new account:

```
az storage container list --account-name $(pulumi stack output AccountName)
[]
```

Note that the account is currently empty. This is **EXPECTED**

## Step 4 &mdash; Add a BlobContainer to Your Storage Account

Add these lines to `MyStack.cs` right after creating the storage account itself:

```csharp
...
// Create a Blob Container
        var blobContainer = new BlobContainer("mycontainer", new BlobContainerArgs
        {
            ResourceGroupName= resourceGroup.Name,
            AccountName = storageAccount.Name,   
            ContainerName = "files",
        });
...
```

> :white_check_mark: After these changes, your `MyStack.cs` should [look like this](./code/04-updating-your-infrastructure/step4.cs).

Deploy the changes:

```bash
pulumi up
```

This will give you a preview and selecting `yes` will apply the changes:

```
Updating (dev):

     Type                                    Name              Status
     pulumi:pulumi:Stack                    iac-workshop-dev
 +   └─ azure-native:storage:BlobContainer  mycontainer         created (1s)

Resources:
    + 1 created
    3 unchanged

Duration: 9s

More information at:: https://app.pulumi.com/myuser/iac-workshop/dev/updates/4
```
## Step 5 &mdash; Export Your BlobContainer Name

Programs can export variables which will be shown in the CLI and recorded for each deployment. Export your blob container's name by adding this output to `MyStack.cs` after the `{}` from the `public MyStack()`:

```csharp
...
// Add Outputs here
[Output("ContainerName")] public Output<string> ContainerName { get; set; }
...
```

Then inside your `MyStack` class, we can set the output variable:

```csharp
...
// Export the BlobContainer Name
this.ContainerName = blobContainer.Name;
...
```

> :white_check_mark: After this change, your `MyStack.cs` should [look like this](./code/03-provisioning-infrastructure/step5.cs).

Now deploy the changes:

```bash
pulumi up
```

Finally, relist the contents of your account:

```bash
az storage container list --account-name $(pulumi stack output AccountName) -o table
Name    Lease Status    Last Modified
------  --------------  -------------------------
files   unlocked        2020-02-10T12:51:16+00:00
```

Notice that your `files` container has been added.

## Next Steps

* [Making Your Stack Configurable](./05-making-your-stack-configurable.md)
