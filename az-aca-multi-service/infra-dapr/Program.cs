using System.Collections.Generic;
using Pulumi;
using Pulumi.AzureNative.App;
using Pulumi.AzureNative.App.Inputs;
using Pulumi.AzureNative.Authorization;
using Pulumi.AzureNative.ContainerRegistry;
using Pulumi.AzureNative.ManagedIdentity;
using Pulumi.AzureNative.Resources;
using Pulumi.AzureNative.ServiceBus;
using Pulumi.AzureNative.Storage;
using Pulumi.Docker;

return await Pulumi.Deployment.RunAsync(() =>
{
    var stackName = Pulumi.Deployment.Instance.StackName;

    // Create Resource Group
    var resourceGroup = new ResourceGroup("resourceGroup", new ResourceGroupArgs
    {
        ResourceGroupName = $"rg-todo-demo-{stackName}"
    });

    // Create Storage Account
    var storageAccount = new StorageAccount("storage", new StorageAccountArgs
    {
        AccountName = $"sttododemo{stackName}",
        ResourceGroupName = resourceGroup.Name,
        Sku = new Pulumi.AzureNative.Storage.Inputs.SkuArgs { Name = Pulumi.AzureNative.Storage.SkuName.Standard_LRS },
        Kind = Pulumi.AzureNative.Storage.Kind.StorageV2
    });

    // Create Blob Container
    var blobContainer = new BlobContainer("boardStateContainer", new BlobContainerArgs
    {
        ContainerName = "board-state",
        AccountName = storageAccount.Name,
        ResourceGroupName = resourceGroup.Name,
        PublicAccess = PublicAccess.None
    });

    // Upload initial-board.json
    var initialBoardBlob = new Blob("initialBoardBlob", new BlobArgs
    {
        BlobName = "initial-board.json",
        ContainerName = blobContainer.Name,
        AccountName = storageAccount.Name,
        ResourceGroupName = resourceGroup.Name,
        Source = new FileAsset("../api/Data/initial-board.json"),
        ContentType = "application/json"
    });

    // Create Container Registry
    var registry = new Registry("acr", new Pulumi.AzureNative.ContainerRegistry.RegistryArgs
    {
        RegistryName = $"acrtododemo{stackName}",
        ResourceGroupName = resourceGroup.Name,
        Sku = new Pulumi.AzureNative.ContainerRegistry.Inputs.SkuArgs { Name = "Basic" },
        AdminUserEnabled = true
    });

    // Get registry credentials
    var credentials = Output.Tuple(resourceGroup.Name, registry.Name).Apply(async t =>
    {
        var (rgName, registryName) = t;
        return await ListRegistryCredentials.InvokeAsync(new ListRegistryCredentialsArgs
        {
            ResourceGroupName = rgName,
            RegistryName = registryName
        });
    });

    var registryUsername = credentials.Apply(c => c.Username!);
    var registryPassword = credentials.Apply(c => c.Passwords[0].Value!);
    var registryServer = registry.LoginServer;

    // Build and push backend image
    var backendImage = new Image("backend-image", new ImageArgs
    {
        Build = new Pulumi.Docker.Inputs.DockerBuildArgs
        {
            Context = "../api",
            Dockerfile = "../api/Dockerfile",
            Platform = "linux/amd64"
        },
        ImageName = Output.Format($"{registryServer}/todo-backend:latest"),
        Registry = new Pulumi.Docker.Inputs.RegistryArgs
        {
            Server = registryServer,
            Username = registryUsername,
            Password = registryPassword
        }
    });

    // Azure Service Bus for webhook events
    var serviceBusNamespace = new Pulumi.AzureNative.ServiceBus.Namespace("webhooks", new Pulumi.AzureNative.ServiceBus.NamespaceArgs
    {
        NamespaceName = $"sb-todo-webhooks-{stackName}",
        ResourceGroupName = resourceGroup.Name,
        Sku = new Pulumi.AzureNative.ServiceBus.Inputs.SBSkuArgs
        {
            Name = Pulumi.AzureNative.ServiceBus.SkuName.Standard,
            Tier = Pulumi.AzureNative.ServiceBus.SkuTier.Standard
        }
    });

    // Topic for external task events (from GitHub, Slack, etc.)
    var externalTasksTopic = new Pulumi.AzureNative.ServiceBus.Topic("external-tasks", new Pulumi.AzureNative.ServiceBus.TopicArgs
    {
        TopicName = "external-tasks",
        NamespaceName = serviceBusNamespace.Name,
        ResourceGroupName = resourceGroup.Name
    });

    // Get Service Bus connection string
    var serviceBusKeys = Output.Tuple(resourceGroup.Name, serviceBusNamespace.Name).Apply(async t =>
    {
        var (rgName, nsName) = t;
        return await Pulumi.AzureNative.ServiceBus.ListNamespaceKeys.InvokeAsync(new Pulumi.AzureNative.ServiceBus.ListNamespaceKeysArgs
        {
            ResourceGroupName = rgName,
            NamespaceName = nsName,
            AuthorizationRuleName = "RootManageSharedAccessKey"
        });
    });

    var serviceBusConnectionString = serviceBusKeys.Apply(keys => keys.PrimaryConnectionString!);

    // Create Container Apps Environment
    var containerAppEnv = new ManagedEnvironment("containerAppEnv", new ManagedEnvironmentArgs
    {
        EnvironmentName = $"env-todo-demo-{stackName}",
        ResourceGroupName = resourceGroup.Name
    });

    // Dapr pub/sub component - connects Service Bus to backend
    var daprPubSubComponent = new DaprComponent("pubsub", new DaprComponentArgs
    {
        ComponentName = "pubsub",
        EnvironmentName = containerAppEnv.Name,
        ResourceGroupName = resourceGroup.Name,
        ComponentType = "pubsub.azure.servicebus.topics",
        Version = "v1",
        Metadata = new InputList<Pulumi.AzureNative.App.Inputs.DaprMetadataArgs>
        {
            new Pulumi.AzureNative.App.Inputs.DaprMetadataArgs
            {
                Name = "connectionString",
                SecretRef = "servicebus-connection-string"
            }
        },
        Secrets = new InputList<Pulumi.AzureNative.App.Inputs.SecretArgs>
        {
            new Pulumi.AzureNative.App.Inputs.SecretArgs
            {
                Name = "servicebus-connection-string",
                Value = serviceBusConnectionString
            }
        },
        Scopes = new InputList<string> { "backend" }  // Only backend can use this component
    });

    // Create Managed Identity
    var backendIdentity = new UserAssignedIdentity("backendIdentity", new UserAssignedIdentityArgs
    {
        ResourceName = $"id-backend-{stackName}",
        ResourceGroupName = resourceGroup.Name
    });

    // Grant storage access
    var roleAssignment = new RoleAssignment("blobContributorRole", new RoleAssignmentArgs
    {
        PrincipalId = backendIdentity.PrincipalId,
        PrincipalType = "ServicePrincipal",
        RoleDefinitionId = "/providers/Microsoft.Authorization/roleDefinitions/ba92f5b4-2d11-453d-a403-e96b0029c9fe",
        Scope = storageAccount.Id
    });

    // Deploy Backend
    var backendApp = new ContainerApp("backendApp", new ContainerAppArgs
    {
        ContainerAppName = $"ca-backend-{stackName}",
        ResourceGroupName = resourceGroup.Name,
        ManagedEnvironmentId = containerAppEnv.Id,
        Configuration = new Pulumi.AzureNative.App.Inputs.ConfigurationArgs
        {
            Dapr = new Pulumi.AzureNative.App.Inputs.DaprArgs
            {
                Enabled = true,
                AppId = "backend",
                AppPort = 8080,
                AppProtocol = "http"
            },
            Ingress = new Pulumi.AzureNative.App.Inputs.IngressArgs
            {
                External = false,  // Internal only - frontend calls via FQDN, webhooks via Dapr pub/sub
                TargetPort = 8080,
                Transport = IngressTransportMethod.Auto,
                AllowInsecure = false
            },
            Registries = new List<Pulumi.AzureNative.App.Inputs.RegistryCredentialsArgs>
            {
                new Pulumi.AzureNative.App.Inputs.RegistryCredentialsArgs
                {
                    Server = registryServer,
                    Username = registryUsername,
                    PasswordSecretRef = "registry-password"
                }
            },
            Secrets = new List<Pulumi.AzureNative.App.Inputs.SecretArgs>
            {
                new Pulumi.AzureNative.App.Inputs.SecretArgs
                {
                    Name = "registry-password",
                    Value = registryPassword
                }
            }
        },
        Template = new Pulumi.AzureNative.App.Inputs.TemplateArgs
        {
            Containers = new List<Pulumi.AzureNative.App.Inputs.ContainerArgs>
            {
                new Pulumi.AzureNative.App.Inputs.ContainerArgs
                {
                    Name = "backend",
                    Image = backendImage.ImageName,
                    Resources = new Pulumi.AzureNative.App.Inputs.ContainerResourcesArgs
                    {
                        Cpu = 0.5,
                        Memory = "1Gi"
                    },
                    Env = new List<Pulumi.AzureNative.App.Inputs.EnvironmentVarArgs>
                    {
                        new Pulumi.AzureNative.App.Inputs.EnvironmentVarArgs { Name = "ASPNETCORE_URLS", Value = "http://+:8080" },
                        new Pulumi.AzureNative.App.Inputs.EnvironmentVarArgs { Name = "Azure__UseStorage", Value = "true" },
                        new Pulumi.AzureNative.App.Inputs.EnvironmentVarArgs { Name = "Azure__StorageAccountName", Value = storageAccount.Name },
                        new Pulumi.AzureNative.App.Inputs.EnvironmentVarArgs { Name = "Azure__BlobContainerName", Value = "board-state" },
                        new Pulumi.AzureNative.App.Inputs.EnvironmentVarArgs { Name = "Azure__UseManagedIdentity", Value = "true" },
                        new Pulumi.AzureNative.App.Inputs.EnvironmentVarArgs { Name = "AZURE_CLIENT_ID", Value = backendIdentity.ClientId },
                        new Pulumi.AzureNative.App.Inputs.EnvironmentVarArgs { Name = "CORS_ORIGINS", Value = "*" }
                    },
                    Probes = new List<Pulumi.AzureNative.App.Inputs.ContainerAppProbeArgs>
                    {
                        new Pulumi.AzureNative.App.Inputs.ContainerAppProbeArgs
                        {
                            Type = Pulumi.AzureNative.App.Type.Liveness,
                            HttpGet = new Pulumi.AzureNative.App.Inputs.ContainerAppProbeHttpGetArgs
                            {
                                Path = "/health",
                                Port = 8080
                            },
                            InitialDelaySeconds = 10,
                            PeriodSeconds = 30
                        }
                    }
                }
            },
            Scale = new Pulumi.AzureNative.App.Inputs.ScaleArgs
            {
                MinReplicas = 1,
                MaxReplicas = 3
            }
        },
        Identity = new Pulumi.AzureNative.App.Inputs.ManagedServiceIdentityArgs
        {
            Type = Pulumi.AzureNative.App.ManagedServiceIdentityType.UserAssigned,
            UserAssignedIdentities = new InputList<string> { backendIdentity.Id }
        }
    });

    // Get backend URL - internal only, no public endpoint
    // Frontend calls backend via internal FQDN
    // External webhooks go through Service Bus → Dapr pub/sub → backend
    var backendUrl = backendApp.Configuration.Apply(c =>
        c != null && c.Ingress != null && c.Ingress.Fqdn != null
            ? $"https://{c.Ingress.Fqdn}"
            : "");

    // Build frontend image (BFF will proxy to backend via internal FQDN)
    var frontendImageTag = $"v{System.DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
    var frontendImage = new Image("frontend-image", new ImageArgs
    {
        Build = new Pulumi.Docker.Inputs.DockerBuildArgs
        {
            Context = "..",
            Dockerfile = "../Dockerfile",
            Platform = "linux/amd64"
        },
        ImageName = Output.Format($"{registryServer}/todo-frontend:{frontendImageTag}"),
        Registry = new Pulumi.Docker.Inputs.RegistryArgs
        {
            Server = registryServer,
            Username = registryUsername,
            Password = registryPassword
        }
    }, new CustomResourceOptions { DependsOn = new[] { backendApp } });

    // Deploy Frontend
    var frontendApp = new ContainerApp("frontendApp", new ContainerAppArgs
    {
        ContainerAppName = $"ca-frontend-{stackName}",
        ResourceGroupName = resourceGroup.Name,
        ManagedEnvironmentId = containerAppEnv.Id,
        Configuration = new Pulumi.AzureNative.App.Inputs.ConfigurationArgs
        {
            Ingress = new Pulumi.AzureNative.App.Inputs.IngressArgs
            {
                External = true,
                TargetPort = 8080,
                Transport = IngressTransportMethod.Auto,
                AllowInsecure = false
            },
            Registries = new List<Pulumi.AzureNative.App.Inputs.RegistryCredentialsArgs>
            {
                new Pulumi.AzureNative.App.Inputs.RegistryCredentialsArgs
                {
                    Server = registryServer,
                    Username = registryUsername,
                    PasswordSecretRef = "registry-password"
                }
            },
            Secrets = new List<Pulumi.AzureNative.App.Inputs.SecretArgs>
            {
                new Pulumi.AzureNative.App.Inputs.SecretArgs
                {
                    Name = "registry-password",
                    Value = registryPassword
                }
            }
        },
        Template = new Pulumi.AzureNative.App.Inputs.TemplateArgs
        {
            Containers = new List<Pulumi.AzureNative.App.Inputs.ContainerArgs>
            {
                new Pulumi.AzureNative.App.Inputs.ContainerArgs
                {
                    Name = "frontend",
                    Image = frontendImage.ImageName,
                    Resources = new Pulumi.AzureNative.App.Inputs.ContainerResourcesArgs
                    {
                        Cpu = 0.25,
                        Memory = "0.5Gi"
                    },
                    Env = new List<Pulumi.AzureNative.App.Inputs.EnvironmentVarArgs>
                    {
                        new Pulumi.AzureNative.App.Inputs.EnvironmentVarArgs
                        {
                            Name = "BACKEND_URL",
                            Value = backendApp.Configuration.Apply(c =>
                                $"https://{c!.Ingress!.Fqdn}")
                        }
                    },
                    Probes = new List<Pulumi.AzureNative.App.Inputs.ContainerAppProbeArgs>
                    {
                        new Pulumi.AzureNative.App.Inputs.ContainerAppProbeArgs
                        {
                            Type = Pulumi.AzureNative.App.Type.Liveness,
                            HttpGet = new Pulumi.AzureNative.App.Inputs.ContainerAppProbeHttpGetArgs
                            {
                                Path = "/health",
                                Port = 8080
                            },
                            InitialDelaySeconds = 5,
                            PeriodSeconds = 30
                        }
                    }
                }
            },
            Scale = new Pulumi.AzureNative.App.Inputs.ScaleArgs
            {
                MinReplicas = 1,
                MaxReplicas = 5
            }
        }
    }, new CustomResourceOptions { DependsOn = new[] { frontendImage } });

    // Exports
    return new Dictionary<string, object?>
    {
        ["resourceGroupName_out"] = resourceGroup.Name,
        ["storageAccountName_out"] = storageAccount.Name,
        ["containerName_out"] = blobContainer.Name,
        ["registryServer_out"] = registryServer,
        ["backendUrl_out"] = backendUrl,
        ["frontendUrl"] = frontendApp.Configuration.Apply(c =>
            c != null && c.Ingress != null && c.Ingress.Fqdn != null
                ? $"https://{c.Ingress.Fqdn}"
                : ""),
        ["serviceBusNamespace_out"] = serviceBusNamespace.Name,
        ["externalTasksTopic_out"] = externalTasksTopic.Name
    };
});
