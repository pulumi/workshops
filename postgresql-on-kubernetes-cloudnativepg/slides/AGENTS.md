# Workshop deck plan: Running production PostgreSQL on Kubernetes with CloudNativePG and Pulumi

This file holds the story spine, the full headline-by-headline outline, the
fact-check log, and known trade-offs against the general skill guidance for
this deck. `slides.md` has been written, humanized, and fact-checked following
this plan.

Reference deck read for calibration: `pulumi/workshops/neo-in-a-docker-sandbox/slides/slides.md`
(48 slides). Frame already scaffolded via `deck_frame.py init` (see `frame.json` in
this directory); this plan covers only the STORY and DEMO marker regions.

## Story

**1. The moment.** GitLab, January 31, 2017. An engineer trying to manually rebuild
broken PostgreSQL replication ran a directory-wipe command against the primary
instead of the secondary, destroying about 300 GB of production data in seconds.
GitLab had five separate backup/replication mechanisms in place. None of them
worked when the team needed one. Verbatim quote (GitLab's own engineering blog,
read 2026-09-30): "Trying to restore the replication process, an engineer proceeds
to wipe the PostgreSQL database directory, errantly thinking they were doing so on
the secondary. Unfortunately this process was executed on the primary instead. The
engineer terminated the process a second or two after noticing their mistake, but
at this point around 300 GB of data had already been removed. Hoping they could
restore the database the engineers involved went to look for the database backups,
and asked for help on Slack. Unfortunately the process of both finding and using
backups failed completely." Source:
https://about.gitlab.com/blog/postmortem-of-database-outage-of-january-31/

**2. The tension.** "A Kubernetes Deployment heals itself." / "A database that
heals itself the same way can lose data doing it."

**3. Why it is hard.** A stateless pod is interchangeable: kill it, Kubernetes
reschedules it, nothing is lost. A Postgres primary is not interchangeable: kill
it, and whoever gets promoted next had better actually have every committed write.
The same gap shows up in ordinary operations, not just disasters: fix a
Deployment's YAML and it converges the moment you reapply it; a replica that has
already fallen behind does not converge the same way, it is just quietly wrong
until someone checks.

**4. The questions.**
1. What actually happens when the primary dies?
2. Is the standby really caught up, or just running?
3. Where do the backups live, and has anyone actually restored one?
4. Who runs the failover at 3am?
5. What does the operator do that a bare StatefulSet doesn't?
6. How do you get all of this from code instead of clicks?

**5. The answers, in presentation order.** Q5 (StatefulSet gap) is answered by
naming CloudNativePG as a Postgres-specific operator and its reconciliation loop.
Q6 (code instead of clicks) is answered by the Pulumi Kubernetes provider
installing the operator, CRDs and Cluster spec in one `pulumi up`, and by the same
program reconciling config changes onto the live cluster in place. Q2 (standby
caught up) is answered by the three-instance Cluster CR's synchronous replication
setting. Q3 (backups, restored one) is answered by the Barman Cloud Plugin's
continuous WAL archiving and by point-in-time recovery mechanics. Q4 (who runs
failover) is answered by CloudNativePG's automatic health-check-driven promotion.
Q1 (what happens when the primary dies) is deliberately left open through Act 2
and answered last, live, by the `04-failover` demo step (`kubectl cnpg promote`) —
a direct callback to the moment: the same category of event that destroyed 300 GB
at GitLab, this time witnessed, deliberate, and self-healing.

**6. The proof.** The demo brings up the platform and a real three-instance
cluster, shows synchronous replication is actually caught up, promotes a replica
live with one command, backs up to object storage, restores to a point in time,
and tears everything down clean. The failover step is what finally answers Q1 for
real, on stage, rather than as a described mechanism.

**Note on the brief's own outline.** Brief section 5 ("Slide outline") is a flat,
15-item table of contents with no moment, no tension, and no audience questions —
exactly the anti-pattern this skill warns against. None of its 15 topics were
dropped; they were redistributed into the six-part spine and the acts below.
Topics 1 (title/promise) and 15 (Q&A/resources) are carried by the pre-generated
opening and closing frame, not by this headline list. Topic 2 (the problem) became
the Act 1 tension and compare slides. Topic 3 (what CNPG is) became a Section A
claim; this plan deliberately does not assert a specific CNCF maturity tier, since
the brief itself hedges "sandbox/incubating" — confirm precisely at fact-check time
if a slide is going to name one. Topics 4-9 (Pulumi rationale and the five live
demo parts) became Section B's claims, the solution architecture slide, and the
seven Act 3 demo slides respectively. Topic 10 (reconciliation loop, backup/restore
internals) was folded into Section A and Section D claims rather than kept as a
separate no-live-demo diagram slide. Topic 11 (failure modes) became a Section E
claim. Topic 12 (bigger platform: Pooler, monitoring, multi-cluster) became a card
on the "where this breaks today" slide. Topic 13 (teardown) is the `07-teardown`
demo slide. Topic 14 (recap of learning outcomes) is served by the final recap-grid.

## Headlines

Pattern names are exactly the twenty confirmed via `deck_frame.py patterns`. Every
content-slide headline below is a claim, not a topic label. Frame slides (title,
speaker, housekeeping, agenda, demo divider, resources, continue-your-journey,
thank-you) are already generated and are not listed here.

### Act 1: the pain (6 slides)

- GitLab, January 31, 2017: an engineer wiped the primary Postgres directory instead of the secondary. Five backup mechanisms were in place. None of them worked. — pattern: quote-card
  - Card holds the verbatim quote (see Story §1) with three facts beside it: ~300 GB removed in seconds; five separate backup/replication mechanisms in place; zero worked when needed. Source line: about.gitlab.com/blog/postmortem-of-database-outage-of-january-31/, read 2026-09-30.
- A Kubernetes Deployment heals itself. — pattern: big-statement
- A database that heals itself the same way can lose data doing it. — pattern: big-statement
- Kill a stateless pod and Kubernetes reschedules it: nothing is lost. Kill a Postgres primary and whoever gets promoted next had better have every committed write. — pattern: compare
- A misconfigured Deployment converges the moment you fix the YAML. A replica that already fell behind doesn't converge, it's just wrong until someone checks. — pattern: compare
- Six questions stand between "it's running" and "I'd trust it at 3am." — pattern: card-grid
  - One card per question, in this order: (1) What actually happens when the primary dies? (2) Is the standby really caught up, or just running? (3) Where do the backups live, and has anyone actually restored one? (4) Who runs the failover at 3am? (5) What does the operator do that a bare StatefulSet doesn't? (6) How do you get all of this from code instead of clicks?

### Act 2: the tech (23 slides)

**Section A — what the operator does that a StatefulSet doesn't (Q5)**
- What does the operator do that a bare StatefulSet doesn't? — pattern: section-opener
- CloudNativePG is a Kubernetes operator built specifically to run Postgres, not a generic StatefulSet wrapper. — pattern: big-statement
- A StatefulSet keeps pods and storage stable; CloudNativePG's reconciliation loop decides who's primary and fixes it when that's wrong. — pattern: big-statement

**Section B — code instead of clicks (Q6)**
- How do you get all of this from code instead of clicks? — pattern: section-opener
- One `pulumi up` installs the operator, the CRDs, and a three-instance Cluster spec together. — pattern: big-statement
- Flip one config flag and Pulumi reconciles backups onto the same live cluster: no destroy, no recreate, no dropped connections. — pattern: big-statement
- The same declarative program that builds the cluster also tears it down; nothing lives only in a shell script someone has to remember to run. — pattern: big-statement

**Recap 1**
- Two questions answered, four to go. — pattern: recap-grid
  - Answered/highlighted: Q5, Q6. Muted/open: Q1, Q2, Q3, Q4.

**Section C — is the standby actually caught up (Q2)**
- Is the standby really caught up, or just running? — pattern: section-opener
- A three-instance Cluster is one declaration: one primary, two synchronous replicas. — pattern: big-statement
- Synchronous replication means the primary waits for a replica to confirm the write before it's considered committed. — pattern: big-statement
- Being "Running" isn't being caught up; you check replication lag before you trust a standby. — pattern: big-statement

**Section D — where backups live, has anyone restored one (Q3)**
- Where do the backups live, and has anyone actually restored one? — pattern: section-opener
- Continuous WAL archiving means the last committed transaction is already sitting in object storage. — pattern: big-statement
- The Barman Cloud Plugin ships every WAL segment to S3 as it's generated; backup is continuous, not a nightly job. — pattern: big-statement
- A point-in-time restore replays a base backup plus WAL up to the second you choose, not the second the backup finished. — pattern: big-statement

**Recap 2**
- Four questions answered, two to go. — pattern: recap-grid
  - Answered/highlighted: Q5, Q6, Q2, Q3. Muted/open: Q1, Q4.

**Section E — who runs failover at 3am (Q4)**
- Who runs the failover at 3am? — pattern: section-opener
- CloudNativePG promotes a replica on its own when the primary fails health checks: no page, no runbook to run by hand. — pattern: big-statement
- A crashed process is easy. The operator also watches for pod eviction, node loss, and a wedged primary that's still running but stuck. — pattern: big-statement
- Once the old primary recovers, the operator demotes it and rejoins it to the cluster as a replica. — pattern: big-statement

**Where this breaks today**
- This makes failover and backups routine. It doesn't make Kubernetes a full data platform. — pattern: card-grid
  - Three cards: (1) This demo declares the Cluster as a plain custom resource; Pulumi's newer typed-CRD path for this schema is still maturing. (2) CNPG's PVC reclaim policy can leave storage behind after teardown, so the demo verifies this explicitly rather than assuming it's clean. (3) One cluster isn't a platform: connection pooling, monitoring, and multi-region replication are the next layer, not covered here.

**Final recap (pre-demo)**
- Five questions answered, one to go. — pattern: recap-grid
  - Answered/highlighted: Q5, Q6, Q2, Q3, Q4. Muted/open: Q1 ("What actually happens when the primary dies?") — reserved for the demo.

### The solution we will build (1 slide)

- By the time we're done: one Pulumi program, a self-healing Postgres cluster, and backups that already work. — pattern: zones
  - Zones: (1) kind cluster with three namespaces (cert-manager, cnpg-system, cnpg-demo); (2) CNPG operator + Barman Cloud Plugin in cnpg-system; (3) three-instance Cluster (pg-demo) in cnpg-demo, one primary + two synchronous replicas; (4) S3 bucket via a Barman ObjectStore CR, reached through a least-privilege IAM identity scoped to that one bucket. No program-code slide: the architecture picture carries this section on its own.

### Act 3: the demo (8 slides)

- What we are going to do. — pattern: demo-overview
  - Seven outcomes, one per demo folder: (1) one apply builds the whole platform; (2) declaring a three-instance Cluster brings up a primary and two replicas; (3) checking that the replicas are actually caught up, not just running; (4) one command promotes a replica, live, with nothing else to touch; (5) an on-demand backup lands in object storage [presenter-only]; (6) a point-in-time restore rebuilds a second cluster at an exact moment [presenter-only]; (7) teardown that verifies nothing billable is left behind.
- One `pulumi up` builds the whole platform: a kind cluster, cert-manager, the operator, and the backup plugin. — pattern: demo-step
  - Folder: `01-platform`. Command: `cd 01-platform && npm install && pulumi up`. Watch for: `cnpg-system`, `cert-manager`, `cnpg-demo` namespaces present; operator pod `Running`.
- Declare a three-instance Cluster once, and the operator brings up a primary with two running replicas. — pattern: demo-outcome
  - Folder: `02-cluster`. Command: `cd ../02-cluster && npm install && pulumi up`. Watch for: `kubectl get cluster` shows healthy state, three pods running, one marked primary. Speaker note only: this same folder is revisited later with `backupsEnabled=true` to add backups in place; that second run is not shown as a separate slide.
- `cnpg status` shows more than "Running": it shows the replicas are actually caught up. — pattern: demo-checks
  - Folder: `03-replication`. Command: `./status.sh`. Watch for: streaming replication confirmed, per-replica lag near zero.
- One command promotes a replica and hands off writes; nothing else to touch afterward. — pattern: demo-outcome
  - Folder: `04-failover`. Command: `./failover.sh` (wraps `kubectl cnpg promote pg-demo 2`). This is a deliberate, graceful promotion, never a simulated crash. Watch for: replica 2 becomes primary within seconds, `cnpg status` confirms the new topology, no manual reconfiguration.
- A single command backs up the running cluster straight to object storage. — pattern: demo-step
  - Folder: `05-backup` [presenter-only]. Command: `./backup.sh`. Watch for: a new backup object appears in the S3 bucket.
- A point-in-time restore rebuilds a second cluster with exactly the data that existed at that moment, not one write more. — pattern: demo-outcome
  - Folder: `06-restore` [presenter-only]. Command: `cd ../06-restore && npm install && pulumi up`. Watch for: new cluster comes up; a row count matches the pre-restore state, not the post-restore state.
- Teardown doesn't just delete the cluster; it verifies nothing billable is left behind. — pattern: demo-checks
  - Folder: `07-teardown`. Command: `./teardown.sh && ./verify-clean.sh`. Watch for: kind cluster gone, no orphaned PVCs, no S3 objects remaining.

## Known trade-offs against the general skill guidance (flagged for reviewer)

- Act 2 runs to 23 slides, above the skill's generic "8-16" range. This was a
  deliberate choice to reach the 38-42 total the task set (so 8 demo slides stay
  under one quarter of the deck) while still giving each of the five learning
  outcomes real depth (2-3 claims per section) rather than one thin claim each.
- Only 3 recap-grids total (after Section B, after Section D, and the final
  pre-demo one) rather than a recap after every one of the five sections, to keep
  the slide count from growing further. The final pre-demo recap is the one the
  skill explicitly calls for ("Five questions answered, one to go"); the other two
  are placed at natural act-internal breaks (foundational pair, then depth pair).
- The optional "shape of the Pulumi Cluster CR" code slide was not included. The
  architecture slide alone was judged sufficient for this audience, and skipping it
  avoids introducing a slide pattern outside the confirmed twenty (`big-code` is a
  content treatment used inside `demo-step`, not a standalone top-level pattern).
  Reviewer: say if you want this slide added back; it would need its own pattern
  decision at build time.
- Section A intentionally does not assert a CNCF maturity tier for CloudNativePG,
  since the brief hedges "sandbox/incubating." Confirm the current status against
  cloudnative-pg.io or the CNCF landscape at fact-check time if this is wanted.

## Slide counts

- Act 1: 6
- Act 2: 23
- The solution we will build: 1
- Act 3 (demo): 8
- Total: 38
- Demo share: 8 / 38 = 21.1% (under one quarter)

## Fact-check

Every version pin, command, and the opening quote were verified against live
sources read on 2026-09-30, via four parallel fact-check passes plus one direct
check on CloudNativePG's CNCF status. Full raw sub-task reports are archived in
this session's scratchpad (not reproduced here); this is the claim-by-claim
outcome log.

| # | Claim | Source (read 2026-09-30) | Outcome |
|---|---|---|---|
| 1 | CloudNativePG Helm chart 0.29.1 installs operator app version 1.30.1 | `charts/cloudnative-pg/Chart.yaml` at tag `cloudnative-pg-v0.29.1`; CNPG GitHub releases (v1.30.1 marked Latest, released 2026-09-23) | Confirmed |
| 2 | Barman Cloud Plugin Helm chart 0.8.0 installs plugin app v0.15.0 | `charts/plugin-barman-cloud/Chart.yaml` at tag `plugin-barman-cloud-v0.8.0`; independently cross-checked on charts.stackradar.io | Confirmed |
| 3 | The Barman Cloud Plugin is the currently-supported backup path (native `barmanObjectStore` is deprecated) | `cloudnative-pg.io/docs/1.30/backup` (verbatim: native object storage "deprecated from 1.26 in favor of the Barman Cloud Plugin, but still the default for backward compatibility") | Confirmed, wording corrected — see below |
| 4 | cert-manager Helm chart pinned to 1.21.2 | cert-manager's published chart index / release notes | Confirmed |
| 5 | kind node image `kindest/node:v1.37.0` | kind `v0.33.0` release notes (defaults to this image/digest); live Docker Hub registry API query, digest match | Confirmed |
| 6 | Postgres container image `ghcr.io/cloudnative-pg/postgresql:17.6-standard-trixie` | `cloudnative-pg/postgres-containers` README (this is CNPG's own documented example of its recommended tag format); live GHCR registry API query | Confirmed |
| 7 | `@pulumi/pulumi ^3.265.0`, `@pulumi/kubernetes ^4.34.2`, `@pulumi/command ^1.2.1`, `@pulumi/aws ^7.48.0` | npm registry, live version queries | Confirmed |
| 8 | `kubectl cnpg status` shows per-instance/per-replica replication lag | CNPG kubectl plugin docs | Confirmed |
| 9 | `kubectl cnpg promote CLUSTER INSTANCE` promotes a replica; `kubectl cnpg backup` requests an on-demand physical backup | CNPG kubectl plugin docs, verbatim command descriptions | Confirmed |
| 10 | Opening quote and figures (GitLab, Jan 31 2017: ~300 GB removed, backup/replication mechanisms in place, none worked) | `about.gitlab.com/blog/postmortem-of-database-outage-of-january-31/` — the postmortem itself, not a summary | Confirmed, with one correction — see below |
| 11 | CloudNativePG is a CNCF project | Corroborated via CNCF Sandbox acceptance coverage (EDB's own engineering substack, a secondary trade write-up); not stated in these exact words on cloudnative-pg.io's own homepage | Confirmed (deck's hedge — "a CNCF project," no tier claimed — holds) |

**Correction made to the deck:** the GitLab postmortem, read in full this run,
names **four** backup/replication mechanisms that failed, not five. The "five"
figure comes from GitLab's own live incident Google Doc, linked from the
postmortem, which could not be independently loaded this run. Since the slide
cites the blog postmortem specifically, both occurrences (the card bullet and
the matching line in the speaker note) were corrected from "five" to "four" to
match what the cited source actually supports.

**Wording held as originally written, no slide change:** claim 3's plain
statement that the Barman Cloud Plugin is CNPG's supported backup path is
accurate and required no correction — the deck never claims the native
`barmanObjectStore` method stopped working, only that the plugin is the
current path, which matches the docs exactly.

10 of 11 claims required no change. 1 correction was made (four vs. five).
