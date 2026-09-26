import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

// KubeVirt has no official Helm chart (see the "No Helm chart" note under
// https://kubevirt.io/user-guide/cluster_admin/installation/). The documented
// install path is applying two pinned release YAML manifests: the operator
// manifest, then the KubeVirt custom resource that tells the operator what to
// deploy. This project follows that path with `k8s.yaml.v2.ConfigFile` for
// the operator manifest and a typed `k8s.apiextensions.CustomResource` for
// the CR, instead of a Helm release.

const kubevirtVersion = "v1.9.0";
const kubevirtNamespaceName = "kubevirt";

const config = new pulumi.Config();
const useEmulation = config.getBoolean("useEmulation") ?? true;
const renderYamlToDirectory = config.get("renderYamlToDirectory");

// Cross-stack reference to 02-cluster, which provisions the kind cluster and
// exports the kubeconfig context to connect through. The default below is a
// placeholder: edit it to the real "<org>/<project>/<stack>" for a live run
// (see ../02-cluster/Pulumi.yaml for the project name and ../README.md for
// the org), or set `vms-kubevirt:clusterStackRef` in Pulumi.<stack>.yaml.
const clusterStackRef = config.get("clusterStackRef") ?? "<org>/vms-cluster/dev";
const clusterStack = new pulumi.StackReference(clusterStackRef);
const kubeconfigContext = clusterStack.getOutput("kubeconfigContext");

// `renderYamlToDirectory` lets this project be verified offline (TypeScript
// compiles, manifests render to disk) on a workstation with no reachable
// kind cluster: per the k8s.Provider docs, when set, resources render to
// that directory instead of requiring a live cluster, and rendering
// proceeds even when no cluster is reachable. The provider rejects `context`
// and `renderYamlToDirectory` together (verified: "context arg is not
// compatible with renderYamlToDirectory arg"), so `context` is only passed
// when rendering is not requested.
const provider = renderYamlToDirectory
    ? new k8s.Provider("kind", { renderYamlToDirectory })
    : new k8s.Provider("kind", { context: kubeconfigContext });

// The operator manifest creates the `kubevirt` namespace, its CRDs
// (including the `KubeVirt` CRD the CustomResource below depends on), and the
// virt-operator deployment.
const operatorConfigFile = new k8s.yaml.v2.ConfigFile(
    "kubevirt-operator",
    {
        file: `https://github.com/kubevirt/kubevirt/releases/download/${kubevirtVersion}/kubevirt-operator.yaml`,
    },
    { provider },
);

// The KubeVirt CR tells virt-operator what to deploy and how to configure it.
// Applying it as a typed CustomResource (rather than a second ConfigFile)
// lets useEmulation be driven from Pulumi config directly, instead of
// templating a YAML string. `dependsOn` is required here because the CR's
// `kubevirt.io/v1` API only exists once the operator's ConfigFile has
// installed the KubeVirt CRD.
const kubevirtCr = new k8s.apiextensions.CustomResource(
    "kubevirt",
    {
        apiVersion: "kubevirt.io/v1",
        kind: "KubeVirt",
        metadata: {
            name: "kubevirt",
            namespace: kubevirtNamespaceName,
        },
        spec: {
            configuration: {
                developerConfiguration: {
                    useEmulation,
                },
            },
        },
    },
    { provider, dependsOn: [operatorConfigFile] },
);

export const kubevirtNamespace = kubevirtNamespaceName;
export { kubevirtVersion };
export const kubevirtCrName = kubevirtCr.metadata.name;
