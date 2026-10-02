# 01-platform

Pulumi TypeScript stack that stands up the shared platform for the CloudNativePG
workshop: a local kind cluster, cert-manager, the CloudNativePG operator, the
Barman Cloud Plugin (co-located with the operator in `cnpg-system`, as the
plugin requires), and the three namespaces the rest of the workshop uses
(`cert-manager`, `cnpg-system`, `cnpg-demo`). The `cnpg-demo` namespace is
created here as a platform concern, but the Postgres `Cluster`/`ObjectStore`/
`Secret` resources inside it belong to the sibling `02-cluster` project.

## Configuration

Set via `pulumi config set <key> <value>`:

- `clusterName` (string, default `cnpg-demo`) -- the kind cluster name. Sibling
  stacks derive their kubeconfig context from this via a `StackReference`.
- `nodeImage` (string, default the pinned `kindest/node` tag for this workshop)
  -- the kind node image, always pinned to a digest, never `latest`.
- `renderToDirectory` (optional string) -- when set, skips creating the kind
  cluster and the `local.Command` entirely, and builds the Kubernetes provider
  in `renderYamlToDirectory` mode instead. This is a presenter dry-run /
  offline-verification aid; participants running the workshop live should
  leave it unset.

## Teardown order

This is the **last** project torn down in the workshop's teardown sequence.
`pulumi destroy` here deletes the entire kind cluster, which takes every
namespace, every PVC, and any backed-up data still only referenced locally
with it. Destroy `06-restore` and `02-cluster` first.
