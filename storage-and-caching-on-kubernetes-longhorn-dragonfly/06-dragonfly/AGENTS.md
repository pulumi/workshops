# AGENTS.md — 06-dragonfly

Pulumi TypeScript project: the Dragonfly cache, in `index.ts`.

## What this provisions

- `Deployment/dragonfly`: one replica,
  `docker.dragonflydb.io/dragonflydb/dragonfly:v2.0.0`, port 6379, no
  volume mount (cache-only, no persistence).
- `Service/dragonfly` (ClusterIP): the address `07-cache-client` and
  `redis-cli` connect to.

## Open questions this project carries (see the pull request)

- Dragonfly's own docs do not publish a plain Deployment+Service manifest
  for Kubernetes; this Deployment is derived from the `docker run` examples
  rather than an official K8s YAML.
- `securityContext.capabilities.add: ["IPC_LOCK"]` is a best-effort
  in-cluster translation of the `--ulimit memlock=-1` flag every official
  `docker run` example sets; not doc-confirmed as the correct Kubernetes
  equivalent.

## How to work here

- `npm install` before anything else; `npx tsc --noEmit` must pass cleanly.
- Reads `kubeconfigContext` and `workshopNamespaceName` from `01-cluster`'s
  stack via `pulumi.StackReference` (config key `clusterStackRef`).
- Same `renderYamlToDirectory`-vs-`context` provider pattern as every
  project in this workshop -- see `01-cluster/AGENTS.md`.

## Verification

- `npx tsc --noEmit` must pass.
- After `pulumi up` against a live cluster:
  `kubectl -n caching-workshop get pods -l app=dragonfly` -- `Running`;
  `redis-cli -h <service-cluster-ip> ping` -- `PONG`.
