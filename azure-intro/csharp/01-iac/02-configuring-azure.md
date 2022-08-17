# Configuring Azure

Now that you have a basic project, let's configure Azure support for it.

## Step 1 &mdash; Install the Azure Package

Run the following command to install the Azure package:

```bash
dotnet add package Pulumi.Azure
```

The package will be added to `csproj` and the binaries will be restored.

## Step 2 &mdash; Use the Azure Package

Now that the Azure package is installed, add the following line to `MyStack.cs` to import it:

```cs
...
using Azure = Pulumi.Azure;
...
```

> :white_check_mark: After this change, your `MyStack.cs` should [look like this](./code/02-configuring-azure/step2.cs).

## Step 3 &mdash; Configure an Azure Region

Configure the Azure region you would like to deploy to:

```bash
pulumi config set azure:location westus2
```

Feel free to choose any Azure region that supports the services used in these labs ([see this infographic](https://azure.microsoft.com/en-us/global-infrastructure/regions/) for a list of available regions).

The command persists the value to the local `Pulumi.dev.yaml` file. You can view or edit this file at any time to effect the configuration of the current stack.

## Step 4 &mdash; Login to Azure

Simply login to the Azure CLI and Pulumi will automatically use your credentials:

```
az login
...
You have logged in. Now let us find all the subscriptions to which you have access...
...
```

The Azure CLI, and thus Pulumi, will use the Default Subscription by default, however it is possible to override the subscription, by simply setting your subscription ID to the id output from `az account list`’s output:

```
$ az account list
```

Pick out the `<id>` from the list and run:

```
$ az account set --subscription=<id>
```

## Next Steps

* [Provisioning a Resource Group](./03-provisioning-infrastructure.md)
