# AGENTS.md: the deck's brief and sources

## The workshop

Title: Fine-grained authorization as code, OpenFGA relationship-based
access control with Pulumi. Length: 90 minutes. No session is scheduled;
speakers are unknown, so the speaker slide is a placeholder. This deck was
built from the demo folders in the parent directory (`01-stack/`,
`02-checks/`, `03-teardown/`), which were built first, in a separate run.

## The original request

In order of authority:

1. The workshop brief (topic, audience, learning outcomes, demo steps,
   §5 slide outline, prerequisites, risks, sources): read from the internal
   planning document during this run.
2. The demo code and its `README.md` on this branch
   (`fine-grained-authorization-openfga/`), which is the ground truth for
   every command shown on a slide.
3. The `workshop-deck` and `slidev-deck` skills, for the fixed opening/
   closing arc and the theme's layout mechanics.
4. The reference deck, `neo-in-a-docker-sandbox/slides/`, for what a
   finished deck in this theme looks like.

## Structure asked for

The brief's §5 outline, in order, with the minute budget assigned to each
slide in this deck:

| Slide | §5 ref | Minutes |
|---|---|---|
| Cover | 1 | 1 |
| Speaker (placeholder) | 2 | 2 |
| Housekeeping | 3 | 1 |
| Agenda | 4 | 2 |
| Prerequisites | §6 (added) | 2 |
| The hook | 5 | 3 |
| The pain | 6 | 5 |
| Why now | 7 | 4 |
| The tuple is the whole model | 8 | 7 |
| Architecture for this demo | 9 | 6 |
| Live demo divider | 10 | 1 |
| Steps 1-4: bring up the stack | 10 | 19 |
| Steps 5-7: deny, diff, allow | 11 | 20 |
| Step 8: teardown and verify | 12 | 7 |
| What you built | 13 | 4 |
| Beyond this workshop | 14 | 3 |
| Follow-up | 15a | 1 |
| Q&A / Thanks | 15b | 2 |

Total: 90 minutes, matching §1's length exactly.

## Sources

All read 2026-09-26, same as the brief:

- KubeCon EU 2026, Tetrate and Okta, fine-grained authorization at the
  Envoy Gateway level with OpenFGA (2026-03-26):
  https://kccnceu2026.sched.com/event/2CW6G/tailor-made-dynamic-fine-grained-authorization-for-api-traffic-erica-hughberg-tetrate-andres-aguiar-okta
- Arcade.dev, OpenFGA formalizing AI agents as first-class principals
  (2026-06-23)
- JAVAPRO, OpenFeature (2026-05-14)
- Debezium, Keycloak SSO (2026-08-27)
- NetEye, OIDC (2026-03-31)

Product documentation consulted while writing this deck, also read
2026-09-26:

- https://openfga.dev/docs/configuration-language: schema 1.1 syntax for
  types, relations, and computed relations (used on the tuple-model
  slides).
- https://openfga.dev/docs/modeling/agents/agents-as-principals: confirms
  agents are modeled as a distinct type from users, which is what the demo
  and the "agents as principals" slide both do.
- https://www.pulumi.com/docs/iac/concepts/providers/dynamic-providers/:
  the canonical URL for dynamic providers; the brief's
  `/concepts/resources/dynamic-providers/` path 404s and redirects here.

## Deviations from §5

- §5's final entry ("Q&A / follow-up") is built as two slides: a follow-up
  slide with three QR codes, then a Q&A/Thanks slide. The fixed workshop
  frame from the `workshop-deck` skill ends with both, and they serve
  different moments (handout links vs. the slide left on screen during
  questions).
- A prerequisites slide was added right after the agenda, not in §5. The
  brief's §6 says participants follow along, and a follow-along demo
  needs a slide telling them what to have ready before the terminal
  starts.
- The "this workshop's repo" QR on the follow-up slide points at
  https://github.com/pulumi/workshops/pull/241, not the `main` branch
  folder URL. The `main` URL 404s until this branch merges (checked
  2026-09-26). Swap it for the folder URL once the PR merges.
- The cover slide's title is split into a title and a subtitle rather than
  one line joined by a dash, to avoid an em dash on the first slide anyone
  sees.

## Rules that still bind

- Every command on a slide is one the demo actually runs, with the same
  flags: `docker pull`, `pulumi stack init dev`, `pulumi up --yes`,
  `./check.sh <user> <relation> <object>`, `pulumi destroy --yes`,
  `./verify-teardown.sh`. Cross-check against `README.md` before adding or
  changing a command slide.
- Facts about OpenFGA and Pulumi come from the docs listed above, read
  during this run, not from memory. If a doc is unclear, it becomes an
  open question in the pull request rather than a guess on a slide.
- No invented speaker. The speaker slide stays a placeholder until a real
  speaker is assigned.
- Never call the store a "database" or a tuple a "row" (same rule as the
  parent `AGENTS.md`). Never say Pulumi Neo, ESC, or policy as code; none
  of them are used in this workshop.

## Check before committing

1. `npm run build`. Must pass.
2. `npm run export`. Must pass. This workstation needed
   `--wait-until networkidle --wait 1500` to get past a stale first-render
   PDF; plain `slidev export` produced a 4.6&nbsp;KB PDF with visibly blank
   pages once rendered to PNG.
3. Render every exported page to PNG and look at it. This caught two real
   bugs on 2026-09-26: the `two-cols` slide's left column was blank
   (the theme's `two-cols` has no default slot, only `::left::`/`::right::`),
   and the first Mermaid diagram rendered too small at `{scale: 0.9}` in a
   two-column layout and needed `{scale: 2.2}`.
4. Sum the minute budgets in `slides.md` and confirm they total 90.
5. Confirm all 15 of §5's entries map to a slide, in order (see table
   above).
6. Grep every command shown against the demo's actual `README.md` and
   scripts.
7. Count distinct `layout:` values; this deck uses 9.
8. Run the no-slop pass, then grep for `—` and `–` across the whole file;
   both must return zero.
