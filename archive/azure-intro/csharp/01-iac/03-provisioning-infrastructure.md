# Provisioning Infrastructure

Now that you have a project configured to use Azure, you'll create some basic infrastructure in it. We will start with a Resource Group.

## Step 1 &mdash; Declare a New Resource Group

Edit your `MyStack.cs` file to add a new `using` at the top of file under `using Azure=...`:

```csharp
...
using Pulumi.AzureNative.Resources;
```

Edit your `MyStack.cs` file to add a new resource definition inside `MyStack` constructor:

```csharp
...
public MyStack()
{   
    // Add your resources here
    // Create an Azure Resource Group
    var resourceGroup = new ResourceGroup("myrgroup");
}
```

> :white_check_mark: After this change, your `MyStack.cs` should [look like this](./code/03-provisioning-infrastructure/step1.cs).

## Step 2 &mdash; Preview Your Changes

Now preview your changes:

```
pulumi up
```

If you run into the followng issue when you run `pulumi up`: 

```bash
Unexpected Escape Sequence: ['\x1b' 'O']
```

run the following in your terminal:
`tput rmkx`
since there is a bug dotnet [bug](https://github.com/dotnet/sdk/issues/15243) related to this 


This command evaluates your program, determines the resource updates to make, and shows you an outline of these changes:

```
Previewing update (dev):

     Type                                     Name              Plan
 +   pulumi:pulumi:Stack                      iac-workshop-dev  create
 +   └─ azure-native:resources:ResourceGroup  my-group          create

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
    + azure-native:resources:ResourceGroup:: (create)
        [urn=urn:pulumi:dev::iac-workshop::azure-native:resources:ResourceGroup::my-group]
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

     Type                                       Name              Status
 +   pulumi:pulumi:Stack                      iac-workshop-dev  created
 +   └─ azure-native:resources:ResourceGroup  my-group          created

Resources:
    + 2 created

Duration: 8s

Permalink: https://app.pulumi.com/myuser/iac-workshop/dev/updates/1
```

## Step 4 &mdash; Export Your Resource Group Name

Programs can export variables which will be shown in the CLI and recorded for each deployment. Export your resource group's name by adding this output to `MyStack.cs` after the `{}` from the `public MyStack()`:

```csharp
...
// Add Outputs here
[Output("resourcegroupname")] public Output<string> resourcegroupname { get; set; }
```

Then inside your `MyStack` class, we can set the output variable:

```csharp
// Export the resource group name
this.resourcegroupname = resourceGroup.Name;
```

> :white_check_mark: After this change, your `MyStack.cs` should [look like this](./code/03-provisioning-infrastructure/step4.cs).

Now deploy the changes:

```bash
pulumi up
```

Notice a new `Outputs` section is included in the output containing the bucket's name:

```
...

Outputs:
  + resourcegroup_name: "myrgroup757c1c46"

Resources:
    2 unchanged

Duration: 6s

More information at: https://app.pulumi.com/shaht/my-iac-lab1-azure-csharp/dev
```

Now your resource group has been created in your Azure account. Feel free to click the Permalink URL and explore; this will take you to the [Pulumi Console](https://app.pulumi.com), which records your deployment history.

Note that Pulumi appends a suffix to the physical name of the resource group, e.g. `my-groupfa42c229`. The difference between logical and physical names is due to "auto-naming" which Pulumi does to ensure side-by-side projects and zero-downtime upgrades work seamlessly. It can be disabled if you wish; [read more about auto-naming here](https://www.pulumi.com/docs/intro/concepts/programming-model/#autonaming).

## Next Steps

* [Updating Your Infrastructure](./04-updating-your-infrastructure.md)
