using System.Text;
using System.Collections.Generic;
using Pulumi;
using Pulumi.AzureNative.Resources;
using AC = Pulumi.AzureNative.ContainerService;
using ACI = Pulumi.AzureNative.ContainerService.Inputs;
using CR = Pulumi.AzureNative.ContainerRegistry;
using CRI = Pulumi.AzureNative.ContainerRegistry.Inputs;
using Authz = Pulumi.AzureNative.Authorization;
using K8s = Pulumi.Kubernetes;

// Getting Started with AKS — Stage 01: the cluster + an Azure Container Registry.
// AKS-native story: the registry and the cluster are BOTH Azure resources, and
// Pulumi wires the pull-permission between them (AcrPull on the kubelet identity).
// No app yet — this is the "infrastructure is ready" checkpoint.

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
        Identity = new ACI.ManagedClusterIdentityArgs
        {
            Type = AC.ResourceIdentityType.SystemAssigned,
        },
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
                Name = "agentpool",
                Count = 2,
                VmSize = "Standard_B2ms",
                OsType = "Linux",
                OsDiskSizeGB = 30,
                Type = "VirtualMachineScaleSets",
                Mode = "System",
            },
        },
    });

    // --- Azure Container Registry --------------------------------------------
    // RegistryName omitted → Pulumi auto-names (alphanumeric, globally unique).
    var registry = new CR.Registry("acr", new CR.RegistryArgs
    {
        ResourceGroupName = rg.Name,
        Sku = new CRI.SkuArgs { Name = CR.SkuName.Basic },
        AdminUserEnabled = false,
    });

    // --- Wire AcrPull: let the cluster's kubelet identity pull from the ACR ---
    var clientConfig = Authz.GetClientConfig.Invoke();
    var kubeletObjectId = cluster.IdentityProfile.Apply(p => p!["kubeletidentity"].ObjectId!);

    var acrPull = new Authz.RoleAssignment("acrPull", new Authz.RoleAssignmentArgs
    {
        PrincipalId = kubeletObjectId,
        PrincipalType = Authz.PrincipalType.ServicePrincipal,
        // AcrPull built-in role
        RoleDefinitionId = clientConfig.Apply(c =>
            $"/subscriptions/{c.SubscriptionId}/providers/Microsoft.Authorization/roleDefinitions/7f951dda-4ed3-4680-a7ca-43fe172d538d"),
        Scope = registry.Id,
    });

    // --- Kubeconfig + Kubernetes provider (ready for Stage 02) ---------------
    var creds = AC.ListManagedClusterUserCredentials.Invoke(new AC.ListManagedClusterUserCredentialsInvokeArgs
    {
        ResourceGroupName = rg.Name,
        ResourceName = cluster.Name,
    });
    var kubeconfig = creds.Apply(c =>
        Encoding.UTF8.GetString(System.Convert.FromBase64String(c.Kubeconfigs[0].Value)));

    var k8sProvider = new K8s.Provider("kubeKittiesK8s", new K8s.ProviderArgs
    {
        KubeConfig = Output.CreateSecret(kubeconfig),
        EnableServerSideApply = true,
    });

    return new Dictionary<string, object?>
    {
        ["clusterName"] = cluster.Name,
        ["acrLoginServer"] = registry.LoginServer,   // e.g. acr1a2b3c4.azurecr.io
        ["kubeconfig"] = Output.CreateSecret(kubeconfig),   // talk to the cluster: pulumi stack output kubeconfig --show-secrets
        // After up:  az acr import --name <acrLoginServer-minus-domain> \
        //              --source docker.io/agbell/my-random-cat:latest --image my-random-cat:latest
    };
});
