# AGENTS.md — api-gateways-on-kubernetes-kgateway

Guidance for coding agents (and humans) working in this workshop folder of
`pulumi/workshops`.

## What this folder is

The material for the workshop "API gateways as code — kgateway and Gateway
API on Kubernetes with Pulumi": a 90-minute session for platform and
networking engineers that provisions a kind cluster, the Gateway API CRDs,
the kgateway controller, a Gateway, two backend services, and two
HTTPRoutes (path- and header-based), entirely with Pulumi. See `README.md`
for the layout and how to run the demo.

The repo carries what an attendee or a future presenter needs: the demo
code and these notes. Slides follow on this same branch. The presenter's
own working documents (runbook, rehearsal checklist, fact-check log, open
questions) stay off the repo: `.gitignore` keeps every `*.md` out except
`README.md`, the `AGENTS.md` files, and `slides/slides.md`. If you write a
new working document, it is ignored by default; that is deliberate, do not
force-add it.

## Rules

- Stay inside this folder. Never modify other workshop folders in this
  repo.
- Facts about Pulumi products come from the docs listed under "Sources" in
  `README.md`, read during the run that built this folder, never from
  memory. Facts about kgateway and the Gateway API come from kgateway.dev
  and kubernetes-sigs/gateway-api, same rule. If a doc is unclear, the
  question goes into the pull request description as an open question;
  never fill a gap with something plausible.
- Canonical names: Pulumi Neo (or Neo) if referenced, Pulumi ESC, Pulumi
  Cloud, Pulumi IaC, Pulumi console (lowercase console). Never "Copilot",
  "Pulumi Service", "Insights", "CrossGuard".
- Conventional Commits, scoped to this folder, e.g.
  `feat(api-gateways-on-kubernetes-kgateway): …`,
  `docs(api-gateways-on-kubernetes-kgateway): …`.
- Do not commit credentials, `node_modules/`, `dist/`, state files, or
  recordings.

## Why the folder has seven numbered pieces, not the brief's seven steps verbatim

The brief's demo plan (its section 4) lists seven steps. Steps 1 and 2
collapse into one folder here, `01-kgateway-install/`, because step 1's end
state ("`pulumi preview` runs clean") only asks for a project that step 2
then fills — there is no separate resource to build for step 1 alone. Every
other brief step maps one-to-one onto a numbered folder (02 through 06);
`07-teardown/` is this build's own addition, matching every other workshop
in this repository.

1. `01-kgateway-install/` — kind cluster config (`kind.yaml`, applied via
   `kind create cluster` directly, since kind has no Pulumi provider), the
   Gateway API v1.6.1 standard-channel CRDs (`k8s.yaml.v2.ConfigFile`
   against the upstream release manifest URL), and the kgateway 2.4.5
   controller via a Pulumi-managed OCI Helm chart (`k8s.helm.v4.Chart`).
   One end state: kgateway controller pod `Running` in namespace
   `kgateway-system`.
2. `02-gatewayclass/` — the workshop's own GatewayClass, provisioned as a
   `kubernetes.apiextensions.CustomResource`. One end state:
   `kubectl get gatewayclass` shows it `Accepted`.
3. `03-gateway/` — the `gateway-demo` namespace and the Gateway resource
   with one HTTP listener. One end state: `kubectl get gateway` shows
   `Programmed` with an assigned address.
4. `04-backends/` — `app-a` and `app-b`, each a `Deployment` running a
   pinned `hashicorp/http-echo` container plus a matching `Service`. One
   end state: both pods `Running`, both Services resolvable in-cluster.
5. `05-path-routing/` — an HTTPRoute splitting `/a` to `app-a` and `/b` to
   `app-b`. One end state: `curl` at each path returns the correct app's
   text.
6. `06-header-routing/` — a second HTTPRoute, on its own path (`/headers`)
   so it never competes with `05-path-routing`'s rules on the same Gateway,
   splitting on the `x-backend` header. One end state: `curl` with the
   header returns `app-b`; without it, `app-a`.
7. `07-teardown/` — destroy in reverse order across all six stacks, then
   `kind delete cluster`, then verify nothing was left behind rather than
   assume it.

## Deviations from the brief (also listed in the pull request)

- **A second, explicit GatewayClass, not the chart's default one.**
  kgateway's Helm chart already creates a default GatewayClass named
  `kgateway` on install
  (https://kgateway.dev/docs/envoy/latest/setup/default/, read
  2026-09-28). The brief's step 3 is specifically about a participant
  declaring and inspecting a GatewayClass as its own Pulumi-managed
  resource, so `02-gatewayclass/` provisions a second, workshop-owned
  GatewayClass (`kgateway-workshop`) pointed at the same
  `controllerName: kgateway.dev/kgateway` instead of reusing the chart's
  default. A production deployment could reuse the chart's own `kgateway`
  class directly and skip this project entirely.
- **Gateway API CRD channel: standard, not experimental.** kgateway 2.4.x's
  version-support matrix states it is conformant to the Gateway API spec
  for the standard channel only
  (https://kgateway.dev/docs/envoy/latest/reference/versions/, read
  2026-09-28). Both this workshop's routing scenarios (path- and
  header-based `HTTPRoute` matches) are core/GA fields of the standard
  channel; nothing here needs the experimental channel's extra CRDs
  (`TCPRoute`, `TLSRoute`, `UDPRoute`, `BackendTLSPolicy`, and similar).
- **kind node image left unpinned in `kind.yaml`.** This build could not run
  `kind` on the build workstation (no `docker`, `kind`, or `kubectl`
  available, no root to install them), so there was no way to look up a
  current `kindest/node` tag+digest to verify against kgateway 2.4.x's
  supported Kubernetes range (1.32–1.36,
  https://kgateway.dev/docs/envoy/latest/reference/versions/, read
  2026-09-28). The presenter must pin `nodes[].image` in `kind.yaml` during
  rehearsal, from https://github.com/kubernetes-sigs/kind/releases, to a
  tag within that range.
- **CRD and Gateway/HTTPRoute representation.** Built with
  `kubernetes.apiextensions.CustomResource` for the GatewayClass, Gateway,
  and both HTTPRoutes, matching the closest reference workshop's own
  choice for its own CRDs, rather than generating a typed SDK extension for
  a single-use workshop. Each `CustomResource`'s spec fields are declared
  as a top-level `spec` property on the resource args (not nested under an
  `otherFields` wrapper) — confirmed against the installed
  `@pulumi/kubernetes` v4.34.2 package's own `CustomResourceArgs` type
  during this build's verification pass; an earlier draft that nested
  fields under `otherFields` rendered a literal `otherFields:` key into the
  YAML instead of `spec:` and was caught and fixed before commit.
- **`hashicorp/http-echo` for both backends, pinned to `1.0.0`.** A single
  tiny binary that answers every request with a fixed text body is exactly
  the "distinguishable text" the brief's routing scenarios need, with
  nothing else in the container to configure or go wrong.
  (https://hub.docker.com/r/hashicorp/http-echo/tags, read 2026-09-28)
- **Reaching the Gateway from a participant's `curl`.** kind runs the
  cluster inside Docker with no external load balancer, so the Gateway's
  proxy Service (named after the Gateway itself, `http`, in the
  `gateway-demo` namespace — same pattern kgateway's own sample-app doc
  uses,
  https://kgateway.dev/docs/envoy/latest/install/sample-app/, read
  2026-09-28) is reached with `kubectl -n gateway-demo port-forward svc/http
  8080:80`, documented as the last setup action before every `curl` check
  in `README.md`'s "Run the demo" section.

## Verification performed during this build (no live cluster available)

This build had no `docker`, `kind`, `kubectl`, or container runtime on the
build workstation, so nothing here was run against a live cluster. What was
verified instead, for every one of the six Pulumi projects (01 through 06):

- `npx tsc --noEmit` — clean, no errors.
- `pulumi up` with each project's `k8s.Provider` constructed via
  `renderYamlToDirectory` (offline rendering, no cluster contact) instead
  of a live `context` — succeeded for every project, chained through real
  `pulumi.StackReference` reads of upstream projects' outputs (so the same
  `installStackRef`/`gatewayStackRef`/`backendsStackRef` config pattern
  used in the real demo was exercised, not bypassed).
- The kgateway 2.4.5 and kgateway-crds 2.4.5 OCI Helm charts resolved
  successfully over the network from this build's `01-kgateway-install`
  preview and up, at the pinned digests recorded in the pull request.
- Every rendered YAML manifest (GatewayClass, Gateway, both HTTPRoutes,
  both Deployments, both Services) was read back and compared against the
  Gateway API v1 and core/v1 resource shapes documented upstream; all
  matched.
- `shellcheck` against `07-teardown/teardown.sh` and
  `07-teardown/verify-clean.sh`, using this folder's `.shellcheckrc` —
  clean.

Not verified, and why: an actual `kind create cluster`, the kgateway
controller reaching `Running`, `kubectl get gatewayclass`/`get gateway`
condition checks, and the `curl` routing checks against a live proxy all
require a container runtime this build environment does not have. The pull
request lists this same split.
