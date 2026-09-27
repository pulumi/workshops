# AGENTS.md — 02-postgres-cluster

Pulumi TypeScript project: a namespace, an S3 backup bucket with a dedicated
low-privilege IAM user, an `ObjectStore` and a 3-instance CloudNativePG
`Cluster` wired to the barman-cloud plugin, in `index.ts`.

## What this provisions

- `postgres-demo` namespace.
- `aws.s3.Bucket` (auto-named, `forceDestroy: true`) plus versioning,
  SSE-S3 encryption and a public-access block.
- A dedicated `pg-workshop-backup-user` IAM user, access key and an inline
  policy scoped to `s3:PutObject`/`GetObject`/`ListBucket`/`DeleteObject` on
  that one bucket only — never a shared or admin credential.
- A Kubernetes `Secret` (`s3-creds`) carrying that access key, and the
  `ObjectStore` + `Cluster` custom resources that reference it.

## How to work here

- Stack: `dev`. Reads the kind cluster's `kubeconfigContext` from
  `01-cluster-and-operator` via `pulumi.StackReference`, configured with
  `pulumi config set pg-postgres-cluster:clusterStackRef <org>/pg-cluster/dev`.
- `renderYamlToDirectory` config lets `pulumi preview` be checked offline;
  never combine it with a `context`-based provider in the same run.
- Credential handling: never commit real AWS keys or a filled-in
  `Pulumi.dev.yaml` with live values. The `s3-creds` Secret's values are
  wrapped in `pulumi.secret(...)`, so they are encrypted at rest in Pulumi
  Cloud's stack state, not just hidden from CLI output.
- This bucket and IAM user are workshop-scoped and fully disposable: no
  `protect: true`, `forceDestroy: true` on the bucket, and 07-teardown is
  expected to `pulumi destroy` this stack along with everything else.
- `npm install` then `npx tsc --noEmit` before every `pulumi preview`.

## Verifying the end state

After `pulumi up` against a real kind cluster from 01:

```
kubectl --context kind-pg-workshop-demo get cluster -n postgres-demo
# expect: pg-cluster, status Cluster in healthy state

kubectl --context kind-pg-workshop-demo get pods -n postgres-demo
# expect: pg-cluster-1, pg-cluster-2, pg-cluster-3 all Running, one primary
```
