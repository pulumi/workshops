import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as aws from "@pulumi/aws";

// Read the kubeconfig context from the cluster-and-operator stack rather than
// re-declaring it, so this project always targets whatever kind cluster 01
// actually created (kind's own `kind-<clusterName>` naming convention).
const config = new pulumi.Config();
const clusterStackRefName = config.get("clusterStackRef") || "<org>/pg-cluster/dev";
const clusterStackRef = new pulumi.StackReference(clusterStackRefName);
const kubeconfigContext = clusterStackRef.getOutput("kubeconfigContext");

// renderYamlToDirectory lets `pulumi preview`/`tsc` be verified offline
// (no live cluster in this sandbox); never combine it with `context`.
const renderYamlToDirectory = config.get("renderYamlToDirectory");
const provider = renderYamlToDirectory
    ? new k8s.Provider("k8s", { renderYamlToDirectory })
    : new k8s.Provider("k8s", { context: kubeconfigContext });

// 1. Namespace for every workshop-managed Postgres object, kept separate from
// cnpg-system (the operator's own namespace from 01) per CNPG convention.
const ns = new k8s.core.v1.Namespace("postgres-demo", {
    metadata: { name: "postgres-demo" },
}, { provider });

// 2. Backup bucket. aws.s3.BucketV2 is deprecated in favor of the plain
// aws.s3.Bucket resource (docs read 2026-09-27); no explicit `bucket` name so
// Pulumi auto-suffixes it and repeated workshop runs never collide.
const bucket = new aws.s3.Bucket("pg-backups", {
    // Deliberate for workshop teardown convenience: this bucket is
    // disposable and re-created every run. Would be reconsidered (removed)
    // for a real production backup bucket.
    forceDestroy: true,
});

// Versioning protects WAL/base-backup objects from accidental overwrite;
// barman-cloud writes immutable, uniquely-named objects but versioning is
// cheap insurance during a workshop where attendees may re-run backups.
const bucketVersioning = new aws.s3.BucketVersioning("pg-backups-versioning", {
    bucket: bucket.id,
    versioningConfiguration: { status: "Enabled" },
});

// Encrypt backup contents at rest; AES256 (SSE-S3) needs no extra KMS setup,
// which keeps the workshop's AWS footprint minimal.
const bucketEncryption = new aws.s3.BucketServerSideEncryptionConfiguration("pg-backups-encryption", {
    bucket: bucket.id,
    rules: [{
        applyServerSideEncryptionByDefault: { sseAlgorithm: "AES256" },
    }],
});

// Backups must never be reachable from the public internet; block every
// public-access vector even though the bucket has no public policy anyway.
const bucketPublicAccessBlock = new aws.s3.BucketPublicAccessBlock("pg-backups-public-access-block", {
    bucket: bucket.id,
    blockPublicAcls: true,
    blockPublicPolicy: true,
    ignorePublicAcls: true,
    restrictPublicBuckets: true,
});

// 3. Dedicated low-privilege identity for barman-cloud, per the brief's
// acceptance checklist: the plugin gets its own credentials, not a shared
// admin key, scoped to exactly the four S3 actions it needs on this bucket.
const backupUser = new aws.iam.User("pg-workshop-backup-user", {
    name: "pg-workshop-backup-user",
});

const backupAccessKey = new aws.iam.AccessKey("pg-workshop-backup-user-key", {
    user: backupUser.name,
});

const backupUserPolicy = new aws.iam.UserPolicy("pg-workshop-backup-user-policy", {
    user: backupUser.name,
    policy: pulumi.jsonStringify({
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Action: ["s3:PutObject", "s3:GetObject", "s3:ListBucket", "s3:DeleteObject"],
            Resource: [bucket.arn, pulumi.interpolate`${bucket.arn}/*`],
        }],
    }),
});

// 4. Credentials as a Pulumi secret: encrypted in stack state, never
// rendered in plaintext by `pulumi preview`/`pulumi up` output.
const s3Creds = new k8s.core.v1.Secret("s3-creds", {
    metadata: { name: "s3-creds", namespace: ns.metadata.name },
    stringData: {
        ACCESS_KEY_ID: pulumi.secret(backupAccessKey.id),
        ACCESS_SECRET_KEY: pulumi.secret(backupAccessKey.secret),
    },
}, { provider });

// 5. ObjectStore is its own CR (not part of Cluster.spec) because
// barman-cloud's CNPG-I plugin model lets several Clusters share one archive
// destination; 06-pitr-restore's externalCluster references this same name.
// https://cloudnative-pg.io/plugin-barman-cloud/docs/usage/ (read 2026-09-27)
const objectStore = new k8s.apiextensions.CustomResource("s3-store", {
    apiVersion: "barmancloud.cnpg.io/v1",
    kind: "ObjectStore",
    metadata: { name: "s3-store", namespace: ns.metadata.name },
    others: {
        spec: {
            configuration: {
                destinationPath: pulumi.interpolate`s3://${bucket.bucket}/backups`,
                s3Credentials: {
                    accessKeyId: { name: "s3-creds", key: "ACCESS_KEY_ID" },
                    secretAccessKey: { name: "s3-creds", key: "ACCESS_SECRET_KEY" },
                },
                wal: { compression: "gzip" },
            },
        },
    },
}, { provider, dependsOn: [s3Creds] });

// 6. The Postgres cluster itself: 3 instances for the 04-failover demo, a
// pinned image tag for reproducibility, and the barman-cloud plugin as its
// WAL archiver so continuous archiving starts from the first instance.
const cluster = new k8s.apiextensions.CustomResource("pg-cluster", {
    apiVersion: "postgresql.cnpg.io/v1",
    kind: "Cluster",
    metadata: { name: "pg-cluster", namespace: ns.metadata.name },
    others: {
        spec: {
            instances: 3,
            imageName: "ghcr.io/cloudnative-pg/postgresql:17.6-system-trixie",
            storage: { size: "1Gi" },
            plugins: [{
                name: "barman-cloud.cloudnative-pg.io",
                isWALArchiver: true,
                parameters: { barmanObjectName: "s3-store" },
            }],
        },
    },
}, { provider, dependsOn: [objectStore] });

export { kubeconfigContext };
export const namespace = "postgres-demo";
export const clusterName = "pg-cluster";
export const bucketName = bucket.bucket;
export const objectStoreName = "s3-store";
