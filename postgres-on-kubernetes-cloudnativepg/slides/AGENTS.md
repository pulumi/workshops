# AGENTS.md: the deck's brief and sources

This file records what the deck was asked to be and which sources it was
built from, so anyone (human or agent) editing `slides.md` works from the
same brief. Conventions for the whole workshop folder are in `../AGENTS.md`.

## The workshop

"Running production PostgreSQL on Kubernetes with CloudNativePG and Pulumi".
Committed Notion slot: 2026-11-18, 90 minutes. Speakers not yet assigned;
the deck uses a placeholder speaker slide (photo, name, role) pending
confirmation. No public event page exists yet.

## The original request

The deck was drafted from these inputs, in order of authority:

1. The workshop brief, whose §5 slide outline and §1 promise are the spine
   of the deck: https://workprentice.ai/documents/3bcc1bfe-c8f7-4ea6-9c18-625ab4dc02b4
2. The board card for this workshop (folder path, demo build status, PR
   link), internal to the pipeline and not linked here since it carries no
   public URL.
3. The demo code on this branch, `postgres-on-kubernetes-cloudnativepg/`,
   which is the actual specification for every command and outcome the
   deck shows. Every command on a demo slide is copied from the folder's
   scripts and Pulumi programs, not from the brief's prose summary of them.
4. The reference workshop, the style source of truth for folder layout,
   Slidev with `@pulumi/slidev-theme`, and the fixed slide arc:
   https://github.com/pulumi/workshops/tree/main/neo-in-a-docker-sandbox

## Structure asked for (90 minutes)

| Section | Slides | Minutes |
|---|---|---|
| Title, speaker, housekeeping, agenda | 1-4 | 5 |
| Hook: the 3am page | 5 | 2 |
| The problem: Postgres in a bare StatefulSet | 6 | 4 |
| CloudNativePG closes that gap | 7 | 4 |
| Why Pulumi, not `kubectl apply` (architecture diagram) | 8 | 5 |
| What you need for today (prerequisites) | 9 | 3 |
| Live demo divider | 10 | 1 |
| Demo 1: cluster + operator (`01-cluster-and-operator`) | 11 | 6 |
| Demo 2: the Postgres cluster (`02-postgres-cluster`) | 12 | 7 |
| Demo 3: verify replication (`03-replication`) | 13 | 4 |
| Demo 4: trigger a failover (`04-failover`) | 14 | 7 |
| Demo 5: back it up (`05-backup`) | 15 | 6 |
| Demo 6: restore to a point in time (`06-pitr-restore`) | 16 | 10 |
| Under the hood: reconciliation + backup internals | 17 | 5 |
| Failure modes in production | 18 | 4 |
| Where this fits in a bigger platform | 19 | 3 |
| Demo 7: teardown (`07-teardown`) | 20 | 3 |
| What you did today (recap) | 21 | 3 |
| Follow up | 22 | 2 |
| Q&A / thanks | 23 | 6 |
| **Total** | | **90** |

Every demo slide (11, 12, 13, 14, 15, 16, 20) maps to exactly one numbered
folder, in order, and shows only the command that folder's README and
scripts actually run.

## Sources read while building this deck (2026-09-27)

- Workshop brief: https://workprentice.ai/documents/3bcc1bfe-c8f7-4ea6-9c18-625ab4dc02b4
- Demo folder README and every script under `01-` through `07-` in this
  workshop folder, read directly, not summarized from the brief.
- CNCF landscape data (`landscape.yml`, `cncf/landscape` on GitHub):
  CloudNativePG is CNCF Sandbox, accepted 2025-01-21. There is no public
  record of it having progressed to Incubating as of this read; slide 7
  says "CNCF Sandbox project" and does not claim Incubating status.
- `cloudnative-pg.io` homepage, read for current framing and terminology.
- Pulumi blog, "Pulumi Kubernetes v4.34.0: CRDs as provider extensions",
  2026-08-28: https://www.pulumi.com/blog/kubernetes-crds-as-provider-extensions/
  (confirms `pulumi package add kubernetes --extension` and typed CRD SDK
  generation), referenced on slide 8 and the further-reading slide.
- Pulumi product naming conventions (Pulumi IaC, Pulumi Cloud, Pulumi ESC,
  pulumi console): applied throughout; this deck does not reference Neo,
  ESC, or ai-assist features, since the demo does not use them.
- QR destinations confirmed reachable: https://slack.pulumi.com,
  https://app.pulumi.com/signup, and the workshop repo path on this branch.

## Deviations from the brief's §5 outline

1. **Added slide 13** for `03-replication/`. The brief's §5 collapses the
   Cluster CR and its replication verification into one entry, but the demo
   folder has seven numbered steps and every live-demo slide must map to
   one folder. Nothing from §5 was dropped; the replication check simply
   gets its own slide because it is its own folder.
2. **Added slide 9** (prerequisites). The brief's §6 has participants follow
   along locally with `kind`, no AWS account required; workshop-deck calls
   for a prerequisites slide whenever the audience follows along live.
3. Frame slides (2, 3, 4, 5, 10, 22, 23) come from the workshop-deck skill's
   fixed arc, not from brief §5, which does not specify them.
4. The backup slides (15, 17) describe the Barman Cloud Plugin and
   `ObjectStore` custom resource the demo actually provisions
   (`barmancloud.cnpg.io/v1`), not the deprecated in-tree
   `spec.backup.barmanObjectStore` field some older CNPG material still
   shows. Likewise, the AWS resources shown are `aws.s3.Bucket` with
   separate `BucketVersioning` / `BucketServerSideEncryptionConfiguration` /
   `BucketPublicAccessBlock` resources and `k8s.apiextensions.CustomResource`
   for the CNPG CRDs, matching `02-postgres-cluster/index.ts` exactly.

## Rules that still bind

- Every command shown is one the demo folder actually runs, with the same
  flags. See `../AGENTS.md` for the workshop-wide conventions (credentials,
  `node_modules/`, state, and recordings never enter a commit).
- Speaker identity is unknown; the speaker slide uses an explicit
  placeholder image and a `TODO(presenter)` comment rather than an invented
  name or bio.
- No em dashes or en dashes anywhere in this file or in `slides.md`.
