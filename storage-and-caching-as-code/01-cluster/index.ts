import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

// One Provider per project. Online it talks to the kind cluster through its
// kubeconfig context. Offline (preview without a cluster) set
// `renderYamlToDirectory` and it writes manifests instead. The provider rejects
// both settings together, so exactly one of them is ever passed.
const config = new pulumi.Config();
const renderDir = config.get("renderYamlToDirectory");
const provider = new k8s.Provider(
    "k8s",
    renderDir
        ? { renderYamlToDirectory: renderDir }
        : { context: config.get("kubeContext") ?? "kind-storage-workshop" },
);
const opts: pulumi.CustomResourceOptions = { provider };

// The kind cluster itself is created by scripts/cluster-up.sh (kind has no
// Pulumi provider). This project owns what lives inside it: the namespace that
// steps 4 to 7 deploy into.
const demoNamespace = config.get("demoNamespace") ?? "demo";

const ns = new k8s.core.v1.Namespace("demo", {
    metadata: { name: demoNamespace, labels: { workshop: "storage-and-caching-as-code" } },
}, opts);

export const namespace = ns.metadata.name;
