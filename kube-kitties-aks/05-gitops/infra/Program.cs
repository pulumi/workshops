using System.Text;
using System.Collections.Generic;
using Pulumi;
using Pulumi.AzureNative.Resources;
using AC = Pulumi.AzureNative.ContainerService;
using ACI = Pulumi.AzureNative.ContainerService.Inputs;
using K8s = Pulumi.Kubernetes;
using Helm = Pulumi.Kubernetes.Helm.V3;
using HelmInputs = Pulumi.Kubernetes.Types.Inputs.Helm.V3;
using Yaml = Pulumi.Kubernetes.Yaml;

// Stage 05 — GitOps (take-home; not demoed live).
// Pulumi's job stops at "stand up the cluster + install Argo CD + register the
// app." From there the cat is delivered by GITOPS: Argo watches a git path and
// reconciles it. Changing the cat = git push, not `pulumi up`.

return await Pulumi.Deployment.RunAsync(() =>
{
    var rg = new ResourceGroup("kubeKittiesRg", new() { ResourceGroupName = "kube-kitties-rg" });

    var cluster = new AC.ManagedCluster("kubeKitties", new()
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
            NetworkDataplane = "cilium", NetworkPlugin = "azure",
            NetworkPluginMode = "overlay", NetworkPolicy = "cilium", PodCidr = "192.168.0.0/16",
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

    var creds = AC.ListManagedClusterUserCredentials.Invoke(new()
    {
        ResourceGroupName = rg.Name, ResourceName = cluster.Name,
    });
    var kubeconfig = creds.Apply(c =>
        Encoding.UTF8.GetString(System.Convert.FromBase64String(c.Kubeconfigs[0].Value)));

    var k8s = new K8s.Provider("kubeKittiesK8s", new()
    {
        KubeConfig = Output.CreateSecret(kubeconfig),
        EnableServerSideApply = true,
    });

    // 1. Install Argo CD via its Helm chart (brings the Application CRD with it).
    //    Helm.V3.Release runs a real `helm install` server-side — so Helm HOOKS
    //    execute (Argo's redis-auth secret is created by a pre-install hook; the
    //    client-side Helm.V4.Chart skips hooks and the redis/server pods then wedge
    //    on a missing `argocd-redis` secret). Release also creates the namespace
    //    and waits for the release to become ready.
    var argo = new Helm.Release("argocd", new()
    {
        Chart = "argo-cd",
        Namespace = "argocd",
        CreateNamespace = true,
        RepositoryOpts = new HelmInputs.RepositoryOptsArgs
        {
            Repo = "https://argoproj.github.io/argo-helm",
        },
    }, new CustomResourceOptions { Provider = k8s });

    // 2. Register the cat as an Argo Application (points at a git path). Argo then
    //    pulls from git and applies it — Pulumi never touches the cat itself.
    //    DependsOn the chart so the Application CRD exists before we create the CR.
    var catApp = new Yaml.ConfigFile("cat-app", new()
    {
        File = "argo-cat-app.yaml",
    }, new ComponentResourceOptions { Provider = k8s, DependsOn = { argo } });

    return new Dictionary<string, object?>
    {
        ["clusterName"] = cluster.Name,
        // The cat's LoadBalancer IP is created by Argo (not Pulumi), so it isn't a
        // Pulumi output. After sync:  kubectl get svc cat-service -n default
        ["note"] = "Argo reconciles the cat from git; get its IP via kubectl, not pulumi stack output.",
    };
});
