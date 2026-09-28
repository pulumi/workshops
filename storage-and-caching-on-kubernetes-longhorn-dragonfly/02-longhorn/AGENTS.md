# AGENTS.md — 02-longhorn

Pulumi TypeScript project: the Longhorn Helm chart, in `index.ts`.

## What this provisions

- Longhorn v1.12.1 (`longhorn/longhorn` from `https://charts.longhorn.io`)
  into the `longhorn-system` namespace `01-cluster` created, with
  `persistence.defaultClass: false` (03-storage-class defines the
  StorageClass this workshop actually teaches with) and
  `defaultSettings.deletingConfirmationFlag: true` (required for a clean
  `helm uninstall`).

## Known risk -- read before treating this as a settled demo

Longhorn's own docs do not list kind among supported or tested platforms,
in either direction -- it is simply absent. One third-party report (not
Longhorn-authored, and only partially verifiable during this build) states
the Longhorn v1 (iSCSI-based) data engine cannot attach volumes inside a
kind cluster, because kind's "nodes" are containers sharing the Docker
host's kernel rather than separate machines with their own iscsi stack.
This is a real, unresolved risk to this workshop's core premise, not a
formality -- see the root README's "Known risk" section and the pull
request description. Test end-to-end on a real kind cluster before
delivery; if volumes will not attach, k3d/k3s is Longhorn's better-
documented local alternative.

## How to work here

- `npm install` before anything else; `npx tsc --noEmit` must pass cleanly.
- Reads `kubeconfigContext` and `longhornNamespaceName` from `01-cluster`'s
  stack via `pulumi.StackReference`; set Pulumi config `clusterStackRef` to
  that stack's fully-qualified name (`<org>/storage-caching-cluster/<stack>`).
- Same `renderYamlToDirectory`-vs-`context` provider pattern as every
  project in this workshop -- see `01-cluster/AGENTS.md`.
- The iscsi prerequisite is a presenter-run host step
  (`longhornctl ... install preflight`), not a Pulumi resource here -- see
  the comment in `index.ts` for why, and the root README's "Run the demo"
  section for the exact command.

## Verification

- `npx tsc --noEmit` must pass.
- After `pulumi up` against a live cluster:
  `kubectl -n longhorn-system get pods` -- longhorn-manager and
  longhorn-engine-image pods `Running` on every node.
