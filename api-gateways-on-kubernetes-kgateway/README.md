# API gateways as code — kgateway and Gateway API on Kubernetes with Pulumi

A 90-minute workshop for platform and networking engineers who manage
Ingress today and want to see what the Kubernetes Gateway API changes. The
Gateway API replaces Ingress's single, overloaded resource with three
purpose-built ones — GatewayClass, Gateway, and route — and kgateway is a
CNCF sandbox project that implements it on Envoy. Pulumi provisions the
whole stack: the kind cluster, the Gateway API CRDs, the kgateway
controller, a Gateway, two backend services, and two HTTPRoutes. By the
end, attendees have a working Gateway API deployment routing HTTP traffic
to two backend services with path- and header-based rules, all provisioned
as code.

> Ingress was never actually one thing: every controller bolted its own
> annotations onto a resource that was never designed to express routing
> rules, TLS policy, and cross-team ownership at once. The Gateway API
> fixes the resource model first — separate objects for the infrastructure,
> the listener, and the route, each ownable by a different team — and this
> workshop proves it by building path- and header-based routing entirely
> with Pulumi, on a cluster where you never touch an Ingress annotation.
>
> — Workshop brief: "API gateways as code — kgateway and Gateway API on
> Kubernetes with Pulumi"

## Sessions and speakers

No event page and no scheduled session exist yet for this workshop.
Speakers not yet assigned. This is expected: the pipeline builds a
workshop's demo code and slides from evidence of audience interest, not
from a calendar entry, and a person picks a delivery date from the finished
material afterward. See "Why now" below for the evidence that put this
topic in the build queue.

## What attendees learn

1. How the Gateway API's three-resource model (GatewayClass, Gateway,
   HTTPRoute) replaces Ingress's single overloaded resource, and why that
   split matters for who owns what.
2. How to provision Gateway API CRDs and a kgateway controller with Pulumi,
   using a Pulumi-managed Helm release for both.
3. How to declare a Gateway with an HTTP listener, and route to two
   backend services by URL path.
4. How to add header-based routing alongside path-based routing on the
   same Gateway, and reason about how the Gateway API resolves rules that
   could both match.

## Why now

This topic was not requested by title; it was selected from independent
signal across two separate CNCF gateway projects, reinforced by
theme-level session counts at three major conferences:

- kgateway's own KubeCon London 2025 launch got independent recap coverage
  the same month, separate from kgateway's own announcement.
- A February 2026 r/kubernetes discussion of kgateway's architecture
  surfaced organically amid Kong's OSS Ingress controller deprecation,
  meaning practitioners are actively looking for a replacement path.
- Higress, a second CNCF gateway project (Envoy Gateway API implementation
  with an AI-gateway angle), got independent newsletter coverage from
  KubeCon EU 2026 and a namecheck on a DevOps podcast as a notable
  AI-native gateway project, one month apart.
- At three of the largest infrastructure conferences' 2026 catalogs, the
  networking/service-mesh theme this topic belongs to ran third-largest by
  session count at KubeCon + CloudNativeCon NA (39 of 415 sessions), and was
  present in double digits at both AWS re:Invent (113 of a partial capture
  of 2,043 sessions) and Microsoft Ignite (17 of 806 sessions).
- The `pulumi/workshops` repository tree carried no existing coverage of
  Gateway API or kgateway as of this build.

**Open question, not resolved by this build:** the brief defaults to
kgateway over Higress as the primary tool taught, for its closer fit to a
general infrastructure audience managing Ingress today. Higress's
AI-gateway framing may fit an AI-focused audience segment better. This
build follows the brief's default (kgateway) and flags the question rather
than resolving it silently; see the pull request for the same note.

## Layout

```
api-gateways-on-kubernetes-kgateway/
├── README.md                this file
├── AGENTS.md                conventions for agents (and humans) editing this folder
├── 01-kgateway-install/     kind cluster config, Gateway API CRDs, and the kgateway
│                            controller via a Pulumi-managed OCI Helm chart
├── 02-gatewayclass/         the workshop's own GatewayClass, pointed at kgateway's
│                            controller name
├── 03-gateway/              the workload namespace and the Gateway resource itself,
│                            with one HTTP listener
├── 04-backends/             app-a and app-b: Deployments and Services returning
│                            distinguishable text
├── 05-path-routing/         an HTTPRoute splitting /a to app-a and /b to app-b
├── 06-header-routing/       a second HTTPRoute routing on a custom header, alongside
│                            the path split
├── 07-teardown/             pulumi destroy across all six stacks, then kind delete
│                            cluster, then a check that nothing was left behind
└── slides/                  Slidev deck (built separately, once this branch
                             has demo code on it)
```

The brief's demo plan (section 4) describes seven steps; step 1 ("TypeScript
project with the Kubernetes provider, `pulumi preview` runs clean") and
step 2 ("Gateway API CRDs and the kgateway controller, controller pod
Running") collapse into one folder here, `01-kgateway-install/`, because
step 1's end state only asks for a project that step 2 then fills — there
is no separate resource to build for step 1 alone. Every other brief step
maps one-to-one onto a numbered folder.

The kind cluster itself is a prerequisite (brief section 6), not one of the
seven numbered demo steps, so its creation is a shellcheck-clean script
shipped alongside `01-kgateway-install/`'s Pulumi program (see "Run the
demo" below) rather than a Pulumi resource of its own — kind has no Pulumi
provider.

## Prerequisites

**Participants** (bring these installed and pinned before the session):

| Tool | Version | Source |
|---|---|---|
| Pulumi CLI | latest (this build used 3.263.0) | https://www.pulumi.com/docs/install/ |
| Node.js | 20.x or later (this build used 22.23.2) | https://nodejs.org |
| kind | latest stable | https://github.com/kubernetes-sigs/kind/releases |
| Docker (or Podman) | recent stable | kind's own requirement |
| kubectl | matching the kind node's Kubernetes minor | https://kubernetes.io/docs/tasks/tools/ |
| curl | any recent version | used for every routing check |

No cloud account is needed — this workshop is entirely local, running
against a `kind` cluster with zero cloud dependency and zero cost.

**Presenter only**:

- Cache the kind node image and mirror or pre-pull the kgateway Helm charts
  and the Gateway API CRD manifest before the session, so no step depends
  on a live pull during the 55-minute build budget.
- Run one full rehearsal end to end inside the 55-minute build budget,
  including the header-routing `curl` check, before the first delivery.
- kgateway is a younger project than Istio or Linkerd, with less
  battle-tested failure-mode documentation. Prepare a recorded fallback
  segment for the Gateway-provisioning step (`03-gateway/`) in case a live
  failure mode surfaces that the rehearsal did not.

## Run the slides

Not built yet: this run covers demo code only. Slides follow on this same
branch in a later run. Once present, the deck runs the same way as this
repository's other workshops:

```bash
cd slides
npm install
npm run dev
```

## Run the demo

Pinned versions used in this build, verify before every session — the
Gateway API and kgateway are both fast-moving, and a CRD/controller version
mismatch is this workshop's documented top risk (see "Deviations and open
questions" in `AGENTS.md`):

| Tool / chart / manifest | Version | Source |
|---|---|---|
| kgateway Helm chart (`oci://cr.kgateway.dev/kgateway-dev/charts/kgateway`) | 2.4.5 | https://kgateway.dev/docs/envoy/latest/reference/versions/ (read 2026-09-28) |
| kgateway CRDs chart (`oci://cr.kgateway.dev/kgateway-dev/charts/kgateway-crds`) | 2.4.5 | same |
| Gateway API CRDs (standard channel) | v1.6.1 | https://github.com/kubernetes-sigs/gateway-api/releases/tag/v1.6.1 |
| `@pulumi/kubernetes` | ^4.34.2 | https://www.pulumi.com/registry/packages/kubernetes/api-docs/ (read 2026-09-28) |
| Kubernetes (kind node, participant-pinned) | 1.32–1.36 (kgateway 2.4.x's supported range) | https://kgateway.dev/docs/envoy/latest/reference/versions/ (read 2026-09-28) |

kgateway's version-support matrix states it is conformant to the Gateway
API spec for the **standard** channel only — this build uses the standard
channel throughout, not experimental.

Numbered steps and expected end state:

1. `cd 01-kgateway-install && kind create cluster --config kind.yaml --name
   api-gateways-workshop-demo` (once, before the first `pulumi up`) — then
   `npm install && pulumi up`. Applies the Gateway API v1.6.1 standard CRDs
   and installs kgateway 2.4.5 into namespace `kgateway-system` via a
   Pulumi-managed OCI Helm chart. Expected: `kubectl --context
   kind-api-gateways-workshop-demo get pods -n kgateway-system` shows the
   kgateway controller pod `Running`.
2. `cd 02-gatewayclass && npm install && pulumi up` — a GatewayClass named
   `kgateway-workshop`, `controllerName: kgateway.dev/kgateway`. Expected:
   `kubectl get gatewayclass kgateway-workshop` shows condition `Accepted:
   True`. (kgateway's own chart already creates a default GatewayClass
   named `kgateway`; this workshop provisions its own alongside it — see
   `02-gatewayclass/AGENTS.md` for why.)
3. `cd 03-gateway && npm install && pulumi up` — the `gateway-demo`
   namespace and a Gateway named `http` with one HTTP listener on port 80.
   Expected: `kubectl -n gateway-demo get gateway http` shows `Programmed:
   True` with an assigned address.
4. `cd 04-backends && npm install && pulumi up` — Deployments and Services
   for `app-a` and `app-b`, each a pinned `hashicorp/http-echo` container
   returning its own name as text. Expected: both pods `Running`; `kubectl
   -n gateway-demo run tmp --rm -it --image=busybox --restart=Never --
   wget -qO- app-a-svc:5678` returns `app-a` (and the same for `app-b-svc`
   returning `app-b`).
5. `cd 05-path-routing && npm install && pulumi up` — an HTTPRoute splitting
   `/a` to `app-a-svc` and `/b` to `app-b-svc` on the `http` Gateway.
   Expected, after port-forwarding the Gateway's proxy Service
   (`kubectl -n gateway-demo port-forward svc/http 8080:80`):
   `curl localhost:8080/a` returns `app-a`; `curl localhost:8080/b` returns
   `app-b`.
6. `cd 06-header-routing && npm install && pulumi up` — a second HTTPRoute
   on path `/headers`, splitting on the `x-backend` header: present with
   value `b` routes to `app-b-svc`, otherwise to `app-a-svc`. Expected:
   `curl -H "x-backend: b" localhost:8080/headers` returns `app-b`; `curl
   localhost:8080/headers` (no header) returns `app-a`.
7. Teardown: `07-teardown/teardown.sh` — `pulumi destroy` across
   06 → 05 → 04 → 03 → 02 → 01, then `kind delete cluster --name
   api-gateways-workshop-demo`, then `07-teardown/verify-clean.sh` confirms
   no cluster was left behind.

## Sources

- kgateway documentation, custom resources overview, https://kgateway.dev/docs/envoy/latest/about/custom-resources/, read 2026-09-28.
- kgateway documentation, default install and GatewayClass, https://kgateway.dev/docs/envoy/latest/setup/default/, read 2026-09-28.
- kgateway documentation, quickstart (Helm install commands, CRD channel, kind steps), https://kgateway.dev/docs/envoy/latest/quickstart/, read 2026-09-28.
- kgateway documentation, sample app and Gateway reachability pattern, https://kgateway.dev/docs/envoy/latest/install/sample-app/, read 2026-09-28.
- kgateway documentation, version support matrix, https://kgateway.dev/docs/envoy/latest/reference/versions/, read 2026-09-28.
- Gateway API releases, v1.6.1, https://github.com/kubernetes-sigs/gateway-api/releases/tag/v1.6.1, read 2026-09-28.
- Pulumi Kubernetes provider registry docs, `helm.v4.Chart`, https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v4/chart/, read 2026-09-28.
- Pulumi Kubernetes provider registry docs, `apiextensions.CustomResource`, https://www.pulumi.com/registry/packages/kubernetes/api-docs/apiextensions/customresource/, read 2026-09-28.
- Pulumi tutorial, "Choosing the right Helm resource" (v3 Release vs v4 Chart), https://www.pulumi.com/dev/tutorials/choosing-the-right-helm-resource/, read 2026-09-28.
- sokube.io, KubeCon London 2025 recap covering kgateway's launch, read 2025-05-15.
- reddit.com/r/kubernetes discussion of kgateway's architecture amid Kong OSS Ingress controller deprecation, read 2026-02-01.
- lwcn.dev newsletter, week 14 2026, Higress coverage at KubeCon EU 2026, read 2026-03-30.
- podcast24.fr, DevOps Paradox episode naming Higress a notable AI-native gateway project, read 2026-04-01.
- KubeCon + CloudNativeCon NA 2026 full program (415 sessions), networking/service-mesh theme at 39 sessions, read 2026-09-28.
- AWS re:Invent 2026 catalog (2,043 sessions, partial capture), same theme at 113 sessions, read 2026-09-28.
- Microsoft Ignite 2026 catalog (806 sessions), same theme at 17 sessions, read 2026-09-28.
- `pulumi/workshops` repository tree (73 folders), no existing coverage of this topic, read 2026-09-28.

## Open questions for the presenter

- No committed delivery date exists yet; a person needs to pick one from
  this finished material and confirm speakers.
- This build could not run a live `kind` cluster (no `docker`, `kind`, or
  `kubectl` on the build workstation, and no root to install them). See the
  pull request description for the exact list of what was verified instead
  and what still needs a real machine before the first delivery.
- The kind node image is not pinned in `01-kgateway-install/kind.yaml` (see
  the comment there): the presenter should pin a specific `kindest/node`
  tag+digest within Kubernetes 1.32–1.36 during rehearsal.
- kgateway vs. Higress as the primary tool taught is a live choice, not a
  closed one — see "Why now" above.
