using Pulumi;
using K8s = Pulumi.Kubernetes;
using Yaml = Pulumi.Kubernetes.Yaml;

// Stage 04 — same infra/workload split as 03, but the workload is your EXISTING
// Kubernetes YAML. Pulumi drives the raw manifests via ConfigGroup instead of
// typed resources — the on-ramp for teams that already have manifests. (The
// manifests pull from DockerHub as-written; nothing here is Azure-specific.)

return await Pulumi.Deployment.RunAsync(() =>
{
    var cfg = new Config();
    var clusterStack = new StackReference(cfg.Require("clusterStack"));
    var kubeconfig = clusterStack.GetOutput("kubeconfig");

    var k8sProvider = new K8s.Provider("kubeKittiesK8s", new K8s.ProviderArgs
    {
        KubeConfig = kubeconfig.Apply(o => (string)o!),
        EnableServerSideApply = true,
    });

    // Point Pulumi at the existing manifests. Pulumi tracks the dependency graph
    // between them (Service ↔ Deployment) and applies in the right order.
    var catManifests = new Yaml.ConfigGroup("cat-manifests", new Yaml.ConfigGroupArgs
    {
        Files = new[] { "manifests/*.yaml" },
    }, new ComponentResourceOptions { Provider = k8sProvider });
});
