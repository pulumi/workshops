# Configuring Azure

Now that you have a basic project, let's set up your environemnt, and configure Azure support for it.

## Step 1 &mdash; Create a virtual environment and install python dependencies
Creation of a virtual environment can vary between operating systems - see the [Azure Quickstart](https://www.pulumi.com/docs/get-started/azure/review-project/) for more information.

### Windows
Run the following command to create a virtual environment
```bash
python -m venv venv
```

Activate the environment:
```bash
venv\Scripts\activate
```

Install dependencies:
```bash
pip3 install -r requirements.txt
```
### Mac and Linux
Run the following command to create a virtual environment
```bash
python3 -m venv venv
```

Activate the environment:
```bash
source venv/bin/activate
```

Install dependencies:
```bash
pip3 install -r requirements.txt
```

At this point, dependencies will be installed into your virtual environment. **If you close your terminal at any time**, you may need to re-activate the environment:
```bash
source venv/bin/activate
```

### Point to note
Going forward, instructions will refer to `python` for consistency, but if you are on mac or linux, use the appropriate `python3` command.

## Step 2 &mdash; Configure an Azure Region

The Azure region to deploy to is pre-set to WestUS - but you can modify the region you would like to deploy to:

```bash
pulumi config set azure:location westus2
```

Feel free to choose any Azure region that supports the services used in these labs ([see this infographic](https://azure.microsoft.com/en-us/global-infrastructure/regions/) for a list of available regions).

The command updates and persists the value to the local `Pulumi.dev.yaml` file. You can view or edit this file at any time to effect the configuration of the current stack.

## Step 3 &mdash; Login to Azure

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
