# Provisioning Infrastructure

Now that you have a project configured to use Azure, you'll create some basic infrastructure in it. We will start with a Resource Group.

## Step 1 &mdash; Declare a New Resource Group

Edit your `__main__.py` file, and leave only a new resource definition and required dependencies. Change the name of the resource group to 'my-group':

```python
import pulumi
from pulumi_azure import core, storage

# Create an Azure Resource Group
resource_group = core.ResourceGroup('my-group')
```

> :white_check_mark: After this change, your `__main__.py` should [look like this](./code/03-provisioning-infrastructure/step1.).

## Step 2 &mdash; Preview Your Changes

Now preview your changes:

```
pulumi up
```

This command evaluates your program, determines the resource updates to make, and shows you an outline of these changes:

```
Previewing update (dev):

     Type                         Name              Plan
 +   pulumi:pulumi:Stack          iac-workshop-dev  create
 +   └─ azure:core:ResourceGroup  my-group          create

Resources:
    + 2 to create

Do you want to perform this update?
  yes
> no
  details
```

This is a summary view. Select `details` to view the full set of properties:

```
+ pulumi:pulumi:Stack: (create)
    [urn=urn:pulumi:dev::iac-workshop::pulumi:pulumi:Stack::iac-workshop-dev]
    + azure:core/resourceGroup:ResourceGroup: (create)
        [urn=urn:pulumi:dev::iac-workshop::azure:core/resourceGroup:ResourceGroup::my-group]
        [provider=urn:pulumi:dev::iac-workshop::pulumi:providers:azure::default_1_12_0::04da6b54-80e4-46f7-96ec-b56ff0333aa9]
        location  : "westus2"
        name      : "my-groupfa48c889"

Do you want to perform this update?
  yes
> no
  details
```

The stack resource is a synthetic resource that all resources your program creates are parented to.

## Step 3 &mdash; Deploy Your Changes

Now that we've seen the full set of changes, let's deploy them. Select `yes`:

```
Updating (dev):

     Type                         Name              Status
 +   pulumi:pulumi:Stack          iac-workshop-dev  created
 +   └─ azure:core:ResourceGroup  my-group          created

Resources:
    + 2 created

Duration: 8s

Permalink: https://app.pulumi.com/myuser/iac-workshop/dev/updates/1
```

Now your resource group has been created in your Azure account. Feel free to click the Permalink URL and explore; this will take you to the [Pulumi Console](https://www.pulumi.com/docs/intro/console/), which records your deployment history.

Note that Pulumi appends a suffix to the physical name of the resource group, e.g. `my-groupfa42c229`. The difference between logical and physical names is due to "auto-naming" which Pulumi does to ensure side-by-side projects and zero-downtime upgrades work seamlessly. It can be disabled if you wish; [read more about auto-naming here](https://www.pulumi.com/docs/intro/concepts/programming-model/#autonaming).

## Next Steps

* [Updating Your Infrastructure](./04-updating-your-infrastructure.md)
