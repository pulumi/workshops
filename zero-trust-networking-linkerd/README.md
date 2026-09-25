# Zero-trust networking as code — mutual TLS and traffic policy with Linkerd and Pulumi

A 90-minute, intermediate workshop for platform and network engineers. Two
plain HTTP services get mutual TLS nobody configured by hand, plus a traffic
policy the mesh enforces — the mesh's own root certificate included, all as
Pulumi code. No cloud account, no cloud spend: everything runs against a
local `kind` cluster. Estimated cost is **$0.00**.

Brief: [Zero-trust networking as code — mutual TLS and traffic policy with Linkerd and Pulumi](https://workprentice.ai/documents/10f4f3ca-a8d9-4572-85dc-768cf5f6bc90).
Backlog row: `cncf-service-mesh-networking`.

## Scope: why Linkerd, not Istio/Cilium/Envoy

The backlog row that seeded this workshop names four service-mesh projects.
This brief narrows that to one hands-on tool — Linkerd — because it injects
its data-plane proxy by annotation onto an already-running cluster; Istio's
ambient mode and Cilium's CNI-replacement approach both need a
cluster-bootstrap-time install, which does not fit a 90-minute session
starting from a plain `kind` cluster. Istio, Cilium and Envoy appear only as
slide-level landscape (see the deck once it exists). If a session wants the
Istio or Cilium angle instead, that is a new backlog candidate for Radar, not
a scope change to this workshop.

## Prerequisites

- Docker Desktop (or another `kind`-compatible Docker runtime), with roughly
  **4 vCPU / 6 GB free** for the cluster plus the Linkerd control plane and
  two sample services.
- [`kind`](https://kind.sigs.k8s.io/) v0.33.0 or later.
- `kubectl`, matching the cluster's Kubernetes minor version (v1.37 node
  image, see `01-cluster/`).
- The [`linkerd` CLI](https://linkerd.io/2026/06/23/announcing-linkerd-2.20/),
  stable channel, matching the chart version pinned below.
- Node.js LTS (22 or 24) and npm.
- The Pulumi CLI, v3.264.0 or later, and a Pulumi Cloud account (or a local
  state backend) for `pulumi login`.

Presenter setup, before the session: run `01-cluster/create-cluster.sh` and
`01-cluster/preflight.sh` in advance so the cluster is up and every container
image is pre-pulled; a live image pull mid-demo can eat several minutes of
the 90-minute budget.

## Layout

```
01-cluster/               kind config + create-cluster.sh + preflight.sh   (step 1)
02-trust-anchor/          Pulumi TS: self-signed CA + issuer cert          (step 2)
03-control-plane/         Pulumi TS: linkerd-crds + linkerd-control-plane  (step 3)
04-meshed-services/       Pulumi TS: two echo services, inject=enabled     (step 4)
05-mtls-proof/            Pulumi TS: linkerd-viz chart + verify-mtls.sh    (step 5)
06-authorization-policy/  Pulumi TS: Server + AuthorizationPolicy + MeshTLSAuthentication (step 6)
07-deny-in-action/        unauthorized-client.yaml + run-deny-demo.sh      (step 7)
08-teardown/              teardown.sh: destroy stacks + delete cluster     (step 8)
```

Each Pulumi project is its own stack (`dev`), so `pulumi up`/`pulumi destroy`
in one folder never touches another. `03-control-plane` reads
`02-trust-anchor`'s certificate outputs through a Pulumi `StackReference`
rather than by hand-copying files between steps — set
`mesh-demo-control-plane:trustAnchorStack` in `03-control-plane/Pulumi.dev.yaml`
to `<org>/mesh-demo-trust-anchor/dev`, where `<org>` is `organization` on a
local (`file://`) backend or your actual Pulumi Cloud organization name
otherwise.

## Run the demo

```bash
# 1. presenter setup (before the session)
01-cluster/create-cluster.sh
01-cluster/preflight.sh

# 2. the mesh's own root of trust, as Pulumi code
cd 02-trust-anchor && npm install
pulumi stack init dev
pulumi up                      # step 2 end state: trustAnchorPem, issuerCertPem, issuerKeyPem exported
cd ..

# 3. install the Linkerd control plane, wired to step 2's trust anchor
cd 03-control-plane && npm install
pulumi stack init dev
pulumi up                      # step 3 end state: linkerd-identity/-destination/-proxy-injector Running
kubectl --context kind-mesh-demo -n linkerd get pods
cd ..

# 4. mesh two services by namespace annotation alone
cd 04-meshed-services && npm install
pulumi stack init dev
pulumi up                      # step 4 end state: front and backend pods show 2/2 (app + linkerd-proxy)
kubectl --context kind-mesh-demo -n mesh-demo get pods
cd ..

# 5. prove mTLS is in effect
cd 05-mtls-proof && npm install
pulumi stack init dev
./wait-for-control-plane.sh
pulumi up                      # step 5 end state: linkerd-viz pods Running
./verify-mtls.sh               # linkerd viz edges shows front -> backend SECURED
cd ..

# 6. add the traffic policy: only "front" may call "backend"
cd 06-authorization-policy && npm install
pulumi stack init dev
pulumi up                      # step 6 end state: Server + AuthorizationPolicy + MeshTLSAuthentication created
./verify-policy.sh             # front -> backend still succeeds (it is the authorized identity)
cd ..

# 7. live: watch an unauthorized identity get rejected
07-deny-in-action/run-deny-demo.sh    # curl-client -> backend: HTTP 403; front -> backend: HTTP 200
07-deny-in-action/cleanup.sh          # remove the throwaway test client

# 8. teardown: leave nothing running
08-teardown/teardown.sh
```

Step 7 in the deck (the authentication-vs-authorization comparison) is a
slide, not an additional command — the live payoff is `run-deny-demo.sh`
above.

## What each step's end state looks like, and how to check it

| Step | End state | How to check |
| --- | --- | --- |
| 1 | `kind` cluster up, images pre-pulled | `kubectl --context kind-mesh-demo get nodes` |
| 2 | Trust anchor + issuer cert exported | `pulumi stack output` in `02-trust-anchor` |
| 3 | Control plane pods `Running` | `kubectl -n linkerd get pods` |
| 4 | `front`/`backend` pods `2/2` (app + proxy) | `kubectl -n mesh-demo get pods` |
| 5 | `front -> backend` shows `SECURED` | `05-mtls-proof/verify-mtls.sh` |
| 6 | Policy objects created; `front` still allowed | `06-authorization-policy/verify-policy.sh` |
| 7 | Unauthorized identity gets HTTP 403; `front` still gets 200 | `07-deny-in-action/run-deny-demo.sh` |
| 8 | No cluster, no stack resources | `kind get clusters`; `pulumi stack ls` in each folder |

## Sources

Facts in this folder come from these pages, read on September 25, 2026:

- Brief sources (context, why this workshop): CNCF's "Istio Brings Future
  Ready Service Mesh to the AI Era"
  (https://www.cncf.io/announcements/2026/03/25/istio-brings-future-ready-service-mesh-to-the-ai-era-with-new-ambient-multicluster-gateway-api-inference-extension-and-more/,
  2026-03-25); Linkerd's own "Announcing Linkerd 2.20" blog
  (https://linkerd.io/blog/, 2026-06-23); Google Cloud's "The case for Envoy
  networking in the agentic AI era"
  (https://cloud.google.com/blog/products/networking/the-case-for-envoy-networking-in-the-agentic-ai-era,
  2026-06-24); Buoyant's Service Mesh Academy
  (https://www.buoyant.io/service-mesh-academy, 2026-09-17); the Pulumi
  registry feasibility check for `kubernetes.helm.v4.Chart`
  (https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v4/chart/,
  2026-09-25); and a repository-tree check of github.com/pulumi/workshops
  confirming no prior Istio/Linkerd/Cilium/service-mesh folder existed
  (2026-09-25).
- Linkerd automatic proxy injection: the `linkerd.io/inject: enabled`
  annotation on a namespace or workload, and the two containers it adds
  (`linkerd-init`, `linkerd-proxy`): https://linkerd.io/docs/features/proxy-injection/
- Linkerd's own identity/trust-anchor Helm value keys
  (`identityTrustAnchorsPEM`, `identity.issuer.tls.crtPEM`/`keyPEM`) and the
  "stable" Helm repo (https://helm.linkerd.io/stable) serving only legacy
  pre-2.12 releases, versus the current edge repo
  (https://helm.linkerd.io/edge) which is where every current chart release
  actually lives: `helm.linkerd.io/stable/index.yaml` and
  `helm.linkerd.io/edge/index.yaml`, both fetched directly.
- Linkerd 2.20 stable milestone (announced 2026-06-23, corresponding to edge
  chart/app version `2026.6.3`/`edge-26.6.3`) — this is the version pinned in
  `02-trust-anchor`, `03-control-plane` and `05-mtls-proof`, not the
  `edge-26.9.3` release that was current on the day this brief was written:
  https://linkerd.io/2026/06/23/announcing-linkerd-2.20/
- `linkerd viz edges` and `linkerd viz tap`, and validating mTLS with either:
  https://linkerd.io/docs/tasks/validating-your-traffic/ and
  https://linkerd.io/docs/reference/cli/viz/
- Linkerd `Server` (API version `policy.linkerd.io/v1beta1`),
  `AuthorizationPolicy` and `MeshTLSAuthentication` (API version
  `policy.linkerd.io/v1alpha1`), and the documented policy-rejection
  behavior (HTTP 403 for known-HTTP traffic, TCP-level connection refusal
  otherwise): https://linkerd.io/docs/reference/authorization-policy/ and
  https://linkerd.io/docs/features/server-policy/
- `@pulumi/kubernetes` current version (4.34.2), `kubernetes.helm.v4.Chart`
  and `kubernetes.apiextensions.CustomResource` argument surfaces, and
  `kubernetes.Provider`'s `context` input:
  https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v4/chart/,
  https://www.pulumi.com/registry/packages/kubernetes/api-docs/apiextensions/customresource/,
  https://www.pulumi.com/registry/packages/kubernetes/api-docs/provider/
- `@pulumi/tls` current version (5.6.1), `SelfSignedCert`/`CertRequest`/
  `LocallySignedCert`:
  https://www.pulumi.com/registry/packages/tls/api-docs/
- `kind` current release (v0.33.0) and its default node image pin
  (`kindest/node:v1.37.0@sha256:a1ed56cfb0e7b93589bdf97c8cd566405a265939e3620fc4f5de89adff580ae5`),
  confirmed directly from the release notes:
  https://github.com/kubernetes-sigs/kind/releases/latest
- `ealen/echo-server` image, current tag `0.9.2`: https://hub.docker.com/r/ealen/echo-server/tags
- `curlimages/curl` image, tag `8.11.1`, used for the unauthorized test
  client in `07-deny-in-action/`.
- Pulumi CLI current release (3.264.0), Node.js LTS status: confirmed
  directly against the installed toolchain (`pulumi version`, `node --version`)
  and `npm view @pulumi/pulumi version` / `npm view @pulumi/kubernetes version`
  / `npm view @pulumi/tls version`.

## Verification actually run this build

- `npx tsc --noEmit` passed in every Pulumi TypeScript project
  (`02-trust-anchor`, `03-control-plane`, `04-meshed-services`,
  `05-mtls-proof`, `06-authorization-policy`).
- `pulumi up` in `02-trust-anchor` ran for real against a local Pulumi
  backend and created all six TLS resources, producing genuine PEM outputs.
- `pulumi preview` in `03-control-plane` resolved the `StackReference` to
  `02-trust-anchor`'s outputs for real (confirmed by the Namespace resource
  it created before failing, as expected, at the point requiring live
  cluster connectivity).
- `pulumi preview` in `04-meshed-services` succeeded in full (all 9
  resources, including per-service `ServiceAccount`s) since it needs no
  live cluster to plan create-only changes.
- `pulumi preview` in `05-mtls-proof` reached the same expected
  cluster-connectivity stop as `03-control-plane`.
- `pulumi preview` in `06-authorization-policy` succeeded in full (the
  `Server`/`AuthorizationPolicy`/`MeshTLSAuthentication` `CustomResource`s
  plan without needing a live cluster).
- `shellcheck` passed on every script in `01-cluster/`, `05-mtls-proof/`,
  `06-authorization-policy/`, `07-deny-in-action/` and `08-teardown/`.
- The `kindest/node` image sha pinned in `01-cluster/create-cluster.sh` was
  checked directly against kind v0.33.0's own release notes and matches.

**Not verified this run** (no `docker`, `kind`, `kubectl`, `helm` or
`linkerd` CLI, and no root, on the build workstation) — needs a live
rehearsal before the session:

- `kind create cluster` actually starting a working cluster.
- `linkerd check --pre` and `linkerd check`.
- The Linkerd control plane and `linkerd-viz` charts actually installing via
  Helm and reaching `Running`.
- The `2/2` sidecar count on `front`/`backend` pods after injection.
- `linkerd viz edges` and `linkerd viz tap` actually showing `SECURED`/`tls=true`.
- The live HTTP 403 rejection in `07-deny-in-action/run-deny-demo.sh`.
- `pulumi destroy` and `kind delete cluster` in `08-teardown/teardown.sh`.

## Open questions

None blocking. The brief's own confidence is high on feasibility and demand
signal, medium on the exact Linkerd chart version (edge releases move
roughly weekly) — resolved above by pinning to the chart version tied to the
Linkerd 2.20 stable milestone rather than whatever edge tag was newest on
build day, with both the milestone announcement and the raw edge-repo index
as sources.
