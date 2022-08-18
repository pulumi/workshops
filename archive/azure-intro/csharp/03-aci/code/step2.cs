using Pulumi;
using Pulumi.Serialization;

using Azure = Pulumi.Azure;
using Pulumi.Azure.ContainerService;
using Pulumi.Azure.ContainerService.Inputs;

class MyStack : Stack
{
    public MyStack()
    {
        var resourceGroup = new Azure.Core.ResourceGroup("my-group");

        var group = new Group("aci", new GroupArgs
        {
            ResourceGroupName = resourceGroup.Name,
            OsType = "Linux",
            Containers =
            {
                 new GroupContainersArgs
                 {
                    Cpu = 0.5,
                    Image = "mcr.microsoft.com/azuredocs/aci-helloworld",
                    Memory = 1.5,
                    Name = "hello-world",
                    Ports =
                    {
                        new GroupContainersPortsArgs
                        {
                            Port = 80,
                            Protocol = "TCP"
                        }
                    }
                }
            },
            IpAddressType = "public",
            DnsNameLabel = "my-unique-string"
        });

        this.Endpoint = Output.Format($"http://{group.Fqdn}");
    }

    [Output]
    public Output<string> Endpoint { get; set; }
}
