\
# Slides: Running production PostgreSQL on Kubernetes with CloudNativePG and Pulumi

Folder-wide conventions live in `../AGENTS.md`. This file covers the slides only.

## Workshop

- Title: Running production PostgreSQL on Kubernetes with CloudNativePG and Pulumi
- Session: 2026-11-18, one date, 90 minutes, hands-on (participants follow along on
  their own kind cluster for steps 1-4 and 7; the backup and restore steps, 5 and 6,
  are presenter-only — see "Deviations" below for why)
- Speakers: unknown at build time. One placeholder speaker slide stands in; replace
  photo, name, role, socials and bio before delivery (`public/img/speaker-placeholder.png`)
- Owner: Compass decides the curriculum; Anvil (this build) turns the brief into
  demo code and slides; a marketing agent picks up promotion after this card closes

## The original request

In order of authority:

1. [Workshop brief: Running production PostgreSQL on Kubernetes with CloudNativePG and Pulumi](/documents/3bcc1bfe-c8f7-4ea6-9c18-625ab4dc02b4) — the contract for this build
2. The reference workshop, `pulumi/workshops/neo-in-a-docker-sandbox`, for story and mechanics
3. The `workshop-deck`, `slidev-deck`, `slidev`, `presentation-design`, `humanizer` and
   `fact-check` skills

## Story

1. **The moment.** GitLab.com, January 31 2017. An engineer trying to fix PostgreSQL
   replication lag meant to wipe the data directory on the secondary and re-sync it.
   He ran the wipe on the primary instead, and stopped a second or two after noticing,
   by which point roughly 300 GB of production data was already gone. From GitLab's own
   postmortem: "Hoping they could restore the database the engineers involved went to
   look for the database backups, and asked for help on Slack. Unfortunately the process
   of both finding and using backups failed completely." ([GitLab, "Postmortem of database
   outage of January 31"](https://about.gitlab.com/blog/2017/02/10/postmortem-of-database-outage-of-january-31/),
   published 2017-02-10, read 2026-09-29.) This predates Kubernetes-hosted Postgres at
   this scale and is used honestly as what manual replication and backup operations look
   like under pressure, on any infrastructure, not as a claim that it happened on Kubernetes.
2. **The tension.** A bad deploy: revert in seconds. A wiped database: gone in seconds,
   restored in hours, if the backups even work.
3. **Why it is hard.** A StatefulSet keeps a pod numbered. It has no idea which pod holds
   the primary, whether replication is caught up, or what to do when the primary
   disappears. That judgment lived in an engineer's head, at whatever hour the primary
   happened to die.
4. **The questions.**
   1. What does a StatefulSet not know about running Postgres?
   2. How do you stand up the whole platform with one command?
   3. How do you know replication is healthy without watching it yourself?
   4. What happens the moment the primary goes away?
   5. How do you get back to the second before the mistake?
5. **The answers.** Q1: the CNPG `Cluster` custom resource, which tracks primary,
   replicas and switchover as first-class state. Q2: one Pulumi program and one
   `pulumi up`, provisioning the kind cluster, cert-manager, the CNPG operator and the
   Barman Cloud Plugin together. Q3: the CNPG plugin's status output, read from a
   script instead of a manual query. Q4: CNPG's automatic promotion. Q5: the Barman
   Cloud Plugin's continuous WAL archiving to object storage, restored point-in-time
   into a second `Cluster`.
6. **The proof.** The demo builds a real three-instance cluster, shows its replication
   status, fails it over live, and (presenter-only) backs it up and restores it to a
   point in time before tearing everything down. The restore step answers the fifth and
   final question.

## Structure and minute budget (target 90 minutes total)

| Section | Slides | Minutes |
|---|---|---|
| Frame (title, speaker, housekeeping, agenda, prerequisites) | 5 | 6 |
| Act 1 — the pain | 5 | 10 |
| Act 2 — the tech | 12 | 30 |
| The solution we will build | 2 | 6 |
| Act 3 — the demo | 9 | 30 |
| Close | 4 | 8 |

Total: 37 slides, 90 minutes. Act 3 is 9 of 37 slides (24%), under the quarter-deck limit.

## Headlines

Layout is noted after each slide. Read top to bottom as the talk.

**Frame**
1. `cover` — Running production PostgreSQL on Kubernetes with CloudNativePG and Pulumi
2. `default` — speaker placeholder (TODO before delivery)
3. `default` — housekeeping
4. `default` — agenda
5. `default` — prerequisites (kind, kubectl, Pulumi CLI >= 3.255, Node >= 20; steps 5-6 presenter-only)

**Act 1 — the pain**
6. `quote` — GitLab's own postmortem: backups failed when they were needed
7. `statement` — a bad deploy reverts in seconds
8. `statement` — a wiped database comes back in hours, if the backups work at all
9. `two-cols` — a StatefulSet keeps a pod numbered, not a database healthy
10. `default` — the five questions

**Act 2 — the tech**
11. `section` — Q1: what a StatefulSet doesn't know
12. `two-cols` — Kubernetes restarts pod-0 as pod-0; CNPG's Cluster tracks role and switchover
13. `section` — Q2: one command, the whole platform
14. `diagram-left` — one `pulumi up` provisions the cluster, cert-manager, the operator and the backup plugin
15. `default` — progress: 2 of 5 answered
16. `section` — Q3: replication you don't have to watch
17. `diagram` — a three-instance Cluster CR keeps one primary and two streaming replicas in sync
18. `section` — Q4: when the primary goes away
19. `diagram-right` — CNPG promotes a replica automatically
20. `default` — progress: 4 of 5 answered
21. `section` — Q5: getting the data back
22. `diagram-left` — continuous WAL archiving to object storage turns restore into a config, not a scramble

**The solution we will build**
23. `diagram` — everything the demo builds, in one picture
24. `code` — the Cluster is three instances and a plugin reference, declared once (<=10 lines)

**Act 3 — the demo**
25. `section` — let's run it
26. `two-cols` — what we are going to do (7 steps, 4 hands-on + 2 presenter-only + 1 hands-on teardown)
27. `default` — step 1, `01-platform/`: one `pulumi up` builds the platform
28. `default` — step 2, `02-cluster/`: the Cluster CR goes in, three Postgres pods come up
29. `default` — step 3, `03-replication/`: replication status is one script away
30. `default` — step 4, `04-failover/`: a graceful promotion, not a simulated crash
31. `default` — step 5, `05-backup/` (presenter-only): an on-demand backup lands in the bucket
32. `default` — step 6, `06-restore/` (presenter-only): PITR restore rehydrates a second cluster
33. `default` — step 7, `07-teardown/`: teardown reverses cleanly, no orphaned volumes

**Close**
34. `default` — the five questions, answered
35. `two-cols` — where this breaks today (real limitations)
36. `default` — resources and follow-up (QR: Slack, Pulumi Cloud signup, workshops repo)
37. `end` — thanks / Q&A

## Sources (re-read this run, 2026-09-29)

- GitLab, "Postmortem of database outage of January 31" — https://about.gitlab.com/blog/2017/02/10/postmortem-of-database-outage-of-january-31/ (published 2017-02-10; opening moment)
- CloudNativePG v1.30.1 release notes — https://github.com/cloudnative-pg/cloudnative-pg/releases (shipped 2026-09-23; re-verify version claim before delivery)
- Pulumi blog, "Kubernetes CRDs as provider extensions" — https://www.pulumi.com/blog/kubernetes-crds-as-provider-extensions/ (Pulumi Kubernetes provider v4.34.0, 2026-08-28; mentioned as the newer typed-CRD alternative, not what this demo uses)
- Pulumi Kubernetes provider docs — https://www.pulumi.com/registry/packages/kubernetes/ (resource and CustomResource reference)
- CloudNativePG documentation — https://cloudnative-pg.io/documentation/current/ (Cluster CR, plugin architecture, failover behavior)

## Deviations from the brief's §5 outline

The brief's §5 sketches a flat, 15-slide outline ending in a run of demo steps. This
deck restructures it into the three-act, questions-driven shape the workshop-deck
skill requires; every §5 topic lands somewhere:

- §5.1 (title/promise) → frame slide 1
- §5.2 (the problem) → Act 1, slides 6-10
- §5.3 (what CNPG is) → Act 2, Q1 section (slides 11-12)
- §5.4 (why Pulumi, architecture) → Act 2, Q2 section (slides 13-14) and the solution
  slides (23-24)
- §5.5-9 (live demo parts 1-5) → Act 3, mapped one-to-one onto the seven numbered demo
  folders rather than five brief-level "parts"
- §5.10 (under the hood: reconciliation, backup/restore internals) → folded into the
  Act 2 Q3 and Q5 claim slides (17, 22) rather than a separate slide, to stay inside
  the code/slide budget
- §5.11 (production failure modes) → the "where this breaks today" close slide (35)
- §5.12 (the bigger platform: Pooler/PgBouncer, monitoring, multi-cluster) → mentioned
  in the speaker note on slide 35 only, not demoed, per the brief
- §5.13 (teardown live) → Act 3 step 7 (slide 33)
- §5.14 (recap) → close slide 34
- §5.15 (Q&A/further reading) → close slides 36-37

Brief §1 names CRDs-as-provider-extensions (typed CRDs) as the capability on display.
The demo code uses the untyped `k8s.apiextensions.CustomResource` instead, per the §7
risk that CNPG's CRD schema may not be fully covered by the typed path. The slides
follow the demo: the solution-slide code shows the untyped form, and the typed
alternative is mentioned once, in a speaker note on slide 14, as the newer option.

## Rules that still bind

- Program code appears on one slide only (24), 10 lines at most.
- Every demo slide (27-33) carries exactly one command, at most 3 lines, copied from
  the folder with the same flags the demo actually uses.
- Total code and commands in the deck, Mermaid excluded: tracked below and stated in
  the pull request as an actual count, not the target.
- Nothing on these slides claims a verified end-to-end run. No kubectl, docker, kind
  or AWS access was available on the build workstation for the slides pass, same as
  the demo-code pass.
- Speaker slide is a placeholder; say so on the slide and in the pull request.
- The workshops repo QR on slides 36-37 points at the repo root, not the
  `<slug>` folder, because that URL 404s until this PR merges; the speaker note names
  the folder to open verbally.

## marketing-web skill provenance

Read `pulumi/marketing-web` at `.agents/skills/slidev-deck/SKILL.md`, commit
`9b37f9afe8c7b0d406f19bc9116b16d5689389ce` (path's latest commit as of 2026-09-29).
It confirms the standard scaffold flow (install `@pulumi/slidev-theme` from npm, copy
`starter.md`); this pipeline's own `slidev-deck` skill already documents where this
pipeline differs (npm not pnpm, deck committed under `<slug>/slides/`, not
gitignored).

## Fact-check

Every claim below was checked against a source read during this run (2026-09-29), separately from and after the humanizer pass.

| Claim | Source | Read | Outcome |
|---|---|---|---|
| Opening quote: an engineer wiped the primary's data directory meaning to wipe the secondary's, and stopped it a second or two after noticing, by which point about 300 GB was gone; every backup method then failed | GitLab, "Postmortem of database outage of January 31" — about.gitlab.com/blog/2017/02/10/postmortem-of-database-outage-of-january-31/ | 2026-09-29 | Confirmed. Fetched the live page this run; the "around 300 GB of data had already been removed" sentence and the backup-failure sentence that follows it match the slide 6 speaker note and quote verbatim. |
| CNPG v1.30.1 is the current release | github.com/cloudnative-pg/cloudnative-pg/releases | 2026-09-29 | Confirmed. v1.30.1 is the top release, tagged 2026-09-23T13:40:11Z. The brief's claimed ship date (2026-09-23) is correct; this deck does not put the version number on a slide, only in this log. |
| Pulumi Kubernetes v4.34.0 added CRDs-as-provider-extensions | pulumi.com/blog/kubernetes-crds-as-provider-extensions/ | 2026-09-29 | Confirmed. Post title "Pulumi Kubernetes v4.34.0: CRDs as provider extensions," dated Aug 28, 2026. Referenced once, in the slide 14 speaker note, as the newer typed-CRD alternative the demo does not use (see Deviations, above). |
| CloudNativePG is a CNCF Sandbox project | github.com/cloudnative-pg/cloudnative-pg (README, "We are a Cloud Native Computing Foundation Sandbox project") | 2026-09-29 | Confirmed via three independent mirrors of the same README text (libraries.io, awesome.ecosyste.ms, a GitHub codeshare mirror updated 2026-08-19). The project's own cloudnative-pg.io homepage does not use the word CNCF anywhere, only generic "a Series of LF Projects, LLC" copyright language, so the homepage alone would not have confirmed this; the GitHub README is the source that does. Slide 12's speaker note says "sandbox," never "incubating" — a secondary source (a Medium post) claimed CloudNativePG had progressed to CNCF incubating status, but no primary source found this run supports that, so the deck does not make that claim. |
| Demo commands and folder names on every Act 3 slide | `postgresql-on-kubernetes-cloudnativepg/{01-platform,02-cluster,03-replication,04-failover,05-backup,06-restore,07-teardown}/` in this same branch | 2026-09-29 | Confirmed by reading each folder's actual script and `package.json` this run; every command shown (`npm install && pulumi up`, `./status.sh`, `./failover.sh`, `./backup.sh`, `./teardown.sh && ./verify-clean.sh`) is the one the folder runs, with the same flags. The demo code was not executed end to end on the build workstation (no kubectl/docker/kind/AWS available there), so this deck does not claim a verified live run, only that the commands match the code.
