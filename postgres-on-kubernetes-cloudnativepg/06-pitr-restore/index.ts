import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

const config = new pulumi.Config();

// Source cluster's stack: read the kind context, namespace, and the names
// the source cluster and its Barman Cloud object store were created under in
// 02-postgres-cluster. This project never re-creates that state, only reads
// it, matching the StackReference pattern used across this workshop.
const clusterStackRefName = config.get("clusterStackRef") ?? "<org>/pg-postgres-cluster/dev";
const clusterStackRef = new pulumi.StackReference(clusterStackRefName);
const sourceKubeconfigContext = clusterStackRef.getOutput("kubeconfigContext");
const sourceNamespace = clusterStackRef.getOutput("namespace");
const sourceClusterName = clusterStackRef.getOutput("clusterName");
const bucketName = clusterStackRef.getOutput("bucketName");
const sourceObjectStoreName = clusterStackRef.getOutput("objectStoreName");

// Same provider-construction pattern as every other project in this
// workshop: renderYamlToDirectory lets tsc/preview run offline in a sandbox
// with no live cluster, context drives the real kind demo.
const renderYamlToDirectory = config.get("renderYamlToDirectory");
const provider = renderYamlToDirectory
    ? new k8s.Provider("k8s", { renderYamlToDirectory })
    : new k8s.Provider("k8s", { context: sourceKubeconfigContext });

// The presenter must capture a real timestamp after the demo's on-demand
// backup (05-backup/backup.sh) and set it here right before running this
// stack: `pulumi config set recoveryTargetTime "<RFC3339 timestamp>"`.
// There is no sane default -- a stale or made-up target time would restore
// to the wrong point (or fail bootstrap entirely), so this value is
// required rather than defaulted.
const recoveryTargetTime = config.require("recoveryTargetTime");

// A restored cluster gets its OWN ObjectStore rather than reusing the
// source's s3-store: the restored cluster re-enables WAL archiving
// (plugins[].isWALArchiver: true) once it comes up, and writing new WAL
// into the source's archive path would corrupt the source's own backup
// timeline. Same bucket, different prefix, same credentials Secret.
// https://cloudnative-pg.io/docs/1.30/recovery (read 2026-09-27)
// https://cloudnative-pg.io/plugin-barman-cloud/docs/usage/ (read 2026-09-27)
const restoreObjectStoreName = "s3-store-restore";
const restoreObjectStore = new k8s.apiextensions.CustomResource(restoreObjectStoreName, {
    apiVersion: "barmancloud.cnpg.io/v1",
    kind: "ObjectStore",
    metadata: {
        name: restoreObjectStoreName,
        namespace: sourceNamespace,
    },
    others: {
        spec: {
            configuration: {
                destinationPath: pulumi.interpolate`s3://${bucketName}/restored-backups`,
                s3Credentials: {
                    accessKeyId: {
                        name: "s3-creds",
                        key: "ACCESS_KEY_ID",
                    },
                    secretAccessKey: {
                        name: "s3-creds",
                        key: "ACCESS_SECRET_KEY",
                    },
                },
            },
        },
    },
}, { provider });

// The restored Cluster: bootstraps via recovery from the source's archive
// (externalClusters.source, pointed at the ORIGINAL object store and
// server name from the StackReference) and re-enables WAL archiving into
// its own new object store (plugins[].barmanObjectName) so it can itself
// serve as a PITR source later.
// https://cloudnative-pg.io/docs/1.30/recovery (read 2026-09-27)
// https://cloudnative-pg.io/plugin-barman-cloud/docs/usage/ (read 2026-09-27)
export const restoredClusterName = "pg-cluster-restore";
const restoredCluster = new k8s.apiextensions.CustomResource(restoredClusterName, {
    apiVersion: "postgresql.cnpg.io/v1",
    kind: "Cluster",
    metadata: {
        name: restoredClusterName,
        namespace: sourceNamespace,
    },
    others: {
        spec: {
            instances: 3,
            imageName: "ghcr.io/cloudnative-pg/postgresql:17.6-system-trixie",
            imagePullPolicy: "IfNotPresent",
            storage: {
                size: "1Gi",
            },
            bootstrap: {
                recovery: {
                    source: "source",
                    recoveryTarget: {
                        targetTime: recoveryTargetTime,
                    },
                },
            },
            plugins: [
                {
                    name: "barman-cloud.cloudnative-pg.io",
                    isWALArchiver: true,
                    parameters: {
                        barmanObjectName: restoreObjectStoreName,
                    },
                },
            ],
            externalClusters: [
                {
                    name: "source",
                    plugin: {
                        name: "barman-cloud.cloudnative-pg.io",
                        parameters: {
                            barmanObjectName: sourceObjectStoreName,
                            serverName: sourceClusterName,
                        },
                    },
                },
            ],
        },
    },
}, { provider, dependsOn: [restoreObjectStore] });

export const kubeconfigContext = sourceKubeconfigContext;
export const namespace = sourceNamespace;
