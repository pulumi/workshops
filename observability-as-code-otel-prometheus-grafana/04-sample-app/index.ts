import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

// Step 4: the demo target. The image is loaded straight into kind with
// `kind load docker-image` (build-and-load.sh) rather than pushed to a
// registry -- the brief's presenter-setup step calls for a registry
// reachable from the cluster; `kind load` satisfies that same requirement
// with no registry to run or credential to mint for a local workshop.

const config = new pulumi.Config();
const clusterStack = new pulumi.StackReference(config.require("clusterStackRef"));
const collectorStack = new pulumi.StackReference(config.require("collectorStackRef"));
const demoNamespace = clusterStack.getOutput("demoNamespaceName");
const image = config.require("image");

// `renderYamlToDirectory` and `kubeconfig`/`context` are mutually exclusive on
// this provider, so this project can be verified offline (rendered manifests,
// read back and grepped) without a reachable cluster. Set the config value
// only to exercise that path; leave it unset for a real `pulumi up`.
const renderYamlToDirectory = config.get("renderYamlToDirectory");
const provider = renderYamlToDirectory
    ? new k8s.Provider("kind", { renderYamlToDirectory })
    : new k8s.Provider("kind", { kubeconfig: clusterStack.getOutput("rawKubeconfig") });

const labels = { app: "observability-sample-app" };

const deployment = new k8s.apps.v1.Deployment("sample-app", {
    metadata: { namespace: demoNamespace, labels },
    spec: {
        replicas: 1,
        selector: { matchLabels: labels },
        template: {
            metadata: { labels },
            spec: {
                containers: [{
                    name: "sample-app",
                    image,
                    imagePullPolicy: "Never", // image only exists inside the kind node, loaded by build-and-load.sh
                    ports: [{ name: "http", containerPort: 8080 }],
                    env: [
                        { name: "OTEL_SERVICE_NAME", value: "observability-sample-app" },
                        { name: "OTEL_EXPORTER_OTLP_ENDPOINT", value: pulumi.interpolate`http://${collectorStack.getOutput("otlpGrpcEndpoint")}` },
                    ],
                }],
            },
        },
    },
}, { provider });

const service = new k8s.core.v1.Service("sample-app", {
    metadata: { namespace: demoNamespace, labels },
    spec: {
        selector: labels,
        ports: [{ name: "http", port: 8080, targetPort: "http" }],
    },
}, { provider });

export const sampleAppServiceName = service.metadata.name;
