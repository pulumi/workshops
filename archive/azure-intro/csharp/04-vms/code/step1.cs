using Pulumi;
using Pulumi.Serialization;

using Azure = Pulumi.Azure;
using Pulumi.Azure.Compute;
using Pulumi.Azure.Compute.Inputs;
using Pulumi.Azure.Network;
using Pulumi.Azure.Network.Inputs;

class MyStack : Stack
{
    public MyStack()
    {
        var resourceGroup = new Azure.Core.ResourceGroup("my-group");

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
    }
}
