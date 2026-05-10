// GKE workshop infrastructure — consumer of the gke-workshop component.
//
// The bulk of the cluster (network, GKE module, node pools, observability,
// Backup-for-GKE, kubeconfig generation) lives in `../02-component/` as a
// reusable Pulumi ComponentResource. This file is what's left:
//   1. The component instance
//   2. A kubernetes Provider built from the component's kubeconfig output
//   3. Workshop-specific Vertex IAM (ADK agent's GSA + WI binding)
//   4. Flux GitOps bootstrap (namespace + 2 helm releases + cluster-vars)
//   5. The custom Cloud Monitoring dashboard
//   6. Stack outputs
//
// Auth: this stack expects the Pulumi ESC env `cloud-creds/gcp-dev-sandbox`
// referenced in Pulumi.dev.yaml, which exports GOOGLE_OAUTH_ACCESS_TOKEN +
// GOOGLE_PROJECT. The gcp provider picks both up automatically.

import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as k8s from "@pulumi/kubernetes";
import * as gkeWorkshop from "@pulumi/gke-workshop";
import * as fs from "fs";
import * as path from "path";

const cfg = new pulumi.Config();
const clusterName = cfg.get("cluster_name") ?? "gke-workshop";
const gitRepoUrl =
    cfg.get("git_repo_url") ?? "https://github.com/pulumi/workshops";
const gitRepoBranch = cfg.get("git_repo_branch") ?? "main";
const gitClusterPath =
    cfg.get("git_cluster_path") ??
    "getting-started-with-kubernetes-google-cloud/01-gitops/clusters/gke-workshop";

const gcpCfg = new pulumi.Config("gcp");
const region = gcpCfg.require("region");
const projectId = gcp.config.project!;

// --------------------------------------------------------------------------
// 1. Cluster — one component call replaces ~250 lines of network + GKE
//    module + node pools + observability + backup + kubeconfig logic.
// --------------------------------------------------------------------------

const cluster = new gkeWorkshop.GkeWorkshopCluster("workshop", {
    projectId,
    region,
    clusterName,
});

// --------------------------------------------------------------------------
// 2. Kubernetes Provider — built from the component's kubeconfig output.
//    The component intentionally exposes kubeconfig (Output<string>)
//    rather than a k8s.Provider directly: cross-package resource
//    references aren't representable in Pulumi's multi-language schema,
//    and exposing as a string keeps the component pure.
// --------------------------------------------------------------------------

const k8sProvider = new k8s.Provider("gke", {
    kubeconfig: cluster.kubeconfig,
    // Pin the provider's identity to the cluster, not to the kubeconfig
    // string. The kubeconfig contains a 1h-TTL OAuth token that
    // re-evaluates every `pulumi up` — without clusterIdentifier, that
    // token rotation hashes as a Provider replacement, which cascades
    // into "+ create" diffs for every dependent k8s resource. With the
    // cluster ID pinned, kubeconfig changes become in-place updates.
    clusterIdentifier: cluster.clusterId,
    // Safety net during teardown: drop kubernetes resources from state
    // instead of erroring if the GKE API is unreachable.
    deleteUnreachable: true,
});

// --------------------------------------------------------------------------
// 3. Vertex IAM — GSA backing the ADK agent KSA via Workload Identity.
//    Workshop-specific; stays in the consumer.
// --------------------------------------------------------------------------

const adkVertexGsa = new gcp.serviceaccount.Account("adk-vertex", {
    project: projectId,
    accountId: "adk-vertex",
    displayName: "ADK agent — Vertex AI (workshop)",
    description:
        "Used by the ADK agent KSA via Workload Identity to call Vertex AI",
});

const adkRoles = {
    user: "roles/aiplatform.user",
    trace: "roles/cloudtrace.agent",
    metrics: "roles/monitoring.metricWriter",
    logs: "roles/logging.logWriter",
};

for (const [key, role] of Object.entries(adkRoles)) {
    new gcp.projects.IAMMember(`adk-vertex-${key}`, {
        project: projectId,
        role: role,
        member: pulumi.interpolate`serviceAccount:${adkVertexGsa.email}`,
    });
}

new gcp.serviceaccount.IAMMember("adk-workload-identity", {
    serviceAccountId: adkVertexGsa.name,
    role: "roles/iam.workloadIdentityUser",
    member: pulumi.interpolate`serviceAccount:${projectId}.svc.id.goog[adk/adk-agent]`,
});

// --------------------------------------------------------------------------
// 4. Flux GitOps — operational choice; stays in the consumer.
// --------------------------------------------------------------------------

const fluxNs = new k8s.core.v1.Namespace(
    "flux-system",
    { metadata: { name: "flux-system" } },
    { provider: k8sProvider, dependsOn: [cluster] },
);

const fluxOperator = new k8s.helm.v3.Release(
    "flux-operator",
    {
        name: "flux-operator",
        namespace: fluxNs.metadata.name,
        chart: "oci://ghcr.io/controlplaneio-fluxcd/charts/flux-operator",
        version: "0.48.0",
        waitForJobs: true,
        timeout: 300,
        createNamespace: false,
        values: {
            web: { enabled: true },
        },
    },
    {
        provider: k8sProvider,
        retainOnDelete: true,
    },
);

const clusterVars = new k8s.core.v1.ConfigMap(
    "cluster-vars",
    {
        metadata: {
            name: "cluster-vars",
            namespace: fluxNs.metadata.name,
        },
        data: {
            gcp_project_id: projectId,
            cluster_name: clusterName,
        },
    },
    { provider: k8sProvider },
);

new k8s.helm.v3.Release(
    "flux-instance",
    {
        name: "flux",
        namespace: fluxNs.metadata.name,
        chart: "oci://ghcr.io/controlplaneio-fluxcd/charts/flux-instance",
        version: "0.48.0",
        timeout: 300,
        createNamespace: false,
        values: {
            instance: {
                distribution: {
                    version: "2.x",
                    registry: "ghcr.io/fluxcd",
                },
                components: [
                    "source-controller",
                    "kustomize-controller",
                    "helm-controller",
                    "notification-controller",
                ],
                cluster: {
                    type: "kubernetes",
                    multitenant: false,
                    domain: "cluster.local",
                },
                sync: {
                    kind: "GitRepository",
                    url: gitRepoUrl,
                    ref: `refs/heads/${gitRepoBranch}`,
                    path: `./${gitClusterPath}`,
                    interval: "1m",
                },
            },
        },
    },
    {
        provider: k8sProvider,
        dependsOn: [fluxOperator, clusterVars],
        retainOnDelete: true,
    },
);

// --------------------------------------------------------------------------
// 5. Custom Cloud Monitoring dashboard — consumer policy.
// --------------------------------------------------------------------------

const dashboardTemplate = fs.readFileSync(
    path.join(__dirname, "dashboards", "gke_overview.json"),
    "utf-8",
);
const dashboardJson = dashboardTemplate.replace(/\$\{cluster_name\}/g, clusterName);

const dashboard = new gcp.monitoring.Dashboard("gke-workshop", {
    project: projectId,
    dashboardJson: dashboardJson,
});

// --------------------------------------------------------------------------
// 6. Stack outputs.
// --------------------------------------------------------------------------

export const cluster_name = cluster.clusterName;
export const region_out = region;
export const git_cluster_path_out = gitClusterPath;
export const dashboard_url = pulumi.interpolate`https://console.cloud.google.com/monitoring/dashboards/builder/${dashboard.id.apply((id) => id.split("/").pop())}?project=${projectId}`;
export const kubeconfig_out = cluster.kubeconfig;
export const kubeconfig_path = cluster.kubeconfigPath;
export const backup_plan_id = cluster.backupPlanId;
