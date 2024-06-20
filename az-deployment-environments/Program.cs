using Pulumi;
using Pulumi.AzureNative.App;
using Pulumi.AzureNative.App.Inputs;
using System.Collections.Generic;

return await Deployment.RunAsync(() =>
{
    var config = new Config();
    
    // Get the resource group name provisioned by ADE.
    var resourceGroupName = config.Require("resource-group-name");

    // Read the container image name parameter.
    var imageName = config.Require("image");

    var managedEnv = new ManagedEnvironment("env", new ManagedEnvironmentArgs
    {
        ResourceGroupName = resourceGroupName
    });
    
    var containerApp = new ContainerApp("app", new()
    {
        ResourceGroupName = resourceGroupName,
        ManagedEnvironmentId = managedEnv.Id,
        Configuration = new ConfigurationArgs
        {
            Ingress = new IngressArgs
            {
                External = true,
                TargetPort = 80
            },
        },
        Template = new TemplateArgs
        {
            Containers = 
            {
                new ContainerArgs
                {
                    Name = "myapp",
                    Image = imageName,
                }
            }
        }
    });

    // Return outputs.
    return new Dictionary<string, object?>{
        ["url"] = Output.Format($"https://{containerApp.Configuration.Apply(c => c!.Ingress).Apply(i => i!.Fqdn)}")
    };
});
