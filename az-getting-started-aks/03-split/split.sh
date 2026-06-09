#!/usr/bin/env bash
#
# split.sh — Stage 3, steps 5a + 5b, done in place.
#
# Run this from INSIDE your flat Stage-2 demo project (the folder with
# Program.cs + Pulumi.yaml, cluster + cat both deployed). It:
#
#   1. creates  aks-cluster/  and moves the project files into it
#   2. rewrites aks-cluster/Program.cs to the CLUSTER-ONLY program
#      (RG + AKS + ACR + AcrPull + image import + kubeconfig export — no cat)
#   3. creates an empty  workload/  folder for you to fill in by hand
#
# The project NAME is left unchanged, so aks-cluster is the SAME stack you've
# been running. Next step is yours:
#
#   cd aks-cluster && pulumi up      # same cluster — just removes cat svc + deployment
#
# Usage:  cd <your demo folder> && /path/to/03-split/split.sh
#
set -euo pipefail

[ -f Pulumi.yaml ] || { echo "No Pulumi.yaml here — run this from inside your demo project folder." >&2; exit 1; }
grep -q "ManagedCluster" Program.cs 2>/dev/null || { echo "Program.cs here doesn't look like the cluster program." >&2; exit 1; }
[ -e aks-cluster ] && { echo "aks-cluster/ already exists — remove it first." >&2; exit 1; }

PROJECT="$(awk '/^name:/{print $2; exit}' Pulumi.yaml)"
echo "▶ Splitting project '$PROJECT' → aks-cluster/ (same stack) + workload/ (empty)"

mkdir aks-cluster workload

# 1. Move the project files into aks-cluster/ (name unchanged → same stack).
mv Program.cs Pulumi.yaml Pulumi.dev.yaml *.csproj aks-cluster/
rm -rf bin obj   # stale build output from the flat layout

# 2. Overwrite Program.cs with the cluster-only program (cat stripped, import kept).
cat > aks-cluster/Program.cs <<'CSHARP'
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
using Cmd = Pulumi.Command.Local;

// Stage 03 — the CLUSTER stack. RG + AKS + ACR + AcrPull + image import, and it
// EXPORTS the kubeconfig + ACR login server for the workload stack. No app here.
// Project name is UNCHANGED, so this is the SAME stack as Stage 2 — `pulumi up`
// just removes the cat Deployment + Service; the cluster is untouched.

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

    var registry = new CR.Registry("acr", new CR.RegistryArgs
    {
        ResourceGroupName = rg.Name,
        Sku = new CRI.SkuArgs { Name = CR.SkuName.Basic },
        AdminUserEnabled = false,
    });

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

    // Keep the image import with the registry — the image belongs to the infra.
    var import = new Cmd.Command("import-cat-image", new Cmd.CommandArgs
    {
        Create = registry.Name.Apply(n =>
            $"az acr import --name {n} --source docker.io/agbell/my-random-cat:latest --image my-random-cat:latest --force"),
    }, new CustomResourceOptions { DependsOn = { registry } });

    return new Dictionary<string, object?>
    {
        ["clusterName"]    = cluster.Name,
        ["acrLoginServer"] = registry.LoginServer,
        ["kubeconfig"]     = Output.CreateSecret(kubeconfig),   // consumed by the workload stack
    };
});
CSHARP

# 3. Pre-select the (same) stack so `pulumi up` in aks-cluster just works.
( cd aks-cluster && pulumi stack select dev >/dev/null 2>&1 || true )

cat <<EOF

✅ Split scaffolding ready.
   aks-cluster/  → project '$PROJECT', SAME stack (cluster code, cat stripped, import kept)
   workload/     → empty, yours to build (5c/5d)

Next (yours to run):
   cd aks-cluster && pulumi up     # same cluster — removes cat Deployment + Service only
EOF
