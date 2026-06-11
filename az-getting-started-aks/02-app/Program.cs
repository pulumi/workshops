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
using K8s = Pulumi.Kubernetes;
using Apps = Pulumi.Kubernetes.Apps.V1;
using Core = Pulumi.Kubernetes.Core.V1;
using AppsIn = Pulumi.Kubernetes.Types.Inputs.Apps.V1;
using CoreIn = Pulumi.Kubernetes.Types.Inputs.Core.V1;
using MetaIn = Pulumi.Kubernetes.Types.Inputs.Meta.V1;

// Getting Started with AKS — Stage 02: cluster + cat app.
// The whole story in one program: stand up AKS, fetch its kubeconfig, point a
// Kubernetes provider at it, and deploy "Kube Kitties" — all with `pulumi up`.

return await Pulumi.Deployment.RunAsync(() =>
{
    // --- Azure: Resource Group + AKS cluster ---------------------------------
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
        // AKS-native: Cilium / Dataplane V2 (eBPF networking + network policy)
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
                Count = 2,                 // demo size — 2 nodes so we can see pods spread
                VmSize = "Standard_B2ms",
                OsType = "Linux",
                OsDiskSizeGB = 30,
                Type = "VirtualMachineScaleSets",
                Mode = "System",
            },
        },
    });

    // --- Fetch the kubeconfig programmatically -------------------------------
    var creds = AC.ListManagedClusterUserCredentials.Invoke(new AC.ListManagedClusterUserCredentialsInvokeArgs
    {
        ResourceGroupName = rg.Name,
        ResourceName = cluster.Name,
    });

    var kubeconfig = creds.Apply(c =>
        Encoding.UTF8.GetString(System.Convert.FromBase64String(c.Kubeconfigs[0].Value)));

    // --- Programmatic Kubernetes provider ------------------------------------
    var k8sProvider = new K8s.Provider("kubeKittiesK8s", new K8s.ProviderArgs
    {
        KubeConfig = Output.CreateSecret(kubeconfig),
        EnableServerSideApply = true,
    });
    var opts = new CustomResourceOptions { Provider = k8sProvider };

    // --- AKS-native: Azure Container Registry + AcrPull ----------------------
    // The registry and the cluster are both Azure resources; Pulumi wires the
    // pull-permission between them, and builds the cat image into ACR (no local
    // Docker, no Docker Hub pull of our app image).
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

    // Build the cat image straight into our ACR. The build runs in ACR Tasks
    // (no local Docker), and our app image never touches Docker Hub's pull
    // limiter — only the base image in the Dockerfile is fetched, by ACR's
    // build infra. Source is in app/ (Dockerfile + Flask app).
    var build = new Cmd.Command("build-cat-image", new Cmd.CommandArgs
    {
        Create = registry.Name.Apply(n =>
            $"az acr build --registry {n} --image my-random-cat:latest app"),
    }, new CustomResourceOptions { DependsOn = { registry } });

    var catImage = registry.LoginServer.Apply(s => $"{s}/my-random-cat:latest");

    // --- The cat app (pulled from our ACR) -----------------------------------
    var labels = new InputMap<string> { { "app", "cat-app" } };

    var catOpts = new CustomResourceOptions { Provider = k8sProvider, DependsOn = { build } };

    var catDeployment = new Apps.Deployment("cat-deployment", new AppsIn.DeploymentArgs
    {
        Metadata = new MetaIn.ObjectMetaArgs { Name = "cat-deployment" },
        Spec = new AppsIn.DeploymentSpecArgs
        {
            Replicas = 2,
            Selector = new MetaIn.LabelSelectorArgs { MatchLabels = labels },
            Template = new CoreIn.PodTemplateSpecArgs
            {
                Metadata = new MetaIn.ObjectMetaArgs { Labels = labels },
                Spec = new CoreIn.PodSpecArgs
                {
                    NodeSelector = { { "kubernetes.io/os", "linux" } },
                    Containers =
                    {
                        new CoreIn.ContainerArgs
                        {
                            Name = "cat-server",
                            Image = catImage,
                            Ports = { new CoreIn.ContainerPortArgs { ContainerPortValue = 8080 } },
                        },
                    },
                },
            },
        },
    }, catOpts);

    var catService = new Core.Service("cat-service", new CoreIn.ServiceArgs
    {
        Metadata = new MetaIn.ObjectMetaArgs { Name = "cat-service" },
        Spec = new CoreIn.ServiceSpecArgs
        {
            Type = "LoadBalancer",
            Selector = labels,
            Ports = { new CoreIn.ServicePortArgs { Port = 80, TargetPort = 8080, Protocol = "TCP" } },
        },
    }, opts);

    return new Dictionary<string, object?>
    {
        ["clusterName"] = cluster.Name,
        ["catServiceIp"] = catService.Status.Apply(s => s!.LoadBalancer.Ingress[0].Ip),
    };
});
