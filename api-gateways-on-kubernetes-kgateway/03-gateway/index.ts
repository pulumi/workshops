import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

const config = new pulumi.Config();
const installStackRefName = config.get("installStackRef") || "<org>/api-gateways-workshop-install/dev";
const gatewayClassStackRefName = config.get("gatewayClassStackRef") || "<org>/api-gateways-workshop-gatewayclass/dev";
const installStackRef = new pulumi.StackReference(installStackRefName);
const gatewayClassStackRef = new pulumi.StackReference(gatewayClassStackRefName);
const kubeconfigContext = installStackRef.getOutput("kubeconfigContext");
const gatewayClassName = gatewayClassStackRef.getOutput("gatewayClassName");

const renderYamlToDirectory = config.get("renderYamlToDirectory");
const provider = renderYamlToDirectory
    ? new k8s.Provider("k8s", { renderYamlToDirectory })
    : new k8s.Provider("k8s", { context: kubeconfigContext });

// The workshop's own workload namespace, separate from kgateway's system
// namespace (`kgateway-system`, created in `01-kgateway-install`). Every
// project from here on -- the Gateway, the backends, both HTTPRoutes --
// lives here.
const namespaceRes = new k8s.core.v1.Namespace("gateway-demo", {
    metadata: { name: "gateway-demo" },
}, { provider });

// The Gateway resource itself: one HTTP listener on port 80, named `http`.
// kgateway's own sample-app docs create a Gateway named `http` and reach it
// afterward with `kubectl port-forward deployment/http -n <namespace>
// 8080:8080` -- the generated proxy Deployment/Service take the Gateway's
// own name in the Gateway's own namespace
// (https://kgateway.dev/docs/envoy/latest/install/sample-app/, read
// 2026-09-28, where both the Gateway and its proxy Service are named
// `http` in the same namespace, `kgateway-system`, in that doc's example).
// This workshop keeps the same Gateway name (`http`) but places it in
// `gateway-demo` instead, to keep the controller's system namespace free
// of workshop objects -- the proxy Deployment/Service are expected to
// follow into `gateway-demo` the same way, by the same naming pattern, but
// that specific detail could not be confirmed against a live cluster on
// this build workstation (no docker/kind/kubectl available); verify the
// exact namespace of the generated `http` Deployment/Service during
// rehearsal and adjust the `kubectl port-forward` command in the README if
// it differs. See AGENTS.md.
const gateway = new k8s.apiextensions.CustomResource("gateway", {
    apiVersion: "gateway.networking.k8s.io/v1",
    kind: "Gateway",
    metadata: {
        name: "http",
        namespace: namespaceRes.metadata.name,
    },
    spec: {
        gatewayClassName,
        listeners: [{
            name: "http",
            protocol: "HTTP",
            port: 80,
        }],
    },
}, { provider });

export { kubeconfigContext, gatewayClassName };
export const namespace = namespaceRes.metadata.name;
export const gatewayName = gateway.metadata.name;