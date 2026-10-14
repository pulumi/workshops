import * as k8s from "@pulumi/kubernetes";

// Step 2: point the Pulumi Kubernetes provider at the local kind cluster.
// The context comes from stack config (kubernetes:context, set in
// Pulumi.dev.yaml to "kind-policy-demo") rather than being hardcoded here, so
// the same program works if a presenter renames the cluster via
// POLICY_DEMO_CLUSTER. `pulumi preview` against this provider and zero other
// resources is step 2's end state: it succeeds with no changes proposed.
const provider = new k8s.Provider("kind", {});

// Step 3: install Kyverno via the Pulumi Kubernetes provider's Helm support.
// Pin the chart version explicitly (stable, not a release-candidate) rather
// than trusting whatever `latest` resolves to at demo time.
//
// Source: https://artifacthub.io/packages/helm/kyverno/kyverno (read
// 2026-09-25) — kyverno/kyverno chart 3.9.1 is the current stable release.
const KYVERNO_CHART_VERSION = "3.9.1";

const namespace = new k8s.core.v1.Namespace(
    "kyverno",
    { metadata: { name: "kyverno" } },
    { provider },
);

// crds.install defaults to true on this chart, so the ClusterPolicy CRD that
// 03-cluster-policy depends on is installed here in the same step.
const kyverno = new k8s.helm.v4.Chart(
    "kyverno",
    {
        namespace: namespace.metadata.name,
        chart: "kyverno",
        version: KYVERNO_CHART_VERSION,
        repositoryOpts: {
            repo: "https://kyverno.github.io/kyverno/",
        },
    },
    { provider, dependsOn: [namespace] },
);

export const kubeContext = "kind-policy-demo";
export const kyvernoNamespace = namespace.metadata.name;
export const kyvernoChartVersion = KYVERNO_CHART_VERSION;
