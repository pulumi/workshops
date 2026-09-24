<!-- FOR AI AGENTS - Human readability is a side effect, not a goal -->
<!-- Last updated: 2026-09-24 -->

# AGENTS.md — the deck's brief and sources

Scope: this folder only. See `../AGENTS.md` for the workshop's own
conventions and `../../AGENTS.md` for the repo's.

## The workshop

Title: "Access governance as code: BigQuery, Secret Manager and
service-account bindings without console clicks". Audience: cloud platform
and security engineers, intermediate level. Length 60–90 minutes; this deck
is budgeted to 60:00 exactly, matching the convention on the last two
decks in this repo. Sessions, dates, event page and speakers are all
unknown — this workshop is unscheduled, and the deck says so with a
placeholder speaker slide rather than inventing a person.

## The original request

In order of authority:

1. The workshop brief document (`a421ffd0-3cc5-4840-8625-fa65d9eb8c16` in
   the workspace) — §1 facts (title, audience, length, promise), §5's
   fourteen-entry slide outline, §7 disclosure guidance, §8 sources.
2. The demo code in `../` (folders `01-`–`07-`), which is the actual
   contract for every command and resource name on a slide.
3. `pulumi.com/docs`, read 2026-09-24 for the policy-as-code naming (see
   Deviations below).

## Sources

| Source | Read | What it settled |
| --- | --- | --- |
| `pulumi.com/docs/discovery-governance/concepts/policy-as-code/` | 2026-09-24 | Current product name is "Pulumi Policies" / "policy as code"; `/docs/iac/packages-and-automation/crossguard/` now redirects here. "CrossGuard" appears nowhere in the current docs. |
| `pulumi.com/docs/iac/cli/commands/pulumi_preview/` and `pulumi_up/` | 2026-09-24 | `--policy-pack strings` flag confirmed, same flag on both commands. |
| `pulumi.com/docs/install/` | 2026-09-24 | Latest CLI 3.264.0; demo pins `pulumi>=3.263.0,<4.0.0`, slides follow the demo's pin, not the latest. |
| `../README.md` `## Sources` table | 2026-09-24 | Resource type names and casing for every demo step. |

## Deviations from §5

- §5 entries 10 and 11 say "CrossGuard policy pack". The deck says "policy
  pack" / "policy as code" throughout, matching current pulumi.com naming
  and this repo's own naming discipline (see `../AGENTS.md`).
- §5.3 asks for a slide built from internal Pulumi usage figures (dataset,
  secret, and service-account IAM binding growth rates and org counts) in
  a document marked Internal. The slide exists, in its place in the order,
  but the internal numbers are not on it — only the qualitative claim that
  fine-grained IAM bindings are a fast-growing resource category. A visible
  `TODO(presenter)` marks where the real figures would go, pending human
  clearance for a public repo. Flagged to the workshop owner in the pull
  request.
- One slide was added beyond the fourteen in §5: a `section` divider before
  the demo block, per the workshop-deck skill's fixed arc. Every other
  slide maps one-to-one to a §5 entry, in order.

## Rules that still bind

- Every command on a slide is one the demo actually runs, with the same
  flags — verified against `../01-bigquery-dataset/` through
  `../07-teardown/` while writing this deck.
- No `pulumi config set` on any slide: config ships pre-populated in each
  `Pulumi.dev.yaml`.
- The `serviceaccount.IAMMember` / `projects.IAMMember` casing trap (`IAM`,
  not `Iam`) gets its own slide note because it is the demo's best teaching
  moment and the easiest thing to typo.
- This session had no GCP or AWS credentials, so `pulumi up`, the live
  policy violation, and teardown were not run live. The 05-policy-pack
  pytest suite (15 tests) was run and passed. Slides 14–16 carry
  `TODO(presenter)` notes saying so instead of an invented captured output.
- Repo QR code points at this pull request, not `main`, since the folder
  does not exist on `main` until merge.

## Check before committing

```sh
npm run build
npm run export
```

Both were run for this deck: build passed in 8.3s, export produced
`slides-export.pdf` (19 slides). The PDF was rendered to PNGs and read back
at full size — diagram slide, both QR slides, the speaker placeholder, and
one code slide — before this AGENTS.md was written.
