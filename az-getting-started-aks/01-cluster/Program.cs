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
        // --- Networking: Azure CNI Powered by Cilium (eBPF dataplane) ----------
        // THE Azure-native opt-in here (NOT the AKS default). The eBPF dataplane
        // replaces kube-proxy/iptables; NetworkPolicy is enforced in-kernel and you
        // get Hubble flow visibility. Same technology as GKE's "Dataplane V2".
        // Self-hosted you'd `helm install cilium … --set kubeProxyReplacement=true`
        // and own its lifecycle — here it's these fields and Azure runs it.
        NetworkProfile = new ACI.ContainerServiceNetworkProfileArgs
        {
            NetworkDataplane = "cilium",   // eBPF dataplane (the opt-in)
            NetworkPlugin = "azure",
            NetworkPluginMode = "overlay",
            NetworkPolicy = "cilium",      // network policy enforced by Cilium, in-kernel
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

        // ─── More AKS-native features (commented out — uncomment to turn on) ───
        // We don't use these in the workshop, but this is what enabling them looks like.

        // Entra ID (formerly Azure AD) + Azure RBAC for CLUSTER ACCESS.
        // Controls WHO can hit the Kubernetes API: humans sign in with their company
        // identity (SSO/MFA), and you grant access with Azure role assignments to Entra
        // groups instead of in-cluster RoleBindings — revoke = drop them from the group.
        // NOTE: EnableRBAC above is only *Kubernetes* RBAC; these two booleans add the
        // Entra integration on top.
        // AadProfile = new ACI.ManagedClusterAADProfileArgs
        // {
        //     Managed             = true,   // AKS-managed — no manual app registrations
        //     EnableAzureRBAC     = true,   // authz via Azure role assignments
        //     AdminGroupObjectIDs = { "<entra-group-guid>" },   // optional cluster-admin group
        // },

        // Workload Identity — the OTHER direction: lets a POD get an Entra token to call
        // Azure services (Key Vault, Storage, …) with NO secrets, via OIDC federation
        // between a Kubernetes ServiceAccount and a managed identity. Different feature
        // from AadProfile (pods→Azure, not humans→cluster). The lines below are only the
        // cluster side — each workload ALSO needs a FederatedIdentityCredential + a
        // ServiceAccount annotation. Heavier setup; it's the basis for the AI-agent-on-AKS
        // sequel, which is why it's described here but not wired up.
        // OidcIssuerProfile = new ACI.ManagedClusterOidcIssuerProfileArgs { Enabled = true },
        // SecurityProfile = new ACI.ManagedClusterSecurityProfileArgs
        // {
        //     WorkloadIdentity = new ACI.ManagedClusterSecurityProfileWorkloadIdentityArgs { Enabled = true },
        // },

        // KEDA — event-driven autoscaling add-on (scale on queue depth, HTTP rps, cron,
        // etc., not just CPU/memory). Pod-level; pairs with a node autoscaler (below).
        // One managed-add-on field:
        // WorkloadAutoScalerProfile = new ACI.ManagedClusterWorkloadAutoScalerProfileArgs
        // {
        //     Keda = new ACI.ManagedClusterWorkloadAutoScalerProfileKedaArgs { Enabled = true },
        // },

        // Node Auto Provisioning (NAP) — AKS's managed Karpenter, the NODE layer under
        // KEDA. Instead of fixed agent pools with min/max, Azure provisions + right-sizes
        // nodes to fit pending pods. Requires Azure CNI Overlay + Cilium (this cluster
        // already has it). ⚠️ Preview: needs `az feature register --namespace
        // Microsoft.ContainerService --name NodeAutoProvisioningPreview` first. You then
        // tune it with in-cluster NodePool / AKSNodeClass CRDs, not here.
        // NodeProvisioningProfile = new ACI.ManagedClusterNodeProvisioningProfileArgs
        // {
        //     Mode = "Auto",   // "Manual" (default) = classic fixed agent pools
        // },
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
