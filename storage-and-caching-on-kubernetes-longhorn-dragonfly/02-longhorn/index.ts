import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

// Read the kubeconfig context and the longhorn-system namespace from
// 01-cluster's stack rather than re-declaring them, so this project always
// targets whatever kind cluster 01-cluster actually created.
const config = new pulumi.Config();
const clusterStackRefName = config.get("clusterStackRef") || "<org>/storage-caching-cluster/dev";
const clusterStackRef = new pulumi.StackReference(clusterStackRefName);
const kubeconfigContext = clusterStackRef.getOutput("kubeconfigContext");
const longhornNamespaceName = clusterStackRef.getOutput("longhornNamespaceName");

// Same provider-construction pattern as every project in this workshop:
// renderYamlToDirectory lets tsc/preview/up run offline in a sandbox with
// no live cluster; context drives the real kind demo. Never both at once.
const renderYamlToDirectory = config.get("renderYamlToDirectory");
const provider = renderYamlToDirectory
    ? new k8s.Provider("k8s", { renderYamlToDirectory })
    : new k8s.Provider("k8s", { context: kubeconfigContext });

// Longhorn v1.12.1, the latest stable release as of 2026-09-28. Chart
// repo and install command straight from the official docs:
// https://longhorn.io/docs/1.12.1/deploy/install/install-with-helm/
// (read 2026-09-28)
//
// NOTE on the iscsi prerequisite: the brief called for a pinned prerequisite
// DaemonSet manifest (the historical `longhorn-iscsi-installation.yaml`).
// That manifest was removed from Longhorn's own repo after the v1.8.1
// release; the current official prerequisite check is the `longhornctl`
// CLI's `install preflight` command, run once against the cluster's
// kubeconfig before installing the chart:
//   longhornctl --kubeconfig ~/.kube/config --image longhornio/longhorn-cli:v1.12.1 install preflight
// This is a presenter-run, pre-`pulumi up` step documented in this
// workshop's README and AGENTS.md, not a Pulumi-managed resource: it is a
// one-shot host CLI check with no create/delete lifecycle Pulumi can
// usefully model, and wrapping it in `command.local.Command` would make
// every downstream `pulumi up` in this project depend on a binary
// (`longhornctl`) this build workstation does not have, the same problem
// `01-cluster` avoids for `kind` by keeping that command isolated to the
// cluster's own lifecycle.
// https://longhorn.io/docs/1.12.1/deploy/install/#install-prerequisites
// (read 2026-09-28)
// The chart declares `kubeVersion: >=1.25.0-0`. `01-cluster/kind.yaml`
// pins a `kindest/node` image built on a new enough Kubernetes for this to
// resolve; the offline render check for this project needed a Kubernetes
// version override because the render-mode provider's default fake
// capabilities report v1.20.0, which the chart's own `kubeVersion` gate
// rejects outright, confirming the gate itself works even with no live
// cluster reachable.
const longhornChart = new k8s.helm.v4.Chart("longhorn", {
    chart: "longhorn",
    version: "1.12.1",
    namespace: longhornNamespaceName,
    repositoryOpts: {
        repo: "https://charts.longhorn.io",
    },
    values: {
        // This chart's own StorageClass is not the one this workshop
        // teaches with -- 03-storage-class defines an explicit one -- so
        // it must not claim to be the cluster default (the default
        // upstream chart value is `true`).
        // https://longhorn.io/docs/1.12.1/references/helm-values/ (read 2026-09-28)
        persistence: {
            defaultClass: false,
        },
        defaultSettings: {
            // Required before `helm uninstall` will succeed cleanly; without
            // it the chart's pre-delete uninstall job refuses to run.
            // https://longhorn.io/docs/1.12.1/deploy/uninstall/ (read 2026-09-28)
            deletingConfirmationFlag: true,
        },
    },
}, { provider });

// `helm.v4.Chart` does not expose the namespace it was installed into as a
// resource property, so this re-exports the namespace name that was passed
// in, letting downstream stacks (03-storage-class) confirm the chart's own
// stack ran without needing a chart-specific output.
export const chartNamespace = longhornNamespaceName;
export const chartUrn = longhornChart.urn;
