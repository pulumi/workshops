import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

// Read the kubeconfig context from the cluster-and-controller stack rather
// than re-declaring it, so this project always targets whatever kind
// cluster `01-kgateway-install` actually created.
const config = new pulumi.Config();
const installStackRefName = config.get("installStackRef") || "<org>/api-gateways-workshop-install/dev";
const installStackRef = new pulumi.StackReference(installStackRefName);
const kubeconfigContext = installStackRef.getOutput("kubeconfigContext");

// Same provider-construction pattern as every project in this workshop:
// renderYamlToDirectory lets tsc/preview run offline in a sandbox with no
// live cluster; context drives the real kind demo. Never both at once.
const renderYamlToDirectory = config.get("renderYamlToDirectory");
const provider = renderYamlToDirectory
    ? new k8s.Provider("k8s", { renderYamlToDirectory })
    : new k8s.Provider("k8s", { context: kubeconfigContext });

// kgateway's Helm chart already creates a default GatewayClass named
// `kgateway` on install, pointed at the same controller
// (https://kgateway.dev/docs/envoy/latest/setup/default/, read
// 2026-09-28). This workshop provisions a second, explicit GatewayClass
// with Pulumi instead of relying on that one, for one reason: brief step 3
// is specifically about a participant declaring and inspecting a
// GatewayClass as its own resource, not about kgateway's install-time
// defaults. A production deployment could reuse the chart's own `kgateway`
// class directly and skip this project entirely; see AGENTS.md.
const gatewayClassNameLiteral = "kgateway-workshop";

const gatewayClass = new k8s.apiextensions.CustomResource("gateway-class", {
    apiVersion: "gateway.networking.k8s.io/v1",
    kind: "GatewayClass",
    metadata: {
        name: gatewayClassNameLiteral,
    },
    spec: {
        controllerName: "kgateway.dev/kgateway",
        description: "Workshop GatewayClass for API gateways as code, pointed at kgateway.",
    },
}, { provider });

export { kubeconfigContext };
export const gatewayClassName = gatewayClass.metadata.name;