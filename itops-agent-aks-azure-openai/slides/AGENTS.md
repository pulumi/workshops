# AGENTS.md — the deck's brief and sources

This file records the deck's brief and sources so any editor working on
`slides.md` starts from the same context. Folder-wide conventions (demo code
style, teardown discipline, credential handling) live in the parent
`../AGENTS.md`; this file is scoped to the slide deck only.

## The workshop

"AI Agents for IT Ops: Custom Agent on AKS with Azure OpenAI." Ninety
minutes, intermediate level (basic Kubernetes and Azure familiarity assumed,
no prior Pulumi experience required). Two sessions on the calendar: 2026-09-23
(Notion page `3a5fdbdf-1cce-8102-8856-effd38fff249`) and an undated second
regional delivery (Notion page `3a5fdbdf-1cce-8158-8958-c4707b8a9951`).
Speakers are not yet named; the deck ships with an obvious placeholder speaker
slide and closing QR code, both marked `TODO(presenter)`.

## The original request

Sources, in order of authority:

1. The workshop brief (https://workprentice.ai/documents/906ca05e-04b4-4a30-876d-09640a805b31),
   which supplies the title, promise, learning outcomes, demo plan, slide
   outline (§5), prerequisites (§6), risks (§7) and sourced facts (§8).
2. The reference workshop, `pulumi/workshops/neo-in-a-docker-sandbox`, for
   frame-slide content patterns: the speaker-slide markup, housekeeping,
   agenda, and the `components/QRCode.vue` component. Its `slides.md` uses
   only `cover`/`image`/`default` layouts and carries no speaker notes at all,
   so it is not a model for layout variety or note-writing; those come from
   the `slidev-deck` and `workshop-deck` skills instead.
3. The demo code under `itops-agent-aks-azure-openai/01` through `06`, read
   directly from this checkout, for every command, config key, and code
   snippet shown on a slide.
4. The `slidev-deck` and `workshop-deck` skills for scaffold, layout choice,
   and the fixed slide arc.

## Structure asked for

The brief's §5 slide outline has 14 entries; the `workshop-deck` skill wraps
those in a fixed frame (title, speaker, housekeeping, agenda, live-demo
section divider, follow-up, Q&A). The deck ships 20 slides in total.
Speaker notes are required on every content slide, each carrying a time
budget, and the budgets must sum to the brief's 90-minute length. This deck's
notes sum to exactly 90 minutes across 20 slides.

## Sources with read dates

From the brief's §8, all read 2026-09-22 unless noted:

- Pulumi registry: `azure-native.containerservice.ManagedCluster` — current, stable.
- Pulumi registry: `azure-native.cognitiveservices.Account` and `.Deployment` — current, stable.
- pulumi.com/docs — Kubernetes provider, provider-of-provider pattern for AKS.
- azure.microsoft.com/pricing/details/kubernetes-service — AKS node pricing.
- azure.microsoft.com/pricing/details/cognitive-services/openai-service — GPT-4o token pricing.
- Azure docs — AKS OIDC issuer and workload identity feature pages.
- Azure docs — Cognitive Services soft-delete and purge behavior.
- The workshop brief itself, read 2026-09-23.
- The demo code in this checkout (`01-empty-program` through `06-teardown`), read 2026-09-23.

## Deviations from the brief

1. The brief's §5 item 14, "Q&A / where to find the code," is split into two
   slides ("Where to go next" and "Q&A / Thanks") because the `workshop-deck`
   skill's fixed arc treats follow-up links and the closing Q&A slide as
   separate, and the closing slide is the one that stays on screen during
   questions.
2. The brief's §5 item 13 says "recap of the three learning outcomes," but
   §3 lists four. The recap slide carries all four, since all four are true
   of what the session actually demonstrates.
3. Frame slides not present in §5 (speaker, housekeeping, agenda, the
   live-demo section divider) come from the `workshop-deck` skill's fixed
   arc, not from the brief.
4. A "Before we start" prerequisites slide was added on the strength of §6
   (participant prerequisites), since the audience follows along live.
5. Speaker identity is unknown at build time. The speaker slide and the
   closing Q&A slide both carry an obvious placeholder image and a
   `TODO(presenter)` HTML comment rather than an invented name or bio.
6. The closing "Where to go next" slide points its repo QR code at this
   pull request rather than a `tree/main/...` URL, because the
   `itops-agent-aks-azure-openai` folder is not on `main` yet. Update it to
   the tree URL once the pull request merges.

## Rules that still bind

- Every command shown on a slide is one the demo actually runs, with the same
  flags — verified slide by slide against the six numbered folders.
- No em dashes or en dashes anywhere in `slides.md`, including inside speaker
  notes.
- `mermaid` is a direct dependency in `package.json`, not just a theme
  devDependency, since Slidev does not bundle it.
- Never invent a speaker name, photo, or bio. Use the placeholder pattern
  above and say so in the pull request.
