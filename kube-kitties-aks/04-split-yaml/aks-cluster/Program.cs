using System.Text;
using System.Collections.Generic;
using Pulumi;
using Pulumi.AzureNative.Resources;
using AC = Pulumi.AzureNative.ContainerService;
using ACI = Pulumi.AzureNative.ContainerService.Inputs;
using CR = Pulumi.AzureNative.ContainerRegistry;
using CRI = Pulumi.AzureNative.ContainerRegistry.Inputs;
using Authz = Pulumi.AzureNative.Authorization;
using Cmd = Pulumi.Command.Local;

// Stage 03/04 — the CLUSTER stack. Stands up AKS + ACR, imports the cat image,
// and EXPORTS the kubeconfig + ACR login server so the separate workload stack
// can consume them via a stack reference. This is the slow-moving base layer.

return await Pulumi.Deployment.RunAsync(() =>
{
    var rg = new ResourceGroup("kubeKittiesRg", new ResourceGroupArgs
    {
        ResourceGroupName = "kube-kitties-rg",
    });

    var cluster = new AC.ManagedCluster("kubeKitties", new AC.ManagedClusterArgs
    {
        ResourceGroupName = rg.Name,
        ResourceName = "kube-kitties",
        KubernetesVersion = "1.33",
        DnsPrefix = "kubekitties",
        NodeResourceGroup = "kube-kitties-rg-nodes",
        EnableRBAC = true,
        Identity = new ACI.ManagedClusterIdentityArgs { Type = AC.ResourceIdentityType.SystemAssigned },
        NetworkProfile = new ACI.ContainerServiceNetworkProfileArgs
        {
            NetworkDataplane = "cilium",
            NetworkPlugin = "azure",
            NetworkPluginMode = "overlay",
            NetworkPolicy = "cilium",
            PodCidr = "192.168.0.0/16",
        },
        AgentPoolProfiles =
        {
            new ACI.ManagedClusterAgentPoolProfileArgs
            {
                Name = "agentpool", Count = 2, VmSize = "Standard_B2ms",
                OsType = "Linux", OsDiskSizeGB = 30,
                Type = "VirtualMachineScaleSets", Mode = "System",
            },
        },
    });

    var registry = new CR.Registry("acr", new CR.RegistryArgs
    {
        ResourceGroupName = rg.Name,
        Sku = new CRI.SkuArgs { Name = CR.SkuName.Basic },
        AdminUserEnabled = false,
    });

    var clientConfig = Authz.GetClientConfig.Invoke();
    var acrPull = new Authz.RoleAssignment("acrPull", new Authz.RoleAssignmentArgs
    {
        PrincipalId = cluster.IdentityProfile.Apply(p => p!["kubeletidentity"].ObjectId!),
        PrincipalType = Authz.PrincipalType.ServicePrincipal,
        RoleDefinitionId = clientConfig.Apply(c =>
            $"/subscriptions/{c.SubscriptionId}/providers/Microsoft.Authorization/roleDefinitions/7f951dda-4ed3-4680-a7ca-43fe172d538d"),
        Scope = registry.Id,
    });

    var import = new Cmd.Command("import-cat-image", new Cmd.CommandArgs
    {
        Create = registry.Name.Apply(n =>
            $"az acr import --name {n} --source docker.io/agbell/my-random-cat:latest --image my-random-cat:latest --force"),
    }, new CustomResourceOptions { DependsOn = { registry } });

    var creds = AC.ListManagedClusterUserCredentials.Invoke(new AC.ListManagedClusterUserCredentialsInvokeArgs
    {
        ResourceGroupName = rg.Name,
        ResourceName = cluster.Name,
    });
    var kubeconfig = creds.Apply(c =>
        Encoding.UTF8.GetString(System.Convert.FromBase64String(c.Kubeconfigs[0].Value)));

    return new Dictionary<string, object?>
    {
        ["clusterName"]    = cluster.Name,
        ["acrLoginServer"] = registry.LoginServer,
        ["kubeconfig"]     = Output.CreateSecret(kubeconfig),   // consumed by the workload stack
    };
});
