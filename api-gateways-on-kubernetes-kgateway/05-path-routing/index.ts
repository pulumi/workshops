import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

const config = new pulumi.Config();
const installStackRefName = config.get("installStackRef") || "<org>/api-gateways-workshop-install/dev";
const gatewayStackRefName = config.get("gatewayStackRef") || "<org>/api-gateways-workshop-gateway/dev";
const backendsStackRefName = config.get("backendsStackRef") || "<org>/api-gateways-workshop-backends/dev";
const installStackRef = new pulumi.StackReference(installStackRefName);
const gatewayStackRef = new pulumi.StackReference(gatewayStackRefName);
const backendsStackRef = new pulumi.StackReference(backendsStackRefName);

const kubeconfigContext = installStackRef.getOutput("kubeconfigContext");
const namespace = gatewayStackRef.getOutput("namespace");
const gatewayName = gatewayStackRef.getOutput("gatewayName");
const appAServiceName = backendsStackRef.getOutput("appAServiceName");
const appBServiceName = backendsStackRef.getOutput("appBServiceName");
const backendPort = backendsStackRef.getOutput("backendPort");

const renderYamlToDirectory = config.get("renderYamlToDirectory");
const provider = renderYamlToDirectory
    ? new k8s.Provider("k8s", { renderYamlToDirectory })
    : new k8s.Provider("k8s", { context: kubeconfigContext });

// Path-based split: `/a` to app-a, `/b` to app-b. `PathPrefix` matches are
// core/GA fields of the Gateway API standard channel
// (https://kgateway.dev/docs/envoy/latest/reference/versions/, read
// 2026-09-28), not an experimental-only feature.
const httpRoute = new k8s.apiextensions.CustomResource("path-routing", {
    apiVersion: "gateway.networking.k8s.io/v1",
    kind: "HTTPRoute",
    metadata: {
        name: "path-routing",
        namespace,
    },
    spec: {
        parentRefs: [{ name: gatewayName }],
        rules: [
            {
                matches: [{ path: { type: "PathPrefix", value: "/a" } }],
                backendRefs: [{ name: appAServiceName, port: backendPort }],
            },
            {
                matches: [{ path: { type: "PathPrefix", value: "/b" } }],
                backendRefs: [{ name: appBServiceName, port: backendPort }],
            },
        ],
    },
}, { provider });

export { kubeconfigContext, namespace, gatewayName };
export const httpRouteName = httpRoute.metadata.name;