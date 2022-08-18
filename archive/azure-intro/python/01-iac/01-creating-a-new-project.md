# Creating a New Project

Infrastructure in Pulumi is organized into projects. Each project is a single program that, when run, declares the desired infrastructure for Pulumi to manage.

## Step 1 &mdash; Create a Directory

Each Pulumi project lives in its own directory. Create one now and change into it:

```bash
mkdir iac-workshop
cd iac-workshop
```

> Pulumi will use the directory name as your project name by default. To create an independent project, simply name the directory differently.

## Step 2 &mdash; Initialize Your Project

A Pulumi project is just a directory with some files in it. It's possible for you to create a new one by hand. The `pulumi new` command, however, automates the process:

```bash
pulumi new azure-python -y
```

This will print output similar to the following with a bit more information and status as it goes:

```
Created project 'iac-workshop'

Please enter your desired stack name.
Created stack 'dev'

Saved config

Your new project is ready to go! ✨
```

This command has created all the files we need, initialized a new stack named `dev` (an instance of our project), and written a requirements.txt file with the relevant python dependencies.

## Step 3 &mdash; Inspect Your New Project

Our project is comprised of multiple files:

* **`__main__.py`**: your Pulimi program and stack definition file
* **`Pulumi.yaml`**: your project's metadata, containing its name and language
* **`Pulumi.dev.yaml`**: the Azure configuration for the Pulumi dev stack
* **`requirements.txt`**: the python dependencies required from PyPy

Open `__main__.py` to see the contents of the template program of your infrastructure stack:

```python
import pulumi
from pulumi_azure import core, storage

# Create an Azure Resource Group
resource_group = core.ResourceGroup('resource_group')

# Create an Azure resource (Storage Account)
account = storage.Account('storage',
                          # The location for the storage account will be derived automatically from the resource group.
                          resource_group_name=resource_group.name,
                          account_tier='Standard',
                          account_replication_type='LRS')

# Export the connection string for the storage account
pulumi.export('connection_string', account.primary_connection_string)

```

Feel free to explore the other files, although we won't be editing any of them by hand.

# Next Steps

* [Configuring Azure](./02-configuring-azure.md)
