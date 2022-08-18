# Deploying Containers to Azure Container Instances (ACI)

In this lab, you will deploy a containerized application to an Azure Container Instances.

> This lab assumes you have a project set up and configured to use Azure. If you don't yet, please complete lab 1 steps [1](../01-iac/01-creating-a-new-project.md), [2](../01-iac/02-configuring-azure.md) and [3](../01-iac/03-provisioning-infrastructure.md) first.

If you haven't created a stack yet, run `pulumi config set azure:location westus --stack dev` to create a stack called `dev` and to set your Azure region (replace `westus` with the closest one).

Start with a program which defines a single resource: a Resource Group.

> :white_check_mark: Your initial `MyStack.cs` should [look like this](../01-iac/code/03-provisioning-infrastructure/step1.cs).

## Step 1 &mdash; Define a Container Group

First, we'll deploy an existing publicly available Docker image to Azure Container Instances. We use the public `mcr.microsoft.com/azuredocs/aci-helloworld` image. This image packages a small web app written in Node.js that serves a static HTML page.

Import the `Pulumi.Azure.ContainerService` namespaces:

``` csharp
using Pulumi.Azure.ContainerService;
using Pulumi.Azure.ContainerService.Inputs;
```

```csharp
...
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
    DnsNameLabel = "your-unique-label"
});
```

You need to change the value of the `DnsNameLabel` to some globally unique string.

Now, declare a stack output called `Endpoint` and set it to the `Fqdn` (fully-qualified domain name) property of the container group.

```csharp
...
    this.Endpoint = Output.Format($"http://{group.Fqdn}");
}

[Output]
public Output<string> Endpoint { get; set; }
```

> :white_check_mark: After these changes, your `MyStack.cs` should [look like this](./code/step2.cs).

## Step 3 &mdash; Provision the Container Group

Deploy the program to stand up your Azure Container Instance:

```bash
pulumi up
```

This will output the status and resulting public URL:

```
Updating (dev):

     Type                                 Name              Status
 +   pulumi:pulumi:Stack                  iac-workshop-dev  created
 +   ├─ azure:core:ResourceGroup          my-group          created     
 +   └─ azure:containerservice:Group      aci               created     
 
Outputs:
    Endpoint: "http://my-unique-string.westeurope.azurecontainer.io"

Resources:
    + 3 created

Duration: 1m15s

Permalink: https://app.pulumi.com/myuser/iac-workshop/dev/updates/1
```

You can now open the resulting endpoint in the browser or curl it:

```bash
curl $(pulumi stack output Endpoint)
```

And you'll see the Welcome page from Microsoft:

```
<html>
<head>
  <title>Welcome to Azure Container Instances!</title>
...
```

## Step 4 &mdash; Build and Publish a Private Container Image

Next, let's deploy a custom container image instead of using a stock one.

You will host the custom image in your private instance of Azure Container Registry. Add the following resource to your stack:

```csharp
var registry = new Registry("registry", new RegistryArgs
{
    ResourceGroupName = resourceGroup.Name,
    AdminEnabled = true,
    Sku = "Standard"
});
```

You can build and publish Docker images from within your Pulumi program. For that, install an additional NuGet package:

```bash
dotnet add package Pulumi.Docker
```

Now, let's add a few new files. First, `app/site/index.html`:

```html
<html>
    <head>
        <meta charset="UTF-8">
        <title>Hello, Pulumi!</title>
    </head>
    <body>
        <p>Hello, containers!</p>
        <p>Made with ❤️ with <a href="https://pulumi.com">Pulumi</a></p>
    </body>
</html>
```

And next, `app/Dockerfile`:

```Dockerfile
FROM nginx
COPY site /usr/share/nginx/html
```

We can package these files as a Docker image and push it into the container registry with the following resource:

```csharp
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
```

Replace the image name `aci-helloworld` with a reference to the resulting built image:

```csharp
...
            Image = dockerImage.ImageName,
...
```

and add credentials for the container group to be able to access the registry:

```csharp
...
    ImageRegistryCredentials =
    {
        new Pulumi.Azure.ContainerService.Inputs.GroupImageRegistryCredentialArgs
        {
            Server = registry.LoginServer,
            Username = registry.AdminUsername,
            Password = registry.AdminPassword
        }
    },
...
```

The final change is to add an option to the `Group` resource:

``` csharp
...
var group = new Group("aci", new GroupArgs
{
    ...
}, new CustomResourceOptions { DeleteBeforeReplace = true });
...
```

Note `DeleteBeforeReplace` on the last line. As we changed the image name, Pulumi will have to delete the old group and create a new one. By default, Pulumi would create a new resource before deleting the old one to ensure continuity. However, because they use the same DNS name, this is not possible. The `DeleteBeforeReplace` instructs the Pulumi engine to delete an old instance first and, therefore, to free up the domain name.

Alternatively, you could adjust the `DnsNameLabel` property value.

> :white_check_mark: After these changes, your `MyStack.cs` should [look like this](./code/step4.cs).

## Step 5 &mdash; Deploy the Changes

Now, update the stack:

```bash
pulumi up
```

The output should look something like this:

```
Updating (dev):

     Type                                 Name              Status      Info
     pulumi:pulumi:Stack                  iac-workshop-dev
 +-  ├─ azure:containerservice:Group      aci               replaced    [diff: ~containers,imageRegistryCredentials]
 +   ├─ docker:image:Image                node-app          created     
 +   └─ azure:containerservice:Registry   registry          created   
 
Outputs:
    Endpoint: "http://my-unique-string.westeurope.azurecontainer.io"

Resources:
    + 2 created
    +-1 replaced
    3 unchanged

Duration: 1m58s

Permalink: https://app.pulumi.com/myuser/iac-workshop/dev/updates/2
```

Now curl the endpoint again to see the newly updated content:

```bash
curl $(pulumi stack output Endpoint)
```

The result will contain the updated HTML:

```
<html>
    <head><meta charset="UTF-8">
        <title>Hello, Pulumi!</title>
    </head>
    <body>
        <p>Hello, containers!</p>
        <p>Made with ❤️ with <a href="https://pulumi.com">Pulumi</a></p>
    </body>
</html>
```

Don't worry if the request fails the first time: Azure Container Intances needs some time to launch the updated container. Try again in a minute.

## Step 6 &mdash; Destroy Everything

Finally, destroy the resources and the stack itself:

```
pulumi destroy
pulumi stack rm
```

## Next Steps

Congratulations! :tada: You've created an Azure Container Instance, built and deployed a custom Docker container image to your service.

Next, choose amongst these labs:

* [Deploying Serverless Applications with Azure Functions](../02-serverless/README.md)
* [Provisioning Virtual Machines](../04-vms/README.md)
* [Deploying Containers to a Kubernetes Cluster](../05-kubernetes/README.md)

Or view the [suggested next steps](/#next-steps) after completing all labs.
