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

        var registry = new Registry("registry", new RegistryArgs
        {
            ResourceGroupName = resourceGroup.Name,
            AdminEnabled = true,
            Sku = "Standard"
        });

        var dockerImage = new Pulumi.Docker.Image("node-app", new Pulumi.Docker.ImageArgs
        {
            ImageName = Output.Format($"{registry.LoginServer}/myapp"),
            Build = "./app",
            Registry = new Pulumi.Docker.ImageRegistry
            {
                Server = registry.LoginServer,
                Username = registry.AdminUsername,
                Password = registry.AdminPassword
            }
        });

        var group = new Group("aci", new GroupArgs
        {
            ResourceGroupName = resourceGroup.Name,
            OsType = "Linux",
            Containers =
            {
                new GroupContainersArgs
                {
                    Cpu = 0.5,
                    Image = dockerImage.ImageName,
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
            ImageRegistryCredentials =
            {
                new GroupImageRegistryCredentialsArgs
                {
                    Server = registry.LoginServer,
                    Username = registry.AdminUsername,
                    Password = registry.AdminPassword
                }
            },
            IpAddressType = "public",
            DnsNameLabel = "my-unique-name"
        }, new CustomResourceOptions { DeleteBeforeReplace = true });

        this.Endpoint = Output.Format($"http://{group.Fqdn}");
    }

    [Output]
    public Output<string> Endpoint { get; set; }
}
