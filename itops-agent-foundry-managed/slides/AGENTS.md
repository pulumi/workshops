# AGENTS.md — the deck's brief and sources

This file records what the deck was asked to be and which sources it was
built from, so anyone (human or agent) editing `slides.md` works from the
same facts rather than re-deriving them.

## The workshop

"AI Agents for IT Ops: Managed Agent in Microsoft Foundry". First delivery
December 9, 2026; a second, undated regional delivery is already scheduled
against the same title. 75-90 minutes. Speakers: not yet assigned — every
speaker slide in `slides.md` is a marked placeholder.

## The original request

The deck was drafted from these inputs, in this order of authority:

1. The workshop brief (Workprentice document `7e747feb-5807-4231-9773-8723f2588fad`),
   whose §5 slide outline is the spine of the deck's middle section.
2. `pulumi/workshops/neo-in-a-docker-sandbox`, the reference workshop, for
   `slides/AGENTS.md` structure, `components/QRCode.vue`, and the dependency
   list in `package.json`.
3. This folder's own `README.md` and `AGENTS.md`, for the demo commands,
   architecture, and the honest state of Pulumi's Foundry support, since the
   deck must match what the demo actually runs, not what the brief assumed
   before the gap closed.
4. The `workshop-deck` and `slidev-deck` skills, for the fixed slide arc
   (title, speakers, housekeeping, agenda, hook, pain, solution, demo,
   follow-up, Q&A) and the named-layout mechanics.
5. Product-naming and pricing facts read live during this build (below).

The brief asked for 75-90 minutes; this deck takes the top of that range and
its speaker notes' time budgets sum to exactly 90 minutes.

## Sources added during the fact check

- learn.microsoft.com/en-us/azure/foundry/what-is-foundry — confirms
  "Microsoft Foundry" is the current product name (renamed from "Azure AI
  Foundry" at Ignite, November 18, 2025, effective January 1, 2026); read
  2026-09-24.
- azure.microsoft.com/en-us/pricing/details/foundry-agent-service/ and
  /ai-foundry-models/aoai/ — both render dollar figures client-side via
  JavaScript; a plain fetch returns structural placeholders ("$-") with no
  numbers. Read 2026-09-24. The GPT-4o figures on the cost slide
  ($2.50/1M input, $10.00/1M output) come from the demo's own README, dated
  the same day; Foundry Agent Service's own per-agent pricing is stated as
  unsourced on the cost slide rather than guessed.
- The demo folder's own `README.md` and `AGENTS.md` for the confirmed,
  closed feasibility gap (pulumi-azure-native#4354) and the pinned versions
  actually used in `requirements.txt` (`pulumi>=3.264.0,<4.0.0`,
  `pulumi-azure-native==3.28.0`).
- Terminology: Microsoft Foundry (or Foundry), Pulumi Neo, Pulumi ESC,
  Pulumi Cloud, Pulumi IaC, Pulumi console (lowercase). Never "Copilot",
  "Pulumi Service", "Insights", or "CrossGuard".

## Rules that still bind

- Every command on a slide is one the demo actually runs, with the same
  flags — checked slide by slide against `README.md`'s "Run the demo"
  section after that section's own bug (wrong config namespace, missing
  `accountName`/`projectName`) was fixed in this same build.
- Facts about Pulumi and Azure product behavior come from what was read
  during this build, not from the brief's September snapshot, since the
  brief itself flagged that the feasibility gap might close before delivery.
  It did close; the deck says so plainly rather than repeating the brief's
  caution as if it still applied.
- Placeholder speaker material stays marked as a placeholder
  (`<!-- TODO(presenter): ... -->`); no invented name, photo, or bio.
- Speaker notes on every content slide, each carrying a time budget, and the
  budgets sum to the deck's stated length (90 minutes here).
- No em dashes, no promotional adjectives, no rule-of-three padding — the
  no-slop pass covers this; see the entry below.

## Changes after the brief

- **§5.4 kept, reframed.** The brief's slide 4 ("current state of Pulumi
  support... this slide only needed if the gap has not closed") is kept even
  though the gap closed, because the feasibility story — a real, tracked
  issue that closed inside the three-month runway — is itself worth telling
  on stage, and because it draws the honest line between what Pulumi
  provisions (the account, project, deployment, agent registration) and
  what the SDK does (the agent's actual behavior). This is not the brief's
  fallback path; no manual portal step was needed anywhere in this demo.
- **Demo commands corrected before the deck was written**, not just quoted
  as given: `README.md`'s `pulumi config set` calls for
  `02-create-agent` and `03-tool-connection` used the wrong config namespace
  and never set the required `accountName`/`projectName` keys, which would
  have made `pulumi up` fail immediately. Fixed in this same pull request
  (commit `92c1ce4`) before any slide command was written, so the slide and
  the demo match exactly.
- **Cost slide states an unsourced number as unsourced** rather than
  guessing at Foundry Agent Service's own per-agent pricing, since a plain
  page fetch returned no digits (see Sources, above).

## Check before committing

```bash
npm run build && npm run export
```

Both must pass. Read the exported PDF page by page (render to images and
look) for clipped diagrams, overflowing code blocks, and orphaned headings —
particularly the Mermaid diagram slide, which is the one most likely to
need its `{scale: ...}` adjusted.
