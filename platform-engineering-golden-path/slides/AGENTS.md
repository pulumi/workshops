
# AGENTS.md — the deck's brief and sources

This file records what the deck was asked to be and which sources it was
built from, so anyone (human or agent) editing `slides.md` works from the
same brief. Conventions for the whole workshop folder are in `../AGENTS.md`.

## The workshop

"Building a Golden Path: Self-Service Infrastructure Platforms with Pulumi."
No session, date or speaker is confirmed as of this build (2026-09-24); the
speaker slide and the two closing-slide QR panels carry visible placeholders
until one is booked. Pulumi owns both the demo code and this deck.

## The original request

The deck was drafted from these inputs, in this order of authority:

1. The workshop brief, whose learning outcomes and slide outline are the
   spine of the deck:
   https://workprentice.ai/documents/6a6664fd-9cd7-4c00-b1b4-032f6911fa88
2. The pipeline's board card for this workshop, which carries the folder
   slug, the demo commit, and the pull request:
   https://github.com/pulumi/workshops/pull/231
3. The demo code in this same folder (`../01-component`, `../02-consume`,
   `../03-breaking-change`), read directly from the checkout rather than
   from memory, since the deck has to match it 1:1
4. The reference workshop, the style source of truth for folder layout and
   slide patterns (Slidev with `@pulumi/slidev-theme`, its cover/speaker/
   housekeeping/agenda slide patterns, `components/QRCode.vue`):
   https://github.com/pulumi/workshops/tree/main/neo-in-a-docker-sandbox
5. Pulumi component and registry docs, for facts about how components and
   the IDP Private Registry actually work — see "Sources" below

Structure asked for by the brief (90–120 minutes; this build's speaker-note
budgets sum to exactly 90, the bottom of that range, on the assumption that a
120-minute delivery spends its extra 30 minutes inside the live-demo blocks
rather than on additional slides):

- Title, speaker, housekeeping, agenda — 6 min
- The problem and what a golden path is (brief §5 slides 2–4) — 17 min
- Live demo section divider — 1 min
- Authoring, publishing and consuming the component (§5 slides 5–8) — 30 min
- Versioning, the breaking-change demo, and what it looks like at scale
  (§5 slides 9–11) — 21 min
- Teardown, recap, follow-up, Q&A (§5 slides 12–14 plus the closing frame)
  — 13 min

Total: 90 minutes across 19 slides with speaker notes (every content slide
carries a `[N min]` budget in its notes; the frame slides — title, speaker,
housekeeping, agenda — carry small budgets too, since a presenter speaks
through them).

## Deviations from the brief's §5 outline

The brief's §5 lists 14 slide topics against a hypothetical six-step demo.
The actual demo has three folders and five run steps (see `../README.md`),
so the slide-to-step mapping is not 1:1 everywhere:

- §5 #5 and #6 (interface, then implementation) both live in
  `01-component/`. Slide 5 shows the typed interface
  (`ComplianceWebServiceArgs` plus the constructor signature); slide 6 shows
  the constructor body's child resources plus the two commands that verify
  it (`npx tsc --noEmit`, `pulumi package get-schema .`).
- §5 #7 (publishing to the IDP Private Registry) shows the real
  `pulumi package publish` command side by side with the local-path
  `packages:` fallback this build actually used for every check. The slide
  and its notes say plainly that publish was never executed this session —
  see "Known gap" in `../AGENTS.md`.
- §5 #10 (the breaking-change scenario) covers both README run-steps 4 and 5
  (the v1 consumer failing against v2, then the same consumer fixed with
  `Pulumi.fixed.yaml`) on one slide, since both live in
  `03-breaking-change/` and are one continuous beat in the demo.
- §5 #14 (Q&A / where to find the code) becomes two closing slides per the
  workshop-deck skill: a "Stay connected" slide with three QR codes (Slack,
  Pulumi Cloud signup, the workshop repo), then a Q&A/thanks slide that
  stays on screen with the repo QR again.

Nothing else in §5 was skipped, reordered, or added to.

## Known gaps this deck does not paper over

Per `../AGENTS.md`, this session had no AWS credentials and no Pulumi Cloud
Pro/Enterprise org. Three things follow, and each is stated on the slide it
touches, not glossed over:

- The publishing slide shows the real `pulumi package publish` command and
  says it was not executed; the local-path fallback is what every other
  slide's commands actually resolved against.
- The consuming-team and breaking-change demo slides say `pulumi preview`
  stops at AWS credential validation (an expected result, not a defect) and
  that `pulumi up` was not run.
- The teardown slide says `pulumi destroy` was not run against real
  infrastructure in this build.

## Sources

Facts about Pulumi components and the registry come from the pages listed
under "Sources" in `../README.md` (all read 2026-09-22): the component
concepts page, the source-based component package guide, the
`PulumiPlugin.yaml` reference, the IDP Private Registry concepts page, and
the `pulumi package publish`/`pulumi package add` command references.
Nothing on this deck relies on a fact not present in that list or in the
demo code itself; no additional web sources were consulted while writing
slides.

## Rules that still bind

- Facts come from the sources above, not memory. An unclear doc becomes an
  open question in the pull request, never a guess.
- Every command shown on a slide is one the demo actually runs, with the
  same flags, except where a slide is explicit that the command was not run
  this session (the publish and live-deploy commands above).
- One idea per slide. At most six lines of body text per content slide.
  No code block longer than about a dozen lines; anything bigger becomes a
  diagram or a shortened excerpt with a pointer to the real file.
- No em dashes, no rule-of-three padding, no "let's dive in" framing — the
  no-slop skill was run over every slide and every note after the deck was
  drafted.
- Speakers are unconfirmed. The speaker slide and both closing-slide QR
  panels use `/img/speaker-placeholder.png` and a
  `<!-- TODO(presenter): ... -->` comment; do not invent a name, a bio, or a
  photo.
- Do not change the layouts already in use (`cover`, `section`, `default`,
  `two-cols` via a plain CSS grid, `code`, `diagram-left`, `diagram-right`,
  `statement`, `end`) without checking `npm run build` still passes.

## Check before committing

```bash
npm run build && npm run export          # both must pass
```

Read the exported PDF page by page for overflow, clipped diagrams, and
clipped QR codes (`<QRCode>` clips if it is not wrapped in a sized
container — wrap it in a `div` with explicit `w-*`/`h-*` classes).
