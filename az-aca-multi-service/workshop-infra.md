# Infrastructure Deep Dive: Azure Container Apps with Pulumi

This guide walks through the infrastructure code step-by-step, explaining the key concepts you'll encounter when deploying to Azure Container Apps.

---

## The Big Picture

Before diving into code, let's understand what we're building:

```
┌─────────────────────────────────────────────────────────────┐
│   Azure Subscription                                        │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Resource Group: rg-todo-demo-dev                      │ │
│  │                                                       │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │ Container Apps Environment                      │ │ │
│  │  │  (The "platform" that hosts your apps)          │ │ │
│  │  │                                                  │ │ │
│  │  │  ┌──────────────────┐  ┌────────────────────┐  │ │ │
│  │  │  │  Backend App     │  │  Frontend App      │  │ │ │
│  │  │  │  (.NET 8 API)    │  │  (React + BFF)     │  │ │ │
│  │  │  │  Port: 8080      │  │  Port: 8080        │  │ │ │
│  │  │  └──────────────────┘  └────────────────────┘  │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  │                                                       │ │
│  │  ┌──────────────────┐      ┌──────────────────────┐ │ │
│  │  │ Storage Account  │      │ Container Registry   │ │ │
│  │  │                  │      │ (ACR)                │ │ │
│  │  │ Blob Container:  │      │                      │ │ │
│  │  │  board-state/    │      │ todo-backend:latest  │ │ │
│  │  │  └─ board.json   │      │ todo-frontend:latest │ │ │
│  │  └──────────────────┘      └──────────────────────┘ │ │
│  │           ▲                                          │ │
│  │           │                                          │ │
│  │  ┌────────┴────────┐                                │ │
│  │  │ Managed Identity│                                │ │
│  │  │ (Backend's ID)  │                                │ │
│  │  └─────────────────┘                                │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Key Relationships:**

- Everything lives in a Resource Group (organizational container)
- Apps run inside a Container Apps Environment (the hosting platform)
- Backend uses Managed Identity to access storage (no connection strings)
- Images are stored in Container Registry (private Docker registry)

---

## Part 1: Foundation - Resource Group & Storage

Every Azure deployment needs a Resource Group and somewhere to store data.

```csharp
var stackName = Pulumi.Deployment.Instance.StackName;

// Create Resource Group
var resourceGroup = new ResourceGroup("resourceGroup", new ResourceGroupArgs
{
    ResourceGroupName = $"rg-todo-demo-{stackName}"
});
```

**What's happening:**

- `stackName` comes from Pulumi (e.g., "dev", "prod")
- Resource Group is the container for all Azure resources
- Location is set via `pulumi config set azure-native:location westus2`
- Naming pattern: `rg-todo-demo-dev` makes resources easy to identify

### Storage Account

```csharp
var storageAccount = new StorageAccount("storage", new StorageAccountArgs
{
    AccountName = $"sttododemo{stackName}",
    ResourceGroupName = resourceGroup.Name,
    Sku = new SkuArgs { Name = SkuName.Standard_LRS },
    Kind = Kind.StorageV2
});
```

**Key points:**

- Storage account names must be globally unique
- `Standard_LRS` = Locally Redundant Storage (cheapest option)
- `resourceGroup.Name` creates an implicit dependency

### Blob Container

```csharp
var blobContainer = new BlobContainer("boardStateContainer", new BlobContainerArgs
{
    ContainerName = "board-state",
    AccountName = storageAccount.Name,
    ResourceGroupName = resourceGroup.Name,
    PublicAccess = PublicAccess.None
});
```

Creates a folder inside the storage account for board state.

---

## Part 2: Container Registry & Docker Images

### The Registry

```csharp
var registry = new Registry("acr", new RegistryArgs
{
    RegistryName = $"acrtododemo{stackName}",
    ResourceGroupName = resourceGroup.Name,
    Sku = new SkuArgs { Name = "Basic" },
    AdminUserEnabled = true
});
```

Azure Container Registry (ACR) is your private Docker registry.

### Getting Credentials

```csharp
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
```

**Understanding Outputs:**

`Output.Tuple()` and `.Apply()` handle values you don't have yet.

When you create a registry:
- The name isn't immediately known (Azure generates parts of it)
- The login server URL doesn't exist yet
- Credentials aren't available

Outputs let you say: "Once you know the registry name, go fetch the credentials."

**Timeline:**

```
1. Create registry request sent    → registry.Name is an Output<string>
2. Azure creates the registry       → Name becomes available
3. Pulumi calls ListRegistryCredentials  → Gets username/password
4. Values are available for use     → Can build Docker image
```

### Building Docker Images

```csharp
var backendImage = new Image("backend-image", new ImageArgs
{
    Build = new DockerBuildArgs
    {
        Context = "../api",
        Dockerfile = "../api/Dockerfile",
        Platform = "linux/amd64"
    },
    ImageName = Output.Format($"{registryServer}/todo-backend:latest"),
    Registry = new RegistryArgs
    {
        Server = registryServer,
        Username = registryUsername,
        Password = registryPassword
    }
});
```

**What Pulumi does:**

1. Build your Docker image locally
2. Tag it with the registry URL (once available)
3. Authenticate to ACR (once credentials are available)
4. Push the image automatically

You don't need:

```bash
docker build -t myimage .
docker tag myimage acr123.azurecr.io/myimage:latest
docker login acr123.azurecr.io
docker push acr123.azurecr.io/myimage:latest
```

**The Flow:**

```
Your Code (../api)
       ↓
Pulumi reads Dockerfile
       ↓
docker build (local)
       ↓
Wait for registry to exist
       ↓
Tag with registry URL
       ↓
Push to ACR
       ↓
Image ready for deployment
```

---

## Part 3: The Platform - Container Apps Environment

```csharp
var containerAppEnv = new ManagedEnvironment("containerAppEnv", new ManagedEnvironmentArgs
{
    EnvironmentName = $"env-todo-demo-{stackName}",
    ResourceGroupName = resourceGroup.Name
});
```

**What it is:**

The serverless platform that hosts container apps. It provides:

- Networking between apps
- Load balancing
- Scaling management
- Dapr support (service mesh)

**Why separate from apps:**

Multiple apps share one environment:

- Cost savings (one platform for many apps)
- Apps can communicate internally
- Shared networking and security policies

```
Environment = The Building
Apps = The Apartments Inside
```

---

## Part 4: Managed Identity and RBAC

The modern Azure pattern that eliminates connection strings.

### Create the Identity

```csharp
var backendIdentity = new UserAssignedIdentity("backendIdentity", new UserAssignedIdentityArgs
{
    ResourceName = $"id-backend-{stackName}",
    ResourceGroupName = resourceGroup.Name
});
```

**What is Managed Identity:**

An identity for your application that:

- Is managed by Azure (no passwords to rotate)
- Can be granted permissions
- Apps can use automatically

### Grant Storage Access

```csharp
var roleAssignment = new RoleAssignment("blobContributorRole", new RoleAssignmentArgs
{
    PrincipalId = backendIdentity.PrincipalId,
    PrincipalType = "ServicePrincipal",
    RoleDefinitionId = "/providers/Microsoft.Authorization/roleDefinitions/ba92f5b4-2d11-453d-a403-e96b0029c9fe",
    Scope = storageAccount.Id
});
```

**The Pattern:**

Old approach (connection strings):

```csharp
var connectionString = "DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...";
// Secret in config/env var
// Manual rotation required
// Can be leaked
```

New approach (managed identity):

```csharp
// Backend says: "I am backend-identity"
// Azure verifies and grants access
// No password needed
```

**How it works:**

```
Backend App starts
      ↓
Uses Managed Identity (automatic)
      ↓
Azure verifies: "This IS backend-identity"
      ↓
Checks RBAC: "backend-identity HAS access to storage"
      ↓
Storage access granted
```

**That Role Definition ID:**

`ba92f5b4-2d11-453d-a403-e96b0029c9fe` is the built-in "Storage Blob Data Contributor" role.

Means: "Can read, write, and delete blobs."

---

## Part 5: Deploy the Backend

Wiring everything together:

```csharp
var backendApp = new ContainerApp("backendApp", new ContainerAppArgs
{
    ContainerAppName = $"ca-backend-{stackName}",
    ResourceGroupName = resourceGroup.Name,
    ManagedEnvironmentId = containerAppEnv.Id,
    Configuration = new ConfigurationArgs
    {
        Ingress = new IngressArgs
        {
            External = true,  // Publicly accessible
            TargetPort = 8080,
            Transport = IngressTransportMethod.Auto,
            AllowInsecure = false
        },
        Registries = new List<RegistryCredentialsArgs>
        {
            new RegistryCredentialsArgs
            {
                Server = registryServer,
                Username = registryUsername,
                PasswordSecretRef = "registry-password"
            }
        },
        Secrets = new List<SecretArgs>
        {
            new SecretArgs
            {
                Name = "registry-password",
                Value = registryPassword
            }
        }
    },
    // ... continued below
});
```

**Configuration breakdown:**

1. **Ingress**: Makes the app accessible from the internet
   - `External = true` means public endpoint
   - `TargetPort = 8080` is your app's port
   - `AllowInsecure = false` means HTTPS only

2. **Registry Auth**: How to pull the Docker image
   - Stores password as a secret
   - References it when pulling

### The Container Specification

```csharp
Template = new TemplateArgs
{
    Containers = new List<ContainerArgs>
    {
        new ContainerArgs
        {
            Name = "backend",
            Image = backendImage.ImageName,
            Resources = new ContainerResourcesArgs
            {
                Cpu = 0.25,
                Memory = "0.5Gi"
            },
            Env = new List<EnvironmentVarArgs>
            {
                new() { Name = "Azure__UseStorage", Value = "true" },
                new() { Name = "Azure__StorageAccountName", Value = storageAccount.Name },
                new() { Name = "Azure__BlobContainerName", Value = "board-state" },
                new() { Name = "Azure__UseManagedIdentity", Value = "true" },
                new() { Name = "AZURE_CLIENT_ID", Value = backendIdentity.ClientId }
            }
        }
    }
}
```

**Environment Variables:**

Tell the backend how to connect to storage:

- `Azure__UseStorage` - Use Azure storage (not local file)
- `Azure__StorageAccountName` - Which storage account
- `Azure__UseManagedIdentity` - Use identity, not connection string
- `AZURE_CLIENT_ID` - Which identity to use

Note: No connection string. Just the identity's client ID.

### Attach the Identity

```csharp
Identity = new ManagedServiceIdentityArgs
{
    Type = ManagedServiceIdentityType.UserAssigned,
    UserAssignedIdentities = new InputList<string> { backendIdentity.Id }
}
```

This tells Azure: "This app uses this identity."

---

## Part 6: Deploy the Frontend

Similar pattern for the frontend:

```csharp
var frontendImage = new Image("frontend-image", new ImageArgs
{
    Build = new DockerBuildArgs
    {
        Context = "../",
        Dockerfile = "../Dockerfile",
        Platform = "linux/amd64"
    },
    ImageName = Output.Format($"{registryServer}/todo-frontend:latest"),
    Registry = new RegistryArgs
    {
        Server = registryServer,
        Username = registryUsername,
        Password = registryPassword
    }
}, new CustomResourceOptions { DependsOn = new[] { backendApp } });
```

**Understanding Dependencies:**

`DependsOn = new[] { backendApp }` means:

- Don't build the frontend image until the backend is deployed
- Ensures the backend URL is available

The frontend needs to know where the backend is:

```csharp
Env = new List<EnvironmentVarArgs>
{
    new()
    {
        Name = "BACKEND_URL",
        Value = backendUrl  // From backend's ingress FQDN
    }
}
```

**Getting the backend URL:**

```csharp
var backendUrl = backendApp.Configuration.Apply(c =>
    c != null && c.Ingress != null && c.Ingress.Fqdn != null
        ? $"https://{c.Ingress.Fqdn}"
        : "");
```

Another `Output.Apply()` - the URL isn't known until the backend deploys.

---

## Part 7: Outputs - Getting Your URLs

At the end of your Pulumi program:

```csharp
return new Dictionary<string, object?>
{
    ["resourceGroupName"] = resourceGroup.Name,
    ["storageAccountName"] = storageAccount.Name,
    ["frontendUrl"] = frontendApp.Configuration.Apply(c =>
        $"https://{c!.Ingress!.Fqdn}"),
    ["backendUrl"] = backendApp.Configuration.Apply(c =>
        $"https://{c!.Ingress!.Fqdn}"),
    ["registryServer"] = registryServer
};
```

**Why export these:**

After deployment, you can retrieve them:

```bash
pulumi stack output frontendUrl
# https://ca-frontend-dev.bluestone-12345.westus2.azurecontainerapps.io

pulumi stack output backendUrl
# https://ca-backend-dev.bluestone-12345.westus2.azurecontainerapps.io
```

These are the URLs to access your deployed apps.

---

## The Complete Flow: From Code to Cloud

Trace one request through the entire system:

```
1. Run: pulumi up
2. Create Resource Group
3. Create Storage Account & Container Registry (parallel)
4. Fetch registry credentials (needs registry first)
5. Build Docker images locally
6. Push images to ACR
7. Create Container Apps Environment
8. Create Managed Identity
9. Grant Identity access to Storage (RBAC)
10. Deploy Backend Container App
    - Pull image from ACR
    - Assign Managed Identity
    - Set environment variables
    - Start container
11. Get Backend's public URL
12. Deploy Frontend Container App
    - Pass Backend URL as env var
    - Pull image from ACR
    - Start container
13. Return URLs
14. Visit the frontend URL - app is running
```

**Dependency Graph:**

```
Resource Group
    ├── Storage Account
    │       └── Blob Container
    │
    ├── Container Registry
    │       ├── Backend Image (builds & pushes)
    │       └── Frontend Image (builds & pushes)
    │
    ├── Container Apps Environment
    │
    ├── Managed Identity
    │       └── Role Assignment (to Storage)
    │
    ├── Backend Container App
    │       ├── Uses: Backend Image
    │       ├── Uses: Managed Identity
    │       ├── Runs in: Environment
    │       └── Accesses: Storage
    │
    └── Frontend Container App
            ├── Uses: Frontend Image
            ├── Runs in: Environment
            └── Talks to: Backend (via URL)
```

---

## Key Takeaways

### Pulumi Concepts

- Outputs handle values you don't have yet
- Automatic Docker build and push (no manual docker commands)
- Dependency tracking ensures resources are created in the right order
- Apply() transforms outputs once values become available

### Azure Patterns

- Resource Groups contain all resources
- Container Apps Environment hosts multiple apps
- Managed Identity eliminates secrets
- RBAC grants permissions without passwords

### The Modern Stack

```
Infrastructure as Code (Pulumi)
Containers (Docker)
Serverless Hosting (Container Apps)
Zero Secrets (Managed Identity)
Automatic Builds (Pulumi Docker)
```

### Comparison

**Traditional approach:**

- Write Terraform/ARM templates
- Manually build Docker images
- Manually push to registry
- Store connection strings as secrets
- Configure everything manually

**Pulumi approach:**

- Write real code (C#, TypeScript, Python, Go)
- Pulumi builds and pushes images automatically
- Outputs handle async values
- Managed Identity eliminates secrets
- Resources wire themselves together

---

## Next Steps

Now that you understand the infrastructure:

1. **Modify it** - Try changing CPU/memory, adding environment variables
2. **Add security** - In Part 6, we'll add Dapr to make the backend internal-only
3. **Scale it** - Container Apps can scale to zero or to thousands
4. **Monitor it** - Add Application Insights for observability

The power of Pulumi is that all of this is code. Deploy to staging with `pulumi stack init staging && pulumi up`. Tear it down with `pulumi destroy`. See what changed with `pulumi preview`.

Welcome to infrastructure as code.
