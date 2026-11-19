import * as path from "path";
import * as command from "@pulumi/command";
import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

// Step 1 of "Observability as code": stand up a local kind cluster and the
// two namespaces the rest of the workshop deploys into. kind is not a cloud
// provider Pulumi has a resource for, so cluster lifecycle runs through
// `@pulumi/command`'s local.Command, exactly the pattern the
// pulumi-automation-api / pulumi-best-practices skills describe for
// shelling out to a CLI Pulumi does not model directly.

const config = new pulumi.Config();
const clusterName = config.get("clusterName") ?? "observability-workshop";
const kindConfigPath = path.join(__dirname, "kind.yaml");

const cluster = new command.local.Command("create-cluster", {
    create: pulumi.interpolate`kind create cluster --name ${clusterName} --config ${kindConfigPath} --wait 120s`,
    delete: pulumi.interpolate`kind delete cluster --name ${clusterName}`,
});

// `kind get kubeconfig` prints a kubeconfig scoped to this one cluster, so
// downstream projects do not need the presenter's default kubeconfig file to
// exist or be selected to the right context.
const kubeconfig = new command.local.Command(
    "read-kubeconfig",
    { create: pulumi.interpolate`kind get kubeconfig --name ${clusterName}` },
    { dependsOn: cluster },
);

const provider = new k8s.Provider("kind", {
    kubeconfig: kubeconfig.stdout,
});

const monitoringNamespace = new k8s.core.v1.Namespace(
    "monitoring",
    { metadata: { name: "monitoring" } },
    { provider },
);

const demoNamespace = new k8s.core.v1.Namespace(
    "demo",
    { metadata: { name: "demo" } },
    { provider },
);

export const kubeconfigContext = pulumi.interpolate`kind-${clusterName}`;
export const monitoringNamespaceName = monitoringNamespace.metadata.name;
export const demoNamespaceName = demoNamespace.metadata.name;
// Consumed by every downstream project's `k8s.Provider({ kubeconfig })` via
// StackReference; never printed with `pulumi env open` or logged in plaintext.
export const rawKubeconfig = pulumi.secret(kubeconfig.stdout);
