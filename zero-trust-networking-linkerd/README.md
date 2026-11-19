# Zero-trust networking as code: mutual TLS and traffic policy with Linkerd and Pulumi

A 90-minute, intermediate workshop for platform and network engineers. Two
plain HTTP services get mutual TLS that nobody configured by hand, plus a
traffic policy the mesh enforces. The mesh's own root certificate is Pulumi
code too. There is no cloud account and no cloud spend: everything runs on a
local `kind` cluster. Estimated cost is $0.00.

> Provision a service mesh's identity and traffic policy as Pulumi code: a
> self-signed trust anchor, the Linkerd control plane, two meshed services,
> and a policy that blocks one service from calling another. You leave with
> two services talking over mutual TLS and a call the mesh itself rejects.
>
> Workshop page: unknown, the workshop is not yet scheduled.

## Sessions and speakers

Sessions: unknown, the workshop is not yet scheduled.

Speakers: unknown.

## What attendees learn

1. Generate a mesh trust anchor (root CA) as Pulumi code and use it to install a service mesh control plane.
2. Mesh two services by annotation and confirm, with the mesh's own tooling, that traffic between them is mutually authenticated and encrypted.
3. Write and apply a mesh-native authorization policy that blocks one service from calling another, and watch the call get rejected.
4. Explain why "the mesh terminates TLS for you" is a different claim from "your services are authorized to talk to each other", and where each is declared in Pulumi code.
5. Tear down every resource so the local environment is left clean.

Linkerd is the only hands-on mesh. Istio's ambient mode and Cilium's CNI
replacement need a cluster-bootstrap-time install, which does not fit a
90-minute session on a plain `kind` cluster. Istio, Cilium and Envoy appear
on slides as landscape context only.

## Layout

```
zero-trust-networking-linkerd/
├── README.md                  this file
├── AGENTS.md                  conventions for agents (and humans) editing this folder
├── .gitignore                 ignores node_modules, dist, bin, state and working documents
├── .shellcheckrc              shellcheck settings for every .sh file
├── 01-cluster/                step 1: kind-config.yaml, create-cluster.sh, preflight.sh, reset.sh
├── 02-trust-anchor/           step 2: Pulumi TS, self-signed CA and issuer cert
├── 03-control-plane/          step 3: Pulumi TS, linkerd-crds and linkerd-control-plane
├── 04-meshed-services/        step 4: Pulumi TS, front and backend echo services, injection enabled
├── 05-mtls-proof/             step 5: Pulumi TS, linkerd-viz chart; wait-for-control-plane.sh, verify-mtls.sh
├── 06-authorization-policy/   step 6: Pulumi TS, Server, AuthorizationPolicy, MeshTLSAuthentication; verify-policy.sh
├── 07-deny-in-action/         step 7: unauthorized-client.yaml, run-deny-demo.sh, cleanup.sh
└── 08-teardown/               step 8: teardown.sh, destroys the stacks and deletes the cluster
```

Each Pulumi project (02 to 06) has its own `Pulumi.yaml`, `index.ts`,
`package.json`, `package-lock.json`, `tsconfig.json` and `.gitignore`, and
its own stack named `dev`. Running `pulumi up` or `pulumi destroy` in one
folder never touches another. `03-control-plane` reads `02-trust-anchor`'s
certificate outputs through a Pulumi `StackReference`, so nobody copies files
between steps by hand. Run
`pulumi config set trustAnchorStack <org>/mesh-demo-trust-anchor/dev` in
`03-control-plane` (it writes the untracked `Pulumi.dev.yaml`). `<org>` is
`organization` on a local (`file://`) backend, or your Pulumi Cloud
organization name otherwise.

## Prerequisites

Participants:

- Docker Desktop (or another `kind`-compatible Docker runtime), with roughly
  4 vCPU and 6 GB free for the cluster, the Linkerd control plane and two
  sample services.
- [`kind`](https://kind.sigs.k8s.io/) v0.33.0 or later.
- `kubectl`, matching the cluster's Kubernetes minor version (v1.37 node
  image, see `01-cluster/`).
- The [`linkerd` CLI](https://linkerd.io/2026/06/23/announcing-linkerd-2.20/),
  matching the chart version pinned in the Sources section.
- Node.js LTS (22 or 24) and npm.
- The Pulumi CLI, v3.266.0 (verified; later should work), and either a Pulumi
  Cloud account or a local state backend for `pulumi login`.

Presenter, before the session: run `01-cluster/create-cluster.sh` and
`01-cluster/preflight.sh` so the cluster is up and every container image is
pre-pulled. A live image pull mid-demo can eat several minutes of the
90-minute budget.

## Run the slides

The Slidev deck follows in a later commit on this branch. This folder has no
`slides/` directory yet.

## Run the demo

```bash
# 1. once, before the session: create the cluster and pre-pull images
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
pulumi config set trustAnchorStack <org>/mesh-demo-trust-anchor/dev
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
slide, not an additional command, the live payoff is `run-deny-demo.sh`
above.

Once only: step 1 (cluster and image pre-pull) and the
`pulumi config set trustAnchorStack` call in step 3. Between runs:
`01-cluster/reset.sh` removes the step 7 test pod and keeps the cluster and
mesh up, `07-deny-in-action/cleanup.sh` removes the throwaway test client, and
`08-teardown/teardown.sh` leaves nothing behind.

Step 7 on the deck, the authentication-versus-authorization comparison, is a
slide and has no command. The live payoff is `run-deny-demo.sh` above.

## Teardown and cost

`08-teardown/teardown.sh` destroys the five Pulumi stacks in reverse
dependency order, then deletes the `kind` cluster. Run it after every
rehearsal and every real session. The workshop creates no cloud resources, so
the estimated cost is $0.00.

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

## Verification

Run on 2026-10-01 with Pulumi CLI v3.266.0, Node v22.23.2, helm v3.16.4,
shellcheck 0.10.0, kind v0.33.0 (binary only).

- `npm install` and `npx tsc --noEmit` passed in all five Pulumi projects
  with exact pins: `@pulumi/pulumi` 3.266.0, `@pulumi/kubernetes` 4.34.2,
  `@pulumi/tls` 5.6.1, `typescript` 5.9.3, `@types/node` 22.20.4.
- Verification-only backend: `PULUMI_BACKEND_URL=file:///tmp/zt-state` with
  `PULUMI_CONFIG_PASSPHRASE` set in the shell for the check. Nothing is
  committed.
- `pulumi up` in `02-trust-anchor` created six TLS resources.
- `pulumi preview` in `03-control-plane` read the `StackReference` and then
  stopped at "cluster unreachable" (no cluster). `05-mtls-proof` stopped the
  same way. `04-meshed-services` (9 resources) and `06-authorization-policy`
  (5 resources) previewed fully.
- `helm template` of `linkerd-crds`, `linkerd-control-plane` and
  `linkerd-viz` at 2026.6.3 from `https://helm.linkerd.io/edge` rendered with
  the value keys the code sets. Rendered CRDs: `Server` v1beta3 storage, with
  v1beta1 served; `AuthorizationPolicy` and `MeshTLSAuthentication` v1alpha1.
  `linkerd-viz` 2026.6.3 does not exist in the stable repo, so step 5 uses
  the edge repo.
- `shellcheck` with `.shellcheckrc` passed on every `.sh` file.

Not verified (needs a live rehearsal; `docker` is not installed and
there is no root, so `kind create cluster --name mesh-demo` failed with
"docker: executable file not found"; no `linkerd` CLI):

- Cluster start, `linkerd check`, chart install to `Running`, the `2/2`
  sidecars, `linkerd viz edges`, the HTTP 403 in step 7, `pulumi destroy`
  and `kind delete cluster` in step 8.

Live latest on 2026-10-01: Pulumi CLI v3.266.0, kind v0.33.0, `@pulumi/pulumi`
3.266.0, `@pulumi/kubernetes` 4.34.2, `@pulumi/tls` 5.6.1. The edge repo now
has 2026.9.3 (edge-26.9.3); the pin stays 2026.6.3 (Linkerd 2.20, edge-26.6.3).

Re-read 2026-10-01: https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v4/chart/ ,
https://www.pulumi.com/docs/iac/concepts/secrets/ ,
https://www.pulumi.com/docs/iac/concepts/state-and-backends/ ,
https://www.pulumi.com/docs/iac/concepts/stacks/ (StackReference),
https://linkerd.io/2/tasks/install-helm/ , https://linkerd.io/2/features/automatic-mtls/ ,
https://linkerd.io/2/reference/authorization-policy/ , https://linkerd.io/releases/ ,
https://helm.linkerd.io/edge/index.yaml , https://helm.linkerd.io/stable/index.yaml .

## Sources

Facts in this folder come from these pages. Read date: 2026-10-01 (context sources keep their own publication dates).

- Context sources (why this workshop): CNCF's "Istio Brings Future
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
  confirming no prior Istio, Linkerd, Cilium or service-mesh folder existed
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
  chart/app version `2026.6.3`/`edge-26.6.3`), this is the version pinned in
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
- Pulumi CLI current release (3.266.0), Node.js LTS status: confirmed
  directly against the installed toolchain (`pulumi version`, `node --version`)
  and `npm view @pulumi/pulumi version` / `npm view @pulumi/kubernetes version`
  / `npm view @pulumi/tls version`.

Re-read 2026-10-01: https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v4/chart/ ,
https://www.pulumi.com/docs/iac/concepts/secrets/ ,
https://www.pulumi.com/docs/iac/concepts/state-and-backends/ ,
https://www.pulumi.com/docs/iac/concepts/stacks/ (StackReference),
https://linkerd.io/2/tasks/install-helm/ , https://linkerd.io/2/features/automatic-mtls/ ,
https://linkerd.io/2/reference/authorization-policy/ , https://linkerd.io/releases/ ,
https://helm.linkerd.io/edge/index.yaml , https://helm.linkerd.io/stable/index.yaml .
