## The workshop

"API gateways as code: kgateway and Gateway API on Kubernetes with Pulumi."
90 minutes. No session or event date is scheduled yet, and no speakers are
assigned; the pipeline builds a workshop's demo code and slides from
evidence of audience interest, not from a calendar entry, and a person picks
a delivery date and presenter from the finished material afterward. See the
demo folder's own `AGENTS.md` for the full "why now" evidence.

## The original request

In order of authority:

1. The workshop brief (workspace document, not linked here since this repo
   is public; ask the pipeline owner for the id if you need it back).
2. This folder's `README.md`, which restates the brief's promise and
   learning outcomes for a participant.
3. The demo folder's own `AGENTS.md`, which records every deviation the
   demo code made from the brief and why.

## Structure asked for, with a minute budget per section

The brief's slide outline names 15 entries; this deck adds the standard
opening frame (speaker, housekeeping, agenda, a demo section divider) and
a recap of the three learning outcomes before the discussion prompt, since
the workshop-deck arc requires both and neither conflicts with anything the
brief specified. All 15 of the brief's own entries appear, in the brief's
order, as their own slide or slides.

| Slide | Content | Minutes |
| --- | --- | --- |
| 1 | Cover | 1 |
| 2 | Speaker (placeholder) | 2 |
| 3 | Housekeeping | 1 |
| 4 | Agenda | 1 |
| 5 | Hook: Ingress is showing its age | 4 |
| 6 | The Gateway API resource model (diagram) | 6 |
| 7 | Meet kgateway | 3 |
| 8 | Prerequisites check | 2 |
| 9 | Demo section divider | 1 |
| 10 | Step 1: cluster, CRDs, kgateway controller | 9 |
| 11 | Step 2: GatewayClass and Gateway | 9 |
| 12 | Step 3: two backend services | 5 |
| 13 | Step 4: path-based HTTPRoute | 10 |
| 14 | Step 5: header-based routing | 10 |
| 15 | Where this fits next to Ingress | 4 |
| 16 | Common pitfalls | 4 |
| 17 | kgateway vs. Higress vs. your mesh's gateway | 4 |
| 18 | What you now know how to do (recap of learning outcomes) | 2 |
| 19 | What would you change on Monday? | 3 |
| 20 | Resources and follow-up | 2 |
| 21 | Thank you / Q&A | 7 |

Total: 90 minutes, matching the brief's length exactly.

## Sources, with read dates

From the brief's own sources table, verbatim:

- 2025-05-15, sokube.io, KubeCon London 2025 recap (kgateway launch,
  independent coverage).
- 2026-02-01, reddit.com/r/kubernetes, discussion of kgateway's
  architecture amid Kong's OSS-support deprecation.
- 2026-03-30, lwcn.dev newsletter week 14, Higress at KubeCon EU 2026.
- 2026-04-01, podcast24.fr, DevOps Paradox episode naming Higress a
  notable AI-native gateway project.
- 2026-09-28, KubeCon + CloudNativeCon NA 2026 full program (415 sessions;
  networking/service-mesh 39, third-largest track).
- 2026-09-28, AWS re:Invent 2026 catalog (113 of 2043 sessions, partial).
- 2026-09-28, Microsoft Ignite 2026 catalog (17 of 806 sessions).
- 2026-09-28, github.com/pulumi/workshops tree (73 folders, no existing
  Gateway API coverage).

Docs read during this build, for the facts this deck states:

- https://kgateway.dev/docs/envoy/latest/setup/default/ (read 2026-09-28):
  the kgateway Helm chart creates a default GatewayClass named `kgateway`.
- https://kgateway.dev/docs/envoy/latest/reference/versions/ (read
  2026-09-28): kgateway 2.4.x is conformant on the Gateway API standard
  channel, supporting Kubernetes 1.32-1.36.
- https://kgateway.dev/docs/envoy/latest/install/sample-app/ (read
  2026-09-28): the Gateway's proxy Service is reached with
  `kubectl port-forward` in a kind cluster with no external load balancer.
- https://hub.docker.com/r/hashicorp/http-echo/tags (read 2026-09-28):
  `hashicorp/http-echo:1.0.0` pin used for both demo backends.
- https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v4/chart/
  (read 2026-09-28): the Pulumi Kubernetes provider's Helm v4 `Chart`
  resource, used for the kgateway install.
- https://www.pulumi.com/registry/packages/kubernetes/api-docs/apiextensions/customresource/
  (read 2026-09-28): `CustomResource`'s top-level `spec` property, used for
  GatewayClass, Gateway, and both HTTPRoutes.

QR destinations confirmed reachable this run (HTTP 200, 2026-09-28):
https://slack.pulumi.com, https://app.pulumi.com/signup,
https://github.com/pulumi/workshops (folder path shown as plain text
alongside the repo QR).

## Deviations from the brief

- **Opening frame and closing recap are additions, not brief entries.** The
  brief's §5 outline starts at the title slide and has no explicit speaker,
  housekeeping, agenda, demo-divider, or outcomes-recap slide. The
  workshop-deck arc requires all of these; none conflicts with anything the
  brief asked for, so they were added around the brief's 15 entries rather
  than in place of any of them.
- **Speaker slide is a placeholder.** No speakers are assigned yet (see
  "The workshop" above), so slide 2 uses
  `public/img/speaker-placeholder.png`, the literal text "Speaker Name,"
  and an HTML comment telling the presenter to replace it.
- **`07-teardown` has no slide of its own.** The brief's §5 outline stops
  at header-based routing (step 5 of 5) and never asks for a teardown
  slide. Teardown is covered in the speaker notes on the header-routing
  slide and as a one-line mention on the resources slide, matching how the
  demo folder documents it (`07-teardown/teardown.sh` runs `pulumi destroy`
  across all six stacks in reverse, then `kind delete cluster`).
- **Code slides show commands, not source.** Every code-layout slide in
  this deck shows the shell commands a participant types and the
  `kubectl`/`curl` checks that follow, never a pasted `index.ts`. This
  matches the workshop-deck skill's guidance that the demo folders hold the
  code and the slides hold the reason a participant is running it.

## Rules that still bind

- Every command shown on a code slide is one the demo actually runs, with
  the same flags; verified line by line against each numbered folder's
  `index.ts` and this folder's own `README.md` during this build.
- No em dashes or en dashes anywhere in this deck, including `package.json`
  metadata; grepped and fixed after every edit pass.
- `two-cols` in `@pulumi/slidev-theme` needs the named `::left::`/`::right::`
  slots; the default-slot form silently leaves the left column blank with
  no build or export error. Two slides in this deck (`Where this fits` and
  `kgateway vs. Higress`) hit this and were fixed after a visual QA pass
  caught the blank column; re-check this on any future edit to a two-cols
  slide in this deck.
- `slidev export` requires the `playwright-chromium` npm package
  (installed as a devDependency here) in addition to the Chromium binary
  and shared libraries already cached on the build workstation.
