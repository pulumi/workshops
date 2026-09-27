
# AGENTS.md — postgres-on-kubernetes-cloudnativepg

Guidance for coding agents (and humans) working in this workshop folder of
`pulumi/workshops`.

## What this folder is

The material for the workshop "Running production PostgreSQL on Kubernetes
with CloudNativePG and Pulumi": a 90-minute session for platform engineers
and SREs that provisions a self-healing, backed-up Postgres cluster on
Kubernetes with Pulumi, then triggers a live failover and a point-in-time
restore. See `README.md` for the layout and how to run the demo.

The repo carries what an attendee or a future presenter needs: the demo code
and these notes. Slides follow on this same branch. The presenter's own
working documents (runbook, rehearsal checklist, fact-check log, open
questions) stay off the repo: `.gitignore` keeps every `*.md` out except
`README.md`, the `AGENTS.md` files and `slides/slides.md`. If you write a new
working document, it is ignored by default; that is deliberate, do not
force-add it.

## Rules

- Stay inside this folder. Never modify other workshop folders in this repo.
- Facts about Pulumi products come from the docs listed under "Sources" in
  `README.md`, read during the run that built this folder, never from
  memory. Facts about CloudNativePG come from cloudnative-pg.io, same rule.
  If a doc is unclear, the question goes into the pull request description
  as an open question; never fill a gap with something plausible.
- Canonical names: Pulumi Neo (or Neo) if referenced, Pulumi ESC, Pulumi
  Cloud, Pulumi IaC, Pulumi console (lowercase console). Never "Copilot",
  "Pulumi Service", "Insights", "CrossGuard".
- Conventional Commits, scoped to this folder, e.g.
  `feat(postgres-on-kubernetes-cloudnativepg): …`,
  `docs(postgres-on-kubernetes-cloudnativepg): …`.
- Do not commit credentials, `node_modules/`, `dist/`, `sdks/`, state files,
  or recordings.

## Why the folder has seven numbered steps, not the brief's four

The brief describes four Pulumi/kubectl building blocks (kind cluster +
operator, Postgres cluster + backup, failover, PITR restore). This build
splits them into seven folders because each one ends in a single state you
can check before moving on, and because CloudNativePG's current backup
integration (see below) adds two install steps the brief's outline did not
anticipate:

1. `01-cluster-and-operator/` — the kind cluster, cert-manager, the CNPG
   operator and the Barman Cloud plugin. Four things, one folder, because
   the plugin cannot be installed before cert-manager exists and the
   operator's CRDs exist, and "everything the rest of the demo depends on is
   ready" is one end state, not four.
2. `02-postgres-cluster/` — the S3 bucket, the scoped IAM identity, the
   `ObjectStore` and the three-instance `Cluster`. One end state: cluster
   healthy with backups configured.
3. `03-replication/` — read-only: proves streaming replication before
   anything gets broken on purpose.
4. `04-failover/` — the scripted promotion and the check that a new primary
   took over automatically.
5. `05-backup/` — an on-demand backup and the check that it landed in the
   bucket.
6. `06-pitr-restore/` — a second `Cluster`, recovered from that backup to a
   point in time, verified by row count.
7. `07-teardown/` — destroy in reverse order, then verify rather than
   assume: this operator's PVC-retention behaviour on cluster deletion is
   not documented (see `README.md`'s Sources), so teardown checks for
   leftover PVCs and the bucket instead of trusting a destroy to be enough.

## Deviations from the brief (also listed in the pull request)

- **Backup API.** The brief names `spec.backup.barmanObjectStore` on the
  `Cluster` CR. That field has been deprecated since CNPG v1.26; the current
  documented path is the Barman Cloud Plugin (CNPG-I): a separate
  `ObjectStore` CR plus `spec.plugins` on the `Cluster`. Built the plugin
  path. This also means `01-cluster-and-operator` additionally installs
  cert-manager (a plugin requirement) and the plugin's own Helm chart,
  neither of which the brief's step 1 named.
- **AWS S3 resource.** The brief names `aws.s3.BucketV2`. The AWS provider
  docs now deprecate `BucketV2` in favour of `aws.s3.Bucket`; built with
  `aws.s3.Bucket`.
- **CRD representation.** Evaluated `pulumi package add kubernetes
  --extension` (typed SDK generated from a local CRD manifest, no live
  cluster needed) against `kubernetes.apiextensions.CustomResource`. The
  extension mechanism worked in an offline test but generates on the order
  of several megabytes of committed code (compiled JS, type declarations)
  for a single CRD, which is more moving parts than this workshop's learning
  outcomes call for — the outcomes are about CloudNativePG, not about
  Pulumi's package-extension feature. Built with `CustomResource` instead,
  matching the closest reference workshop's own choice for its own CRD.

## Verification commands, by folder

- `01-cluster-and-operator/`, `02-postgres-cluster/`, `06-pitr-restore/`
  (Pulumi TypeScript): `npm install && npx tsc --noEmit` must pass in each.
- `03-replication/`, `04-failover/`, `05-backup/`, `07-teardown/` (shell):
  `shellcheck --rcfile ../.shellcheckrc *.sh` must pass in each.
- Every command shown on a slide must be a command one of these scripts or
  `README.md`'s "Run the demo" section actually runs, with the same flags.
