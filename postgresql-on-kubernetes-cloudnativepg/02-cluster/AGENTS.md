# 02-cluster

Pulumi TypeScript stack that creates the workshop's Postgres `Cluster` (CloudNativePG)
in the platform's `cnpg-demo` namespace, with optional S3-backed WAL archiving and
backups via the Barman Cloud plugin.

## Configuration

Set via `pulumi config set <key> <value>`:

- `backupsEnabled` (bool, default `false`) -- see "What `backupsEnabled` does" below.
- `awsRegion` (string, default `us-east-1`) -- region for the backup bucket and IAM
  resources. Only read when `backupsEnabled` is true.
- `storageClass` (string, default `standard`) -- kind's bundled local-path-provisioner
  default StorageClass name.
- `renderToDirectory` (optional string) -- presenter dry-run / offline-verification aid.
  When set, Kubernetes manifests render to this local directory instead of touching a
  live cluster, and the AWS provider is built with `skipCredentialsValidation` /
  `skipMetadataApiCheck` / `skipRegionValidation` / `s3UsePathStyle` all `true`, so the
  S3/IAM resources preview with no real credentials or network access. Leave unset for
  a real workshop run.

## Credentials: what Pulumi needs, and what it does with them

This project needs **ambient AWS credentials** (environment variables, a profile, or
SSO) for exactly one reason: so that `pulumi up` can create the S3 bucket and a
freshly-scoped IAM user on your behalf. That is the only role these credentials play.

The presenter never manually copies a bucket's access key anywhere. In the same `pulumi
up` that creates the bucket, Pulumi also mints a tightly-scoped IAM access key for a new
IAM user and writes it straight into a Kubernetes `Secret` (`aws-creds`, in `cnpg-demo`)
that the Barman Cloud plugin reads. There is no manual credential-handling step at any
point in this workflow.

**Never commit AWS credentials, and never put them in Pulumi config directly** (`pulumi
config set awsAccessKey ...` and similar). This project has no config key for a static
access key or secret for a reason: it relies entirely on the ambient environment (the
same mechanism the AWS CLI and every other AWS SDK use) to authenticate the `pulumi up`
that provisions the bucket and IAM user. Rotate or revoke that ambient credential the
normal way you already do for any other AWS access; nothing here changes that.

### Exactly what the minted IAM user can do

The IAM policy attached to the backup user grants only these S3 actions, scoped to the
one bucket this stack creates (never `*`):

- `s3:ListBucket`, `s3:GetBucketLocation` -- scoped to the bucket ARN itself.
- `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject`, `s3:AbortMultipartUpload` -- scoped
  to `<bucket ARN>/*`.

This list matches the Barman project's own documented minimum IAM permissions for the
`barman-cloud-backup` / `barman-cloud-restore` / `barman-cloud-wal-archive` scripts
(https://docs.pgbarman.org/release/3.20.0/user_guide/barman_cloud.html#aws-s3-permissions,
read 2026-09-29), with one deliberate omission and one deliberate addition:

- `s3:CreateBucket` is **not** granted. Pulumi creates the bucket ahead of time as part
  of this same stack; the runtime credentials the Barman Cloud plugin actually uses
  never need to create a bucket, so that permission would be unused privilege.
- `s3:GetBucketLocation` **is** granted, beyond Barman's bare minimum, for S3 SDK
  region-discovery compatibility. It is read-only bucket metadata.

## What `backupsEnabled` does

`backupsEnabled=false` (the default) is what every participant runs. CNPG deploys and
runs an identical three-instance `Cluster` either way -- `backupsEnabled` only changes
whether WAL archiving and backup capability exist. With it `false`, no AWS resources of
any kind are created (no bucket, no IAM user, no access key, no `ObjectStore`), and
`pulumi up` needs zero cloud credentials. This is deliberate: participants should be
able to run steps 1-4 of the workshop on a bare kind cluster with nothing but Docker and
the Pulumi CLI.

`backupsEnabled=true` is a **presenter-only** step. It provisions the S3 bucket, the
least-privilege IAM user and access key described above, the `aws-creds` Secret, and a
Barman Cloud `ObjectStore` custom resource, then adds a `spec.plugins` entry to the
`Cluster` pointing at that `ObjectStore`. This needs real AWS credentials in the
ambient environment, as described above.

## The demo narrative: evolving infrastructure in place

The intended run of show is not "tear down and rebuild with backups on." It is:

1. The presenter runs this project the first time with `backupsEnabled=false`,
   alongside every participant, on the shared kind cluster from `01-platform`. The
   `Cluster` comes up with three instances and no backup capability, same as everyone
   else's.
2. Later in the workshop, the presenter returns to this **same** project directory and
   runs:
   ```
   pulumi config set backupsEnabled true
   pulumi config set awsRegion <region>
   pulumi up
   ```
3. Pulumi provisions the new AWS resources, then updates the **already-running**
   `Cluster` resource in place by adding the `spec.plugins` entry. CNPG's operator
   reconciles that change onto the live cluster -- it does not recreate the `Cluster`,
   restart the primary in a destructive way, or cause data loss. The three instances
   that were already serving traffic keep serving traffic; they simply gain WAL
   archiving.

Call this out on stage as **"evolving infrastructure with Pulumi"**: the same
declarative program, re-applied after a config change, adds a capability to a live
system without tearing anything down first. That contrast -- one `pulumi up`, an
in-place reconcile, versus a destroy/recreate cycle -- is the point of structuring the
demo this way rather than deploying with backups on from the start.

## Cross-stack contract

- **Reads** from `cnpg-workshop-platform` (sibling `01-platform`): `kubeconfigContext`,
  `appNamespace`.
- **Exports**, consumed by sibling `06-restore`: `clusterName` (`"pg-demo"`),
  `objectStoreName` (`"cnpg-demo-store"`, only meaningfully set when `backupsEnabled` is
  true), `backupsEnabled`. Also exports `namespace`, `bucketName`, and `awsRegion` for
  completeness. Do not rename any of these outputs without updating `06-restore`.

## What was not verified in this environment

This project's TypeScript compiles and previews cleanly (see the PR description for the
exact commands and resource counts), including the full S3/IAM/ObjectStore code path
under `renderToDirectory` with the AWS provider's skip-validation flags. What was
**not**, and could not be, verified in the environment this project was built in: a live
kind cluster, a live CNPG operator and Barman Cloud plugin installation, a live AWS
account actually creating the bucket/IAM user, and an actual WAL-archiving or
backup/restore cycle. Run the full quickstart against a real kind cluster with real AWS
credentials before presenting.
