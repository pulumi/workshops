import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

// This project is presenter-only: it recovers a brand-new Cluster from a backup that
// `02-cluster` (cnpg-workshop-cluster) already took with `backupsEnabled=true`. See
// AGENTS.md for the full prerequisite. Participants watch; nobody but the presenter runs
// this stack.

const config = new pulumi.Config();
const renderToDirectory = config.get("renderToDirectory");

// Cross-stack references into the sibling workshop projects. Both must exist in the same
// backend, under the same stack name as this project, for `pulumi preview` to resolve
// their outputs.
const platformStack = new pulumi.StackReference(`${pulumi.getOrganization()}/cnpg-workshop-platform/${pulumi.getStack()}`);
const clusterStack = new pulumi.StackReference(`${pulumi.getOrganization()}/cnpg-workshop-cluster/${pulumi.getStack()}`);

const kubeconfigContext = platformStack.getOutput("kubeconfigContext");
const appNamespace = platformStack.getOutput("appNamespace");
const clusterName = clusterStack.getOutput("clusterName");
const objectStoreName = clusterStack.getOutput("objectStoreName");
const backupsEnabled = clusterStack.getOutput("backupsEnabled");

// Warn, never throw. `getOutput` on a key the target stack has not (yet) exported
// resolves to `undefined` rather than rejecting, and during preview a StackReference's
// value can also still be unknown -- either way this must not stop `pulumi preview` from
// completing.
backupsEnabled.apply((enabled) => {
    if (!enabled) {
        pulumi.log.warn(
            "cnpg-workshop-cluster's 'backupsEnabled' output is not true. This 06-restore " +
            "project only recovers real data when 02-cluster was deployed with " +
            "backupsEnabled=true and at least one backup already exists in the object " +
            "store. Preview/apply will still proceed, but the restored cluster will have " +
            "nothing to recover from until that prerequisite is met.",
        );
    }
    return enabled;
});

// Pin exactly -- never `latest`.
const POSTGRES_IMAGE = "ghcr.io/cloudnative-pg/postgresql:17.6-standard-trixie";

const RESTORED_CLUSTER_NAME = "pg-demo-restored";

// Conditional provider: render-to-directory for offline verification, or a live context.
// Never both at once.
const k8sProvider = renderToDirectory
    ? new k8s.Provider("k8s", { renderYamlToDirectory: renderToDirectory })
    : new k8s.Provider("k8s", { context: kubeconfigContext });

// Recover into a brand-new Cluster from the plugin-based (Barman Cloud) backup of the
// `02-cluster` cluster. Schema verified live against:
//   - https://cloudnative-pg.io/docs/1.30/recovery
//     ("Recovery from an Object Store with the Barman Cloud Plugin", read 2026-09-29)
//   - https://cloudnative-pg.github.io/plugin-barman-cloud/docs/usage/
//     ("Restoring a Cluster", plugin version 0.15.0, read 2026-09-29)
// Both sources agree on this exact shape. The one correction versus a naive first guess:
// `externalClusters[].plugin.parameters` needs BOTH `barmanObjectName` (the ObjectStore
// resource name) AND `serverName` (the name of the *original* cluster whose backups these
// are -- the prefix the plugin looks under in the bucket). Omitting `serverName` means the
// plugin cannot find the source cluster's backups at all.
//
// CRITICAL: `spec` must be a TOP-LEVEL sibling of `apiVersion`/`kind`/`metadata`. Wrapping
// it inside another object silently produces a manifest with no top-level `spec`, because
// `CustomResourceArgs` has a permissive index signature that accepts (and swallows) any
// other key. See the earlier discarded draft of this workshop for the exact bug this
// avoids.
const restoredCluster = new k8s.apiextensions.CustomResource(
    RESTORED_CLUSTER_NAME,
    {
        apiVersion: "postgresql.cnpg.io/v1",
        kind: "Cluster",
        metadata: {
            name: RESTORED_CLUSTER_NAME,
            namespace: appNamespace,
        },
        spec: {
            // A single instance is enough to prove recovery worked, and cheaper than a
            // 3-node cluster for a demo step.
            instances: 1,
            imageName: POSTGRES_IMAGE,
            storage: {
                size: "1Gi",
                storageClass: "standard",
            },
            bootstrap: {
                recovery: {
                    // Must match an externalClusters[].name below.
                    source: clusterName,
                    // Uncomment for true point-in-time recovery to a specific timestamp
                    // instead of the latest available WAL record. A presenter can flip
                    // this live on stage and re-run `pulumi up` to show PITR:
                    // recoveryTarget: {
                    //     targetTime: "2026-09-29T12:00:00Z",
                    // },
                },
            },
            externalClusters: [
                {
                    name: clusterName,
                    plugin: {
                        name: "barman-cloud.cloudnative-pg.io",
                        parameters: {
                            barmanObjectName: objectStoreName,
                            serverName: clusterName,
                        },
                    },
                },
            ],
        },
    },
    { provider: k8sProvider },
);

export const restoredClusterName = RESTORED_CLUSTER_NAME;
