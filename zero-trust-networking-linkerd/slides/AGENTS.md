# AGENTS.md — the deck's brief and sources

This file records what the deck was asked to be and which sources it was
built from, so anyone (human or agent) editing `slides.md` works from the
same brief. Conventions for the whole workshop folder are in `../AGENTS.md`.

## The workshop

"Zero-trust networking as code: mutual TLS and traffic policy with Linkerd
and Pulumi." Sessions: unknown. Dates: unknown. Length: 90 minutes. Level:
intermediate, for platform and network engineers who already run Kubernetes
Deployments and Services but have no prior service-mesh experience. Speakers:
unknown, so the deck carries one placeholder speaker slide with a
`TODO(presenter)` comment rather than an invented name, photo, or bio.

## The original request

The deck was drafted from these inputs, in this order of authority:

1. The workshop brief:
   https://workprentice.ai/documents/10f4f3ca-a8d9-4572-85dc-768cf5f6bc90
2. The reference workshop, the style source of truth for folder layout,
   Slidev theme usage, and slide/notes conventions:
   https://github.com/pulumi/workshops/tree/main/neo-in-a-docker-sandbox
3. This workshop's own demo code and README, already on this branch at
   commit `3e3b87c`, in `zero-trust-networking-linkerd/`. Every command shown
   on a slide is copied from that README and from each numbered folder's own
   script, not invented for the deck.
4. `pulumi.com/registry` docs for `@pulumi/tls` and `@pulumi/kubernetes`
   (`helm.v4.Chart`, `apiextensions.CustomResource`), and linkerd.io docs for
   `AuthorizationPolicy` / `Server` / `MeshTLSAuthentication`, read during
   this build to confirm resource and CLI names before putting them on a
   slide (see Sources below for dates).

## Structure asked for (90 minutes)

Budgeted per content slide, all in speaker-note HTML comments; the sum
across the 18 content slides is exactly 90 minutes:

- Hook and pain (why per-call identity is the actual gap): 5 min
- What a mesh adds, the un-meshed diagram: 5 min
- Landscape (Istio / Linkerd / Cilium / Envoy, why Linkerd is hands-on): 5 min
- Prerequisites: 3 min
- Demo section divider: 0 min (beat, not counted)
- Step 2, trust anchor as code: 9 min
- Step 3, control plane install: 9 min
- Step 4, mesh two services by annotation: 9 min
- Step 5, prove mTLS with `linkerd viz`: 9 min
- Authentication vs. authorization diagram: 5 min
- Step 6, write the AuthorizationPolicy: 9 min
- Step 7, watch the deny happen live: 9 min
- What this does not cover (Istio ambient / Cilium CNI scope line): 3 min
- Statement beat before cleanup: 1 min
- Cleanup and recap: 5 min
- Follow-up (Slack / Cloud signup / repo QR): 2 min
- Q&A / thanks: 1 min

Front matter (title, one placeholder speaker slide, housekeeping, agenda)
and the closing follow-up/Q&A slides follow the fixed frame from the
`workshop-deck` skill; their note budgets are counted in the total above.

## §5 slide outline followed exactly

Every entry in the brief's §5 outline has one slide, in the brief's order:
why now, what a mesh adds, the landscape, trust anchor, control plane,
meshed services, mTLS proof, authN-vs-authZ, authorization policy, deny in
action, what this does not cover, cleanup and takeaways. No entry was
dropped or added. No deviation from §5 was needed: the demo code's 8
numbered folders map one-to-one onto the brief's step numbering.

## Sources, with the date each was read

- 2026-03-25 CNCF, Istio ambient/multicluster announcement (used for the
  landscape slide and the "what this does not cover" slide)
- 2026-06-23 linkerd.io/blog, Announcing Linkerd 2.20 (chart-channel pin
  mentioned on the control-plane slide's notes)
- 2026-06-24 Google Cloud, The case for Envoy networking in the agentic AI
  era (used for the hook/pain framing)
- 2026-09-17 Buoyant / Service Mesh Academy, Happiness Guaranteed with gRPC
  & Linkerd (used for the hook/pain framing)
- 2026-09-25 Pulumi registry, `kubernetes.helm.v4.Chart` and
  `apiextensions.CustomResource` API docs, read this run to confirm resource
  names before putting them on slides
- 2026-09-25 linkerd.io docs, `AuthorizationPolicy` / `Server` /
  `MeshTLSAuthentication` reference pages, read this run for the same reason
- 2026-09-25 `zero-trust-networking-linkerd/README.md` and each numbered
  folder on this branch (commit `3e3b87c`), the direct source for every
  command and file path shown on a demo slide
- 2026-09-25 confirmed live: https://slack.pulumi.com and
  https://app.pulumi.com/signup both resolve and are Pulumi's current
  community links, before putting them behind QR codes

## Rules that still bind

- Every command on a demo slide is one the referenced numbered folder
  actually runs, with the same flags; none were invented for the deck.
- Speaker slide is a placeholder (`public/img/speaker-placeholder.png`,
  `TODO(presenter)` comment). Do not replace it with an invented name.
- `@pulumi/slidev-theme`'s `two-cols` layout takes named slots
  (`::header::` / `::left::` / `::right::`) and has no default slot; this
  deck does not use `two-cols` since no slide needed side-by-side columns.
- Diagrams are plain Mermaid source with no `themeVariables`; sizing is
  controlled only via `{scale: N}` on the fence.
- No em dash or en dash anywhere in `slides.md`, slide text or speaker
  notes; a no-slop pass was run over the whole file after the first
  drafting pass caught and fixed 30 instances (originally introduced in
  first-draft prose, all replaced with periods, commas, colons or
  semicolons depending on what the sentence needed).
