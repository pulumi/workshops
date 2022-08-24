using System.Collections.Generic;
using Pulumi;
using Docker = Pulumi.Docker;

return await Deployment.RunAsync(() => 
{
    var config = new Config();
    var frontendPort = config.RequireNumber("frontendPort");
    var backendPort = config.RequireNumber("backendPort");
    var mongoPort = config.RequireNumber("mongoPort");
    var mongoHost = config.Require("mongoHost");
    var database = config.Require("database");
    var nodeEnvironment = config.Require("nodeEnvironment");
    var protocol = config.Require("protocol");
    var backendImageName = "backend";

    var frontendImageName = "frontend";

    var backendImage = new Docker.RemoteImage("backend-image", new()
    {
        Name = "pulumi/tutorial-pulumi-fundamentals-backend:latest",
    });

    var frontendImage = new Docker.RemoteImage("frontend-image", new()
    {
        Name = "pulumi/tutorial-pulumi-fundamentals-frontend:latest",
    });

    var mongoImage = new Docker.RemoteImage("mongo-image", new()
    {
        Name = "pulumi/tutorial-pulumi-fundamentals-database-local:latest",
    });

    var network = new Docker.Network("network", new()
    {
        Name = $"services-{Deployment.Instance.StackName}",
    });

    var mongoContainer = new Docker.Container("mongo-container", new()
    {
        Name = $"mongo-{Deployment.Instance.StackName}",
        Image = mongoImage.RepoDigest,
        Ports = new[]
        {
            new Docker.Inputs.ContainerPortArgs
            {
                Internal = mongoPort,
                External = mongoPort,
            },
        },
        NetworksAdvanced = new[]
        {
            new Docker.Inputs.ContainerNetworksAdvancedArgs
            {
                Name = network.Name,
                Aliases = new[]
                {
                    "mongo",
                },
            },
        },
    });

    var backendContainer = new Docker.Container("backend-container", new()
    {
        Name = $"backend-{Deployment.Instance.StackName}",
        Image = backendImage.RepoDigest,
        Ports = new[]
        {
            new Docker.Inputs.ContainerPortArgs
            {
                Internal = backendPort,
                External = backendPort,
            },
        },
        Envs = new[]
        {
            $"DATABASE_HOST={mongoHost}",
            $"DATABASE_NAME={database}",
            $"NODE_ENV={nodeEnvironment}",
        },
        NetworksAdvanced = new[]
        {
            new Docker.Inputs.ContainerNetworksAdvancedArgs
            {
                Name = network.Name,
                Aliases = new[]
                {
                    $"backend-{Deployment.Instance.StackName}",
                },
            },
        },
    }, new CustomResourceOptions
    {
        DependsOn = new[]
        {
            mongoContainer,
        },
    });

    var frontendContainer = new Docker.Container("frontend-container", new()
    {
        Name = $"frontend-{Deployment.Instance.StackName}",
        Image = frontendImage.RepoDigest,
        Ports = new[]
        {
            new Docker.Inputs.ContainerPortArgs
            {
                Internal = frontendPort,
                External = frontendPort,
            },
        },
        Envs = new[]
        {
            $"LISTEN_PORT={frontendPort}",
            $"HTTP_PROXY=backend-{Deployment.Instance.StackName}:{backendPort}",
            "PROXY_PROTOCOL=http://",
        },
        NetworksAdvanced = new[]
        {
            new Docker.Inputs.ContainerNetworksAdvancedArgs
            {
                Name = network.Name,
                Aliases = new[]
                {
                    $"frontend-{Deployment.Instance.StackName}",
                },
            },
        },
    });

});

