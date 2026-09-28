## The workshop

Title: Storage and Caching as Code: Longhorn and Dragonfly on Kubernetes with Pulumi
Sessions: unknown, not yet scheduled
Dates: unknown
Length: 90 minutes (55 minutes guided build, 20 minutes failover/resilience, 15 minutes Q&A buffer)
Speakers: unknown; this deck ships with one placeholder speaker slide
Demo owner: this folder's `01-cluster` through `07-cache-client` projects, built on the same branch

## The original request

In order of authority:

1. Workshop brief: https://workprentice.ai/documents/77197ff0-dd86-49ef-b7c2-ec8b8a4df763
2. `workshop-deck` skill (the fixed slide arc: title, speakers, housekeeping, agenda, hook, pain, solution, demo, follow-up, Q&A)
3. `slidev-deck` skill (theme mechanics: layouts, Mermaid, verification)
4. The reference deck, `neo-in-a-docker-sandbox/slides/`, read before writing anything here

## Structure and minute budget

| Slides | Section | Minutes |
| --- | --- | --- |
| 1-15, 17, 18 | Frame + hook + pain + solution + prerequisites + demo steps 01-04, 06, 07 | 55 |
| 16 | 05-failover-drill (centerpiece) | 20 |
| 19-25 | Comparison, pitfalls, recap, Monday, follow-up, Q&A | 15 |

Total: 90 minutes, matching the brief's 55/20/15 split exactly. Every content
slide carries a speaker note with its own time budget; they sum to 90.

## Deviation from the brief's §5 slide outline

The brief's §5 pairs two demo folders per bullet (steps 6-7 as one bullet,
8-9 as another). This deck gives each of the seven numbered demo folders its
own slide instead, so every folder that exists on disk is shown once, in
order, with its own command and verification step. Nine bullets in §5's
outline become eleven slides (section divider + 7 folder slides + the "now
we break it" beat + the drill). This is the only departure from the brief's
slide-by-slide outline; the content and order otherwise follow it.

## Sources, with the date each was read

- InfoQ, "CNCF Graduates Dragonfly, Marking Major Milestone for P2P
  Distribution" — read 2026-03-01
- Last Week in Cloud Native newsletter, week 34 2026 (CubeFS v3.6.0 release
  note, 2026-08-17) — read 2026-08-17
- OneUptime, Longhorn tutorial — read 2026-01-25
- KubeCon NA 2026 program (storage/caching theme present across roughly 10
  of 415 sessions; theme-level signal only, no session-level claim made) —
  read 2026-09-28
- `github.com/pulumi/workshops` repository tree — read 2026-09-28
- Pulumi documentation, read this run for the two product facts this deck
  states as fact: the Kubernetes provider's Helm chart resource
  (`helm.v4.Chart`, https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v4/chart/)
  and `pulumi.StackReference` for chaining the seven demo projects — read
  2026-09-28

An internal aggregate signal (Pulumi resource usage, not externally
verifiable) also informed the original topic proposal. It is not cited on
any slide or in the public pull request; it is named here only for this
deck's own record.

## Rules that still bind

- Every command on a slide is copied verbatim, flags included, from the
  matching numbered folder in this workshop. No slide shows a command the
  demo does not run.
- No slide code block exceeds about eight lines; a longer program is a
  diagram or a described mechanism instead.
- The demo has been verified offline only: `npm install` and `tsc --noEmit`
  clean across all six TypeScript projects, `pulumi preview` render checks,
  and `shellcheck` on the failover drill's bash. There is no `docker`,
  `kind`, `kubectl`, `helm`, or `redis-cli` on this build workstation, so no
  live cluster ever ran and the failover drill was never rehearsed against
  a real node drain. The slide notes for 01-cluster through 07-cache-client
  and for the failover drill say this plainly; they do not claim a live run
  that did not happen.
- Speaker photo, name, role, socials and bio on slide 2 are placeholders.
  Replace them before this workshop is ever delivered.
- QR targets (`slack.pulumi.com`, `app.pulumi.com/signup`, and the repo URL)
  were each confirmed reachable during this run, 2026-09-28. The repo QR
  points at the pull request until this branch merges to `main`; swap it
  for the tree URL once it has.
