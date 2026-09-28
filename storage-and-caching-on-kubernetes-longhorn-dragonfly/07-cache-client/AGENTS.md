# AGENTS.md — 07-cache-client

Pulumi TypeScript project: a Job that exercises the Dragonfly cache, in
`index.ts`.

## What this provisions

- `Job/cache-client`: a `redis:7-alpine` container (used only for its
  bundled `redis-cli` binary, never as a server) that runs `PING`, writes
  five keys, then reads them back, against `06-dragonfly`'s Service.

## How to work here

- `npm install` before anything else; `npx tsc --noEmit` must pass cleanly.
- Reads `kubeconfigContext` and `workshopNamespaceName` from `01-cluster`'s
  stack, and `serviceName` from `06-dragonfly`'s stack, via
  `pulumi.StackReference` (config keys `clusterStackRef` and
  `dragonflyStackRef`).
- Same `renderYamlToDirectory`-vs-`context` provider pattern as every
  project in this workshop -- see `01-cluster/AGENTS.md`.
- The Job's shell script is built with `pulumi.interpolate` so the
  Dragonfly Service name (a Pulumi `Output`, resolved only once
  `06-dragonfly` has actually run) is substituted before the script ever
  reaches the cluster.

## Verification

- `npx tsc --noEmit` must pass.
- After `pulumi up` against a live cluster:
  `kubectl -n caching-workshop logs job/cache-client` -- shows `PONG` and
  all five `value-N` reads.
