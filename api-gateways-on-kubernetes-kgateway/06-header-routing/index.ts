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

// A second HTTPRoute, on its own path (`/headers`) so it never competes
// with `05-path-routing`'s `/a` and `/b` rules on the same Gateway. Two
// rules on the same path: the first requires the `x-backend: b` header and
// routes to app-b, the second has no header requirement and routes to
// app-a. The Gateway API spec resolves overlapping matches by specificity
// (a rule with more match criteria -- path AND header -- outranks a rule
// with fewer -- path only), so the header rule wins whenever the header is
// present, and the plain path rule is the fallback. Header matches are
// core/GA fields of the standard channel, same as path matches
// (https://kgateway.dev/docs/envoy/latest/reference/versions/, read
// 2026-09-28).
const httpRoute = new k8s.apiextensions.CustomResource("header-routing", {
    apiVersion: "gateway.networking.k8s.io/v1",
    kind: "HTTPRoute",
    metadata: {
        name: "header-routing",
        namespace,
    },
    spec: {
        parentRefs: [{ name: gatewayName }],
        rules: [
            {
                matches: [{
                    path: { type: "PathPrefix", value: "/headers" },
                    headers: [{ name: "x-backend", value: "b" }],
                }],
                backendRefs: [{ name: appBServiceName, port: backendPort }],
            },
            {
                matches: [{ path: { type: "PathPrefix", value: "/headers" } }],
                backendRefs: [{ name: appAServiceName, port: backendPort }],
            },
        ],
    },
}, { provider });

export { kubeconfigContext, namespace, gatewayName };
export const httpRouteName = httpRoute.metadata.name;