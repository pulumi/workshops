using System.Collections.Generic;
using Pulumi;
using K8s = Pulumi.Kubernetes;
using Apps = Pulumi.Kubernetes.Apps.V1;
using Core = Pulumi.Kubernetes.Core.V1;
using AppsIn = Pulumi.Kubernetes.Types.Inputs.Apps.V1;
using CoreIn = Pulumi.Kubernetes.Types.Inputs.Core.V1;
using MetaIn = Pulumi.Kubernetes.Types.Inputs.Meta.V1;

// Stage 03 — the WORKLOAD stack. Owns nothing about the cluster; it pulls the
// kubeconfig + ACR login server from the cluster stack via a StackReference,
// then deploys the cat app. Separating the fast-moving workload from the
// slow-moving infra is the whole point.

return await Pulumi.Deployment.RunAsync(() =>
{
    var cfg = new Config();
    var clusterStackName = cfg.Require("clusterStack");   // e.g. org/kube-kitties-cluster/dev
    var clusterStack = new StackReference(clusterStackName);

    var kubeconfig = clusterStack.GetOutput("kubeconfig");
    var acrLoginServer = clusterStack.GetOutput("acrLoginServer");
    var catImage = acrLoginServer.Apply(s => $"{s}/my-random-cat:latest");

    var k8sProvider = new K8s.Provider("kubeKittiesK8s", new K8s.ProviderArgs
    {
        KubeConfig = kubeconfig.Apply(o => (string)o!),
        EnableServerSideApply = true,
    });
    var opts = new CustomResourceOptions { Provider = k8sProvider };

    var labels = new InputMap<string> { { "app", "cat-app" } };

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
    }, opts);

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
        ["catServiceIp"] = catService.Status.Apply(s => s!.LoadBalancer.Ingress[0].Ip),
    };
});
