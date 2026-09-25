import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

// Step 3: point the Pulumi Kubernetes provider at the local kind cluster.
// The context comes from stack config (kubernetes:context, set in
// Pulumi.dev.yaml to "kind-mesh-demo") so the same program works if a
// presenter renames the cluster via MESH_DEMO_CLUSTER.
const provider = new k8s.Provider("kind", {});

// Pull the trust anchor and issuer certificate built in 02-trust-anchor as a
// StackReference, rather than re-deriving them or hand-copying files between
// steps — the whole chain from root cert to control plane stays Pulumi code.
const config = new pulumi.Config();
const trustAnchorStack = new pulumi.StackReference(
    config.require("trustAnchorStack"),
);
const trustAnchorPem = trustAnchorStack.getOutput("trustAnchorPem");
const issuerCertPem = trustAnchorStack.getOutput("issuerCertPem");
const issuerKeyPem = trustAnchorStack.getOutput("issuerKeyPem");

// Pin the exact chart version tied to the Linkerd 2.20 stable milestone
// (announced 2026-06-23, corresponding edge release edge-26.6.3), not
// whatever edge tag is newest at demo time — Linkerd's own "stable" Helm
// repo now only serves legacy pre-2.12 releases, so the edge repo pinned to
// this exact version is the current stable-equivalent artifact.
// Source: https://linkerd.io/2026/06/23/announcing-linkerd-2.20/ and
// https://helm.linkerd.io/edge/index.yaml, both read 2026-09-25.
const LINKERD_CHART_VERSION = "2026.6.3";
const LINKERD_HELM_REPO = "https://helm.linkerd.io/edge";

const namespace = new k8s.core.v1.Namespace(
    "linkerd",
    { metadata: { name: "linkerd" } },
    { provider },
);

// linkerd-crds installs the CRDs the control plane and its policy resources
// need (including the policy.linkerd.io Server/AuthorizationPolicy/
// MeshTLSAuthentication kinds used in 06-authorization-policy). Gateway API
// CRDs are not required for this scope: they are only needed for
// HTTPRoute-based policy, which this workshop does not use.
const linkerdCrds = new k8s.helm.v4.Chart(
    "linkerd-crds",
    {
        namespace: namespace.metadata.name,
        chart: "linkerd-crds",
        version: LINKERD_CHART_VERSION,
        repositoryOpts: { repo: LINKERD_HELM_REPO },
    },
    { provider, dependsOn: [namespace] },
);

// linkerd-control-plane: the identity, destination and proxy-injector
// services. The trust anchor and issuer certificate/key are supplied
// directly as chart values — the same three value keys the Linkerd Helm
// install docs use (identityTrustAnchorsPEM, identity.issuer.tls.crtPEM,
// identity.issuer.tls.keyPEM). identity.issuer.scheme defaults to
// "linkerd.io/tls" (the self-managed scheme), which is what we want since
// we are supplying the PEMs ourselves rather than letting cert-manager
// manage them.
const linkerdControlPlane = new k8s.helm.v4.Chart(
    "linkerd-control-plane",
    {
        namespace: namespace.metadata.name,
        chart: "linkerd-control-plane",
        version: LINKERD_CHART_VERSION,
        repositoryOpts: { repo: LINKERD_HELM_REPO },
        values: {
            identityTrustAnchorsPEM: trustAnchorPem,
            identity: {
                issuer: {
                    tls: {
                        crtPEM: issuerCertPem,
                        keyPEM: issuerKeyPem,
                    },
                },
            },
        },
    },
    { provider, dependsOn: [linkerdCrds] },
);

export const kubeContext = "kind-mesh-demo";
export const linkerdNamespace = namespace.metadata.name;
export const linkerdChartVersion = LINKERD_CHART_VERSION;
export const controlPlaneResourceName = linkerdControlPlane.urn;
