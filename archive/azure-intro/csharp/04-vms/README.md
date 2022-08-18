# Provisioning Virtual Machines

In this lab, you'll create a single Azure Virtual Machine (VM)that serves HTTP on its public IP and port.

> This lab assumes you have a project set up and configured to use Azure. If you don't yet, please complete labs [1](../01-iac/01-creating-a-new-project.md), [2](../01-iac/02-configuring-azure.md) and [3](../01-iac/03-provisioning-infrastructure.md) first.

If you haven't created a stack yet, run `pulumi config set azure:location westus --stack dev` to create a stack called `dev` and to set your Azure region.

Start with a program which defines a single resource: a Resource Group.

> :white_check_mark: Your initial `MyStack.cs` should [look like this](../01-iac/code/03-provisioning-infrastructure/step1.cs).

## Step 1 &mdash; Declare the VM

First, create a Virtual Network to contain our future VM. Import the namespaces

```csharp
using Pulumi.Azure.Compute;
using Pulumi.Azure.Compute.Inputs;
using Pulumi.Azure.Network;
using Pulumi.Azure.Network.Inputs;
```

And add a Virtual Network with one subnet to your stack constructor:

```csharp
var network = new VirtualNetwork("server-network", new VirtualNetworkArgs
{
    ResourceGroupName = resourceGroup.Name,
    AddressSpaces = { "10.0.0.0/16" },
    Subnets =
    {
        new VirtualNetworkSubnetsArgs
        {
            Name = "default",
            AddressPrefix = "10.0.1.0/24"
        }
    },
});
```

To make our future VM publicly accessible, allocate a Public IP and a Network Interface resources:

```csharp
var publicIp = new PublicIp("server-ip", new PublicIpArgs
{
    ResourceGroupName = resourceGroup.Name,
    AllocationMethod = "Dynamic",
});

var networkInterface = new NetworkInterface("server-nic", new NetworkInterfaceArgs
{
    ResourceGroupName = resourceGroup.Name,
    IpConfigurations =
    {
        new NetworkInterfaceIpConfigurationsArgs
        {
            Name = "webserveripcfg",
            SubnetId = network.Subnets.Apply(subnets => subnets[0].Id),
            PrivateIpAddressAllocation = "Dynamic",
            PublicIpAddressId = publicIp.Id,
        },
    }
});
```

Now it's time to create a sample Ubuntu server. Notice it has a startup script that spins up a simple Python webserver:

```csharp
var vm = new VirtualMachine("server-vm", new VirtualMachineArgs
{
    ResourceGroupName = resourceGroup.Name,
    NetworkInterfaceIds = { networkInterface.Id },
    VmSize = "Standard_A0",
    DeleteDataDisksOnTermination = true,
    DeleteOsDiskOnTermination = true,
    OsProfile = new VirtualMachineOsProfileArgs
    {
        ComputerName = "hostname",
        AdminUsername = "testadmin",
        AdminPassword = "NotARealPassword123!",
        CustomData = 
@"#!/bin/bash
echo ""Hello, World!"" > index.html
nohup python -m SimpleHTTPServer 80 &",
    },
    OsProfileLinuxConfig = new VirtualMachineOsProfileLinuxConfigArgs
    {
        DisablePasswordAuthentication = false,
    },
    StorageOsDisk = new VirtualMachineStorageOsDiskArgs
    {
        CreateOption = "FromImage",
        Name = "myosdisk1",
    },
    StorageImageReference = new VirtualMachineStorageImageReferenceArgs
    {
        Publisher = "canonical",
        Offer = "UbuntuServer",
        Sku = "16.04-LTS",
        Version = "latest",
    }
});
```

> For most real-world applications, you would want to create a dedicated image for your application, rather than embedding the script in your code like this.

> :white_check_mark: After this change, your `MyStack.cs` should [look like this](./code/step1.cs).

## Step 2 &mdash; Retrieve the Public IP Address

We need to retrieve the actual public IP address that gets associated with the new VM. The IP doesn't get automatically assigned to the `PublicIP` resource: the public IP address is allocated only when the VM is up and running. We need to wait until that moment and *query* for the address. That's a good opportunity to learn some new concepts and techniques.

Pulumi's Azure provider comes with a number of methods that you can invoke. In your case, we need to call the `Pulumi.Azure.Network.Invokes.GetPublicIP` function. The function arguments need the name of the resource group and the name of the Public IP resources. Moreover, we should invoke only after the VM is ready.

We will use the concept of **outputs** with `Apply` and `Tuple` methods. An output is a value which gets resolved after a resource is created. `Apply` allows to run artitrary code whenever this resolution occurs. `Tuple` enables combining multiple outputs and using their values when all of them are known.

> You can learn more about outputs and related programming concepts [here](https://www.pulumi.com/docs/intro/concepts/programming-model/#outputs).

Declare an output property for your stack:

```csharp
[Output]
public Output<string> PublicIP { get; set; }
```

Add the following code snippet at the end of your stack constructor:

```csharp
// The public IP address is not allocated until the VM is running, so wait for that
// resource to create, and then lookup the IP address again to report its public IP.
this.PublicIP = Output
    .Tuple<string, string, string>(vm.Id, publicIp.Name, resourceGroup.Name)
    .Apply<string>(async t => {
        (_, string name, string resourceGroupName) = t;
        var ip = await Pulumi.Azure.Network.Invokes.GetPublicIP(
            new GetPublicIPArgs{ Name = name, ResourceGroupName = resourceGroupName });
        return ip.IpAddress;
    });
```

Study the way `Tuple` and `Apply` functions are used.

> :white_check_mark: After this change, your `MyStack.cs` should [look like this](./code/step2.cs).

## Step 3 &mdash; Provision the VM and Access It

To provision the VM, run:

```bash
pulumi up
```

After confirming, you will see output like the following:

```
Updating (dev):

     Type                               Name              Status
 +   pulumi:pulumi:Stack                iac-workshop-dev  created
 +   ├─ azure:core:ResourceGroup        my-group          created     
 +   ├─ azure:network:PublicIp          server-ip         created     
 +   ├─ azure:network:VirtualNetwork    server-network    created     
 +   ├─ azure:network:NetworkInterface  server-nic        created     
 +   └─ azure:compute:VirtualMachine    server-vm         created

Outputs:
    PublicIP: "52.57.250.206"

Resources:
    + 6 created

Duration: 3m12s

Permalink: https://app.pulumi.com/myuser/iac-workshop/dev/updates/1
```

To verify that our server is accepting requests properly, curl the IP address:

```bash
curl $(pulumi stack output PublicIP)
```

You should see a response from the Python webserver:

```
Hello, World!
```

## Step 4 &mdash; Destroy Everything

Finally, destroy the resources and the stack itself:

```
pulumi destroy
pulumi stack rm
```

## Next Steps

Congratulations! :tada: You have stood up an Azure VM and configured all the related networking configuration.

Next, choose amongst these labs:

* [Deploying Serverless Applications with Azure Functions](../02-serverless/README.md)
* [Deploying Containers to Azure Container Instances](../03-aci/README.md)
* [Deploying Containers to a Kubernetes Cluster](../05-kubernetes/README.md)

Or view the [suggested next steps](/#next-steps) after completing all labs.
