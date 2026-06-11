using System.Collections.Generic;
using System.IO;
using Pulumi;
using K8s = Pulumi.Kubernetes;
using Yaml = Pulumi.Kubernetes.Yaml;
using Core = Pulumi.Kubernetes.Core.V1;

// Stage 04 — same infra/workload split as 03, but the workload is your EXISTING
// Kubernetes YAML, driven via ConfigGroup instead of typed resources.
//
// The manifests reference the public `agbell/my-random-cat` image, as a team
// would already have written them. We DON'T edit the files — we read them and
// swap that image string for the ACR copy the cluster stack built, so the pods
// pull from our registry and nothing hits Docker Hub's rate limiter.

return await Pulumi.Deployment.RunAsync(() =>
{
    var cfg = new Config();
    var clusterStack = new StackReference(cfg.Require("clusterStack"));
    var kubeconfig = clusterStack.GetOutput("kubeconfig");
    var acrLoginServer = clusterStack.GetOutput("acrLoginServer");
    var catImage = acrLoginServer.Apply(s => $"{s}/my-random-cat:latest");

    var k8sProvider = new K8s.Provider("kubeKittiesK8s", new K8s.ProviderArgs
    {
        KubeConfig = kubeconfig.Apply(o => (string)o!),
        EnableServerSideApply = true,
    });

    // Read the raw manifests and point the image at our ACR copy — a plain text
    // swap; the files on disk stay as-written. catImage is an Output (the ACR
    // host isn't known until the cluster stack resolves), so the rewritten
    // Deployment YAML is an Output<string> too — ConfigGroup.Yaml accepts that.
    var serviceYaml = File.ReadAllText("manifests/cat-service.yaml");
    var deploymentYaml = catImage.Apply(img =>
        File.ReadAllText("manifests/cat-deployment.yaml")
            .Replace("agbell/my-random-cat:latest", img));

    var catManifests = new Yaml.ConfigGroup("cat-manifests", new Yaml.ConfigGroupArgs
    {
        Yaml = { serviceYaml, deploymentYaml },
    }, new ComponentResourceOptions { Provider = k8sProvider });

    // Reach into the ConfigGroup for the Service the YAML created, export its IP.
    var catService = catManifests.GetResource<Core.Service>("cat-service");

    return new Dictionary<string, object?>
    {
        ["catServiceIp"] = catService
            .Apply(s => s.Status)
            .Apply(st => st!.LoadBalancer.Ingress[0].Ip),
    };
});
