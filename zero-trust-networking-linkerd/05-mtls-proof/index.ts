import * as k8s from "@pulumi/kubernetes";

// Step 5: install linkerd-viz so `linkerd viz edges` and `linkerd viz tap`
// can show the mutual TLS Linkerd already established in step 4. Viz is an
// observability extension, not part of the control plane itself, so it is
// its own Pulumi program rather than folded into 03-control-plane.
//
// Source: https://helm.linkerd.io/stable/index.yaml (read 2026-09-25) — the
// current stable linkerd-viz chart is 2026.6.3, matching linkerd-crds and
// linkerd-control-plane so all three components come from the same release.
const LINKERD_VIZ_CHART_VERSION = "2026.6.3";

const provider = new k8s.Provider("kind", {});

const namespace = new k8s.core.v1.Namespace(
    "linkerd-viz",
    { metadata: { name: "linkerd-viz" } },
    { provider },
);

// linkerd-viz installs into its own `linkerd-viz` namespace and talks to
// the control plane's identity service using the mesh's own mTLS, so it
// depends on 03-control-plane's Deployments being Running, not just its
// Pulumi resources existing. That ordering is enforced live with
// `wait-for-control-plane.sh`, the same pattern 03-control-plane uses for
// linkerd-crds before linkerd-control-plane.
const viz = new k8s.helm.v4.Chart(
    "linkerd-viz",
    {
        namespace: namespace.metadata.name,
        chart: "linkerd-viz",
        version: LINKERD_VIZ_CHART_VERSION,
        repositoryOpts: {
            repo: "https://helm.linkerd.io/stable",
        },
    },
    { provider, dependsOn: [namespace] },
);

export const vizChartVersion = LINKERD_VIZ_CHART_VERSION;
export const vizNamespace = "linkerd-viz";
