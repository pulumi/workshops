# Exploring the Generated Code

In this module, we'll take a deeper look at the generated `Program.cs`. Open `Program.cs` in your preferred text editor.

## Middleware and Config code

Let's look at the first few lines of the program:

```csharp
return await Pulumi.Deployment.RunAsync(() =>
{
    // Grab some values from the Pulumi stack configuration (or use defaults)
    var projCfg = new Config();
    var numWorkerNodes = projCfg.GetInt32("numWorkerNodes") ?? 3;
    var k8sVersion = projCfg.Get("kubernetesVersion") ?? "1.24.3";
    var prefixForDns = projCfg.Get("prefixForDns") ?? "pulumi";
    var nodeVmSize = projCfg.Get("nodeVmSize") ?? "Standard_DS2_v2";

    // The next two configuration values are required (no default can be provided)
    var mgmtGroupId = projCfg.Require("mgmtGroupId");
    var sshPubKey = projCfg.Require("sshPubKey");
```

To start, we notice that .NET Pulumi programs are wrapped in the middleware call `Pulumi.Deployment.RunAsync()`. In the following lines, we access the configuration parameters we set when we initialized the project. For more information on setting and retrieving configuration values, see [Configuration](https://www.pulumi.com/docs/intro/concepts/config/) in the Pulumi docs.

## Resources

The next few lines of the program create a virtual network. These resources will not be used in this workshop. We will leave them for now, but delete them later to demonstrate the declarative nature of Pulumi programs:

```csharp
var virtualNetwork = new AzureNative.Network.VirtualNetwork("virtualNetwork", new() {
    AddressSpace = new AzureNative.Network.Inputs.AddressSpaceArgs {
        AddressPrefixes = new[] {
            "10.0.0.0/16",
        },
    },
    ResourceGroupName = resourceGroup.Name,
});

var subnet1 = new AzureNative.Network.Subnet("subnet1", new() {
    AddressPrefix = "10.0.0.0/22",
    ResourceGroupName = resourceGroup.Name,
    VirtualNetworkName = virtualNetwork.Name,
});

// ...
```

After that, we create our AKS cluster:

```csharp
var managedCluster = new AzureNative.ContainerService.ManagedCluster("managedCluster", new() {
    AadProfile = new AzureNative.ContainerService.Inputs.ManagedClusterAADProfileArgs {
        EnableAzureRBAC = true,
        Managed = true,
        AdminGroupObjectIDs = new[] {
            mgmtGroupId,
        },
    },

    // ...
```

Then, we decode the kubeconfig:

```csharp
var creds = AzureNative.ContainerService.ListManagedClusterUserCredentials.Invoke(new() {
    ResourceGroupName = resourceGroup.Name,
    ResourceName = managedCluster.Name,
});
var encoded = creds.Apply(result => result.Kubeconfigs[0]!.Value);
var decoded = encoded.Apply(enc => {
    var bytes = Convert.FromBase64String(enc);
    return Encoding.UTF8.GetString(bytes);
});
```

Then we and return some [stack outputs](https://www.pulumi.com/learn/building-with-pulumi/stack-outputs/) which allows us to access values from this Pulumi program [from the command line](https://www.pulumi.com/docs/reference/cli/pulumi_stack_output/) or other Pulumi programs via [stack references](https://www.pulumi.com/learn/building-with-pulumi/stack-references/):

```csharp
return new Dictionary<string, object?> {
    ["rgName"] = resourceGroup.Name,
    ["networkName"] = virtualNetwork.Name,
    ["clusterName"] = managedCluster.Name,
    ["kubeconfig"] = decoded,
};
```

## Next Steps

[Deploying and Changing Infrastructure](../module-03/README.md)
