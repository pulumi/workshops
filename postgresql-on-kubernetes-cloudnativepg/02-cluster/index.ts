import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();

const backupsEnabled = config.getBoolean("backupsEnabled") ?? false;
const awsRegion = config.get("awsRegion") ?? "us-east-1";
const storageClass = config.get("storageClass") ?? "standard";
const renderToDirectory = config.get("renderToDirectory");

// Cross-stack reference into the shared platform project. Both stacks must exist in the
// same backend, under the same stack name, for `pulumi preview` to resolve these outputs.
// `pulumi.getOrganization()`/`pulumi.getStack()` (rather than a hardcoded org) keeps this
// portable between Pulumi Cloud and a local file backend.
const platformStack = new pulumi.StackReference(`${pulumi.getOrganization()}/cnpg-workshop-platform/${pulumi.getStack()}`);
const kubeconfigContext = platformStack.getOutput("kubeconfigContext");
const appNamespace = platformStack.getOutput("appNamespace");

// Pin exactly -- never `latest`.
const POSTGRES_IMAGE = "ghcr.io/cloudnative-pg/postgresql:17.6-standard-trixie";

const CLUSTER_NAME = "pg-demo";
const OBJECT_STORE_NAME = "cnpg-demo-store";
const AWS_CREDS_SECRET_NAME = "aws-creds";

// Conditional provider: render-to-directory for offline verification, or a live context.
// Never both at once. Same pattern as sibling 01-platform/06-restore.
const k8sProvider = renderToDirectory
    ? new k8s.Provider("k8s", { renderYamlToDirectory: renderToDirectory })
    : new k8s.Provider("k8s", { context: kubeconfigContext });

// The AWS provider is constructed lazily, only inside the `backupsEnabled` branch below --
// deliberately NOT at top level. Constructing an explicit `aws.Provider` registers a
// provider resource whose config is checked immediately, which (without the skip* flags)
// means a real STS credentials check even if no other resource ends up using it. Building
// it unconditionally would break the point of `backupsEnabled=false`: participants running
// steps 1-4 must need zero cloud credentials at all. See AGENTS.md.
//
// In render mode the skip* flags make this safe to construct even for the offline
// verification path, so the helper below is reused for both the live and rendered case;
// it is simply never *called* unless backupsEnabled is true.
function buildAwsProvider(): aws.Provider {
    return renderToDirectory
        ? new aws.Provider("aws", {
              region: awsRegion as aws.Region,
              // Confirmed current on the live registry docs
              // (https://www.pulumi.com/registry/packages/aws/api-docs/provider/, read
              // 2026-09-29): skipCredentialsValidation, skipMetadataApiCheck,
              // skipRegionValidation, s3UsePathStyle. These alone are not sufficient in an
              // environment with literally no ambient AWS credentials and no IMDS
              // endpoint (verified empirically in this sandbox): the provider's SDK still
              // walks the default credential chain while *configuring* itself, and with
              // skipCredentialsValidation only skipping the STS validation call -- not the
              // chain walk itself -- it falls through to IMDS and fails there. Two more
              // fields fix this, both present in the same provider schema:
              // `skipRequestingAccountId` (skips the fallback STS/IMDS account-id lookup)
              // and static `accessKey`/`secretKey` placeholders, which give the SDK
              // something to resolve to so it never reaches IMDS at all. These are
              // deliberately obvious placeholders, not real credentials, and only ever
              // constructed in the renderToDirectory (offline) branch -- never in the live
              // branch below, which relies solely on the ambient environment per
              // AGENTS.md.
              skipCredentialsValidation: true,
              skipMetadataApiCheck: true,
              skipRegionValidation: true,
              skipRequestingAccountId: true,
              s3UsePathStyle: true,
              accessKey: "offline-preview-access-key",
              secretKey: "offline-preview-secret-key",
          })
        : new aws.Provider("aws", { region: awsRegion as aws.Region });
}

let bucketNameOutput: pulumi.Output<string> | undefined;
let objectStoreNameOutput: string | undefined;
let objectStoreCR: k8s.apiextensions.CustomResource | undefined;

if (backupsEnabled) {
    const awsProvider = buildAwsProvider();

    // Bucket name is left to Pulumi's auto-naming (no explicit `bucket` argument), which
    // appends a random suffix to the logical name. This is the simplest way to avoid S3's
    // global-bucket-namespace collisions across concurrent workshop runs/accounts. The
    // exported `bucketName` output is how the ObjectStore's `destinationPath` -- and any
    // downstream tooling -- discovers the real name.
    const bucket = new aws.s3.Bucket(
        "cnpg-demo-backups",
        {
            tags: {
                workshop: "postgresql-on-kubernetes-cloudnativepg",
            },
        },
        { provider: awsProvider },
    );

    new aws.s3.BucketVersioning(
        "cnpg-demo-backups-versioning",
        {
            bucket: bucket.id,
            versioningConfiguration: { status: "Enabled" },
        },
        { provider: awsProvider },
    );

    new aws.s3.BucketServerSideEncryptionConfiguration(
        "cnpg-demo-backups-encryption",
        {
            bucket: bucket.id,
            rules: [
                {
                    applyServerSideEncryptionByDefault: {
                        sseAlgorithm: "AES256",
                    },
                },
            ],
        },
        { provider: awsProvider },
    );

    new aws.s3.BucketPublicAccessBlock(
        "cnpg-demo-backups-public-access-block",
        {
            bucket: bucket.id,
            blockPublicAcls: true,
            blockPublicPolicy: true,
            ignorePublicAcls: true,
            restrictPublicBuckets: true,
        },
        { provider: awsProvider },
    );

    // Least-privilege IAM: a dedicated user scoped to exactly this bucket, with exactly the
    // S3 actions the barman-cloud-* scripts (backup, restore, WAL archiving) need. Actions
    // confirmed against the Barman project's own documented minimum IAM permissions
    // (https://docs.pgbarman.org/release/3.20.0/user_guide/barman_cloud.html#aws-s3-permissions,
    // read 2026-09-29):
    //   - bucket-level (Resource = bucket ARN): s3:ListBucket
    //   - object-level (Resource = bucket ARN + "/*"): s3:GetObject, s3:PutObject,
    //     s3:DeleteObject, s3:AbortMultipartUpload
    // `s3:CreateBucket` is deliberately omitted: Pulumi creates the bucket ahead of time,
    // not barman, so the runtime credentials never need that permission. `s3:GetBucketLocation`
    // (bucket-level) is added beyond Barman's bare minimum for S3 SDK region-discovery
    // compatibility -- it is read-only bucket metadata.
    const backupUser = new aws.iam.User(
        "cnpg-demo-backup-user",
        {
            tags: {
                workshop: "postgresql-on-kubernetes-cloudnativepg",
            },
        },
        { provider: awsProvider },
    );

    const backupPolicy = new aws.iam.Policy(
        "cnpg-demo-backup-policy",
        {
            description: "Least-privilege access for CNPG's Barman Cloud plugin to back up, WAL-archive, and restore against exactly one S3 bucket.",
            policy: pulumi.jsonStringify({
                Version: "2012-10-17",
                Statement: [
                    {
                        Sid: "BucketLevelPermissions",
                        Effect: "Allow",
                        Action: ["s3:ListBucket", "s3:GetBucketLocation"],
                        Resource: bucket.arn,
                    },
                    {
                        Sid: "ObjectLevelPermissions",
                        Effect: "Allow",
                        Action: [
                            "s3:GetObject",
                            "s3:PutObject",
                            "s3:DeleteObject",
                            "s3:AbortMultipartUpload",
                        ],
                        Resource: pulumi.interpolate`${bucket.arn}/*`,
                    },
                ],
            }),
        },
        { provider: awsProvider },
    );

    const backupPolicyAttachment = new aws.iam.UserPolicyAttachment(
        "cnpg-demo-backup-policy-attachment",
        {
            user: backupUser.name,
            policyArn: backupPolicy.arn,
        },
        { provider: awsProvider },
    );

    const backupAccessKey = new aws.iam.AccessKey(
        "cnpg-demo-backup-access-key",
        {
            user: backupUser.name,
        },
        { provider: awsProvider, dependsOn: [backupPolicyAttachment] },
    );

    // `backupAccessKey.secret` is already a secret Output (the AWS provider marks it as
    // such) -- pass it straight into `stringData` without unwrapping, logging, or otherwise
    // touching the plaintext value. This is the mint-and-wire step: the presenter never
    // manually copies bucket credentials anywhere, Pulumi does it in this same `pulumi up`.
    const awsCredsSecret = new k8s.core.v1.Secret(
        "aws-creds",
        {
            metadata: {
                name: AWS_CREDS_SECRET_NAME,
                namespace: appNamespace,
            },
            stringData: {
                ACCESS_KEY_ID: backupAccessKey.id,
                ACCESS_SECRET_KEY: backupAccessKey.secret,
                REGION: awsRegion,
            },
        },
        { provider: k8sProvider },
    );

    // ObjectStore: the Barman Cloud Plugin's own CRD (barmancloud.cnpg.io/v1), separate from
    // the Cluster -- the current, non-deprecated replacement for the old inline
    // `spec.backup.barmanObjectStore` field. Schema confirmed live against
    // https://cloudnative-pg.github.io/plugin-barman-cloud/docs/usage/ (v0.15.0) and the Go
    // source of truth for S3Credentials,
    // https://pkg.go.dev/github.com/cloudnative-pg/barman-cloud/pkg/api#S3Credentials (both
    // read 2026-09-29): accessKeyId/secretAccessKey/region are each a SecretKeySelector
    // ({name, key}) -- region is NOT a plain string, which is easy to get wrong.
    //
    // CRITICAL: `spec` must be a TOP-LEVEL sibling of `apiVersion`/`kind`/`metadata`.
    // Wrapping it inside another object silently produces a manifest with no top-level
    // `spec`, because `CustomResourceArgs` has a permissive index signature that accepts
    // (and swallows) any other key. This exact bug was found 4 times in an earlier,
    // discarded draft of this workshop, in these same two kinds (ObjectStore and Cluster).
    objectStoreCR = new k8s.apiextensions.CustomResource(
        OBJECT_STORE_NAME,
        {
            apiVersion: "barmancloud.cnpg.io/v1",
            kind: "ObjectStore",
            metadata: {
                name: OBJECT_STORE_NAME,
                namespace: appNamespace,
            },
            spec: {
                configuration: {
                    destinationPath: pulumi.interpolate`s3://${bucket.bucket}/pg-demo`,
                    s3Credentials: {
                        accessKeyId: {
                            name: AWS_CREDS_SECRET_NAME,
                            key: "ACCESS_KEY_ID",
                        },
                        secretAccessKey: {
                            name: AWS_CREDS_SECRET_NAME,
                            key: "ACCESS_SECRET_KEY",
                        },
                        region: {
                            name: AWS_CREDS_SECRET_NAME,
                            key: "REGION",
                        },
                    },
                },
                retentionPolicy: "30d",
            },
        },
        { provider: k8sProvider, dependsOn: [awsCredsSecret] },
    );

    bucketNameOutput = bucket.bucket;
    objectStoreNameOutput = OBJECT_STORE_NAME;
}

// Minimal quickstart-style Cluster. Shape confirmed live against
// https://cloudnative-pg.io/docs/devel/quickstart, .../bootstrap, .../storage, and
// .../resource_management (all read 2026-09-29): `imageName` (not `image`) is the pinned
// image field; `bootstrap.initdb.{database,owner}` and `storage.{storageClass,size}` are
// both top-level-sibling shapes exactly as used here. `resources` requests/limits are not
// part of the bare quickstart example, but they are the documented shape from the resource
// management guide and a reasonable addition to avoid an unbounded/best-effort QoS class on
// a workshop node.
const clusterSpec: { [key: string]: any } = {
    instances: 3,
    imageName: POSTGRES_IMAGE,
    storage: {
        size: "1Gi",
        storageClass,
    },
    bootstrap: {
        initdb: {
            database: "app",
            owner: "app",
        },
    },
    resources: {
        requests: {
            memory: "256Mi",
            cpu: "100m",
        },
        limits: {
            memory: "512Mi",
            cpu: "500m",
        },
    },
};

if (backupsEnabled) {
    // Confirmed live against https://cloudnative-pg.github.io/plugin-barman-cloud/docs/usage/
    // (v0.15.0, read 2026-09-29): the writer side only needs `barmanObjectName`; `serverName`
    // defaults to the Cluster's own metadata.name and is only needed explicitly on the
    // *reader* side (see sibling `06-restore`, which restores from this same Cluster's name).
    clusterSpec.plugins = [
        {
            name: "barman-cloud.cloudnative-pg.io",
            isWALArchiver: true,
            parameters: {
                barmanObjectName: OBJECT_STORE_NAME,
            },
        },
    ];
}

// CRITICAL: `spec` must be a TOP-LEVEL sibling of `apiVersion`/`kind`/`metadata` -- see the
// long comment on the ObjectStore CustomResource above for why this matters.
//
// This same resource, re-applied by a later `pulumi up` after flipping `backupsEnabled` from
// false to true, is the "evolving infrastructure" demo beat: CNPG reconciles the new
// `spec.plugins` entry onto the already-running Cluster in place. Nothing here is destroyed
// and recreated for that transition -- see AGENTS.md.
const cluster = new k8s.apiextensions.CustomResource(
    CLUSTER_NAME,
    {
        apiVersion: "postgresql.cnpg.io/v1",
        kind: "Cluster",
        metadata: {
            name: CLUSTER_NAME,
            namespace: appNamespace,
        },
        spec: clusterSpec,
    },
    {
        provider: k8sProvider,
        dependsOn: objectStoreCR ? [objectStoreCR] : [],
    },
);

export const clusterName = CLUSTER_NAME;
export const namespace = appNamespace;
export { backupsEnabled };
export const bucketName = bucketNameOutput;
export const objectStoreName = objectStoreNameOutput;
export { awsRegion };
