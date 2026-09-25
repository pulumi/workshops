import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

// Step 6: the traffic policy this workshop's title promises. Three CRDs
// declared as Pulumi code, not `kubectl apply -f policy.yaml`:
//
//   Server                 — names the backend's port; once it exists,
//                             everything to that port is denied by default
//                             unless an AuthorizationPolicy says otherwise.
//   MeshTLSAuthentication  — names the mesh identity allowed through.
//   AuthorizationPolicy    — ties the two together: only the `front`
//                             ServiceAccount's mesh identity may reach the
//                             `backend` Server.
//
// API versions confirmed live 2026-09-25 against
// https://linkerd.io/docs/reference/authorization-policy/ — Server is
// policy.linkerd.io/v1beta1; AuthorizationPolicy and MeshTLSAuthentication
// are still policy.linkerd.io/v1alpha1 (not yet promoted to v1beta1).
const provider = new k8s.Provider("kind", {});

const namespace = "mesh-demo";
const backendServer = new k8s.apiextensions.CustomResource(
    "backend-server",
    {
        apiVersion: "policy.linkerd.io/v1beta1",
        kind: "Server",
        metadata: { namespace, name: "backend" },
        spec: {
            podSelector: { matchLabels: { app: "backend" } },
            port: "http",
            proxyProtocol: "HTTP/1",
        },
    },
    { provider },
);

// The only identity allowed to call the backend Server: the `front`
// ServiceAccount created in 04-meshed-services. `identityRefs` is used
// rather than a spelled-out identity string, so this stays correct if the
// cluster's trust domain (cluster.local) ever changes.
const frontIdentity = new k8s.apiextensions.CustomResource(
    "front-identity",
    {
        apiVersion: "policy.linkerd.io/v1alpha1",
        kind: "MeshTLSAuthentication",
        metadata: { namespace, name: "front-identity" },
        spec: {
            identityRefs: [{ kind: "ServiceAccount", name: "front" }],
        },
    },
    { provider },
);

const backendAuthzPolicy = new k8s.apiextensions.CustomResource(
    "backend-authz",
    {
        apiVersion: "policy.linkerd.io/v1alpha1",
        kind: "AuthorizationPolicy",
        metadata: { namespace, name: "backend-authz" },
        spec: {
            targetRef: {
                group: "policy.linkerd.io",
                kind: "Server",
                name: "backend",
            },
            requiredAuthenticationRefs: [
                {
                    group: "policy.linkerd.io",
                    kind: "MeshTLSAuthentication",
                    name: "front-identity",
                },
            ],
        },
    },
    { provider, dependsOn: [backendServer, frontIdentity] },
);

export const backendServerName = pulumi.output("backend");
export const authorizedIdentity = pulumi.output(
    "front.mesh-demo.serviceaccount.identity.linkerd.cluster.local",
);
