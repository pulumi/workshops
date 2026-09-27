# AGENTS.md — kafka-on-kubernetes-strimzi

Guidance for coding agents (and humans) working in this workshop folder of
`pulumi/workshops`.

## What this folder is

The material for the workshop "Running Apache Kafka on Kubernetes with the
Strimzi operator and Pulumi": a 90-minute session for platform engineers and
data engineers that provisions a KRaft-mode Kafka cluster on Kubernetes with
Pulumi, produces and consumes messages through it, and scales and upgrades it
live. See `README.md` for the layout and how to run the demo.

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
  memory. Facts about Strimzi and Kafka come from strimzi.io, same rule. If a
  doc is unclear, the question goes into the pull request description as an
  open question; never fill a gap with something plausible.
- Canonical names: Pulumi Neo (or Neo) if referenced, Pulumi ESC, Pulumi
  Cloud, Pulumi IaC, Pulumi console (lowercase console). Never "Copilot",
  "Pulumi Service", "Insights", "CrossGuard".
- Conventional Commits, scoped to this folder, e.g.
  `feat(kafka-on-kubernetes-strimzi): …`,
  `docs(kafka-on-kubernetes-strimzi): …`.
- Do not commit credentials, `node_modules/`, `dist/`, `sdks/`, state files,
  or recordings.

## Why the folder has seven numbered steps, not the brief's four demo blocks

The brief's demo plan (its section 4) groups resources into four Pulumi
resource groups plus three live-only steps. This build splits them into
seven folders, each ending in one state you can check before moving on:

1. `01-cluster/` — the kind cluster and the Strimzi Cluster Operator, via
   its OCI Helm chart. One end state: operator pod `Running` in namespace
   `kafka`.
2. `02-kafka/` — the KRaft-mode `Kafka` custom resource and its
   `KafkaNodePool` resources. One end state: `kubectl get kafka` reports
   `Ready True`.
3. `03-topic/` — the `KafkaTopic` custom resource for `demo-events`. One end
   state: `kubectl get kafkatopic demo-events` reports `Ready True`.
4. `04-clients/` — a long-running consumer `Deployment` plus a producer
   script, so traffic is already flowing before the scaling and upgrade
   steps run.
5. `05-scale-brokers/` — a script driving a Pulumi config change plus
   `pulumi up` against `02-kafka`, scaling the broker node pool live.
6. `06-rolling-upgrade/` — a script driving the documented two-step Kafka
   version upgrade procedure (see below) against `02-kafka`.
7. `07-teardown/` — destroy in reverse order, then verify rather than
   assume: Strimzi's PVC-retention behavior on `Kafka` CR deletion is
   inconsistent across storage classes, so teardown checks for leftover
   PVCs explicitly instead of trusting a destroy to be enough.

## Deviations from the brief (also listed in the pull request)

- **Separate broker and controller node pools, not one dual-role pool.**
  The brief's demo plan describes a single `KafkaNodePool` per Strimzi's
  node-pool model without specifying dual-role or split roles. Strimzi's own
  docs state plainly that "scaling controller nodes in node pools is
  currently not supported" (KAFKA-16538) and recommend separate node pools
  for most production deployments
  (https://strimzi.io/docs/operators/latest/deploying, section 2.1.1, read
  2026-09-27). Since this workshop's step 5 is a **live broker scale-up**,
  built with a fixed 3-replica `controller` pool and a separately scalable
  `broker` pool, so the live scaling demo only ever touches supported
  behavior.
- **CRD apiVersion.** Built against `kafka.strimzi.io/v1` for `Kafka`,
  `KafkaNodePool`, and `KafkaTopic`. Confirmed against the live CRD bundle
  (https://github.com/strimzi/strimzi-kafka-operator/releases/download/1.2.0/strimzi-crds-1.2.0.yaml,
  read 2026-09-27): each CRD declares exactly one served/stored version, `v1`.
  There is no `v1beta2` in this release; do not carry that name forward from
  older Strimzi documentation or training data.
- **Operator install method.** The Strimzi Cluster Operator Helm chart is
  distributed only as an OCI artifact as of 1.2.0
  (`oci://quay.io/strimzi-helm/strimzi-kafka-operator`); there is no HTTP
  Helm repository to `helm repo add`. Built with `k8s.helm.v4.Chart`'s
  `chart: "oci://..."` form directly, matching the pattern the Pulumi
  Kubernetes provider's own registry docs show for OCI charts
  (https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v4/chart/,
  read 2026-09-27).
- **CRD representation.** Built with
  `kubernetes.apiextensions.CustomResource` for `Kafka`, `KafkaNodePool`, and
  `KafkaTopic`, matching the closest reference workshop's own choice for its
  own CRDs, rather than generating a typed SDK extension for a single-use
  demo.

## Verification commands, by folder

- `01-cluster/`, `02-kafka/`, `03-topic/`, `04-clients/` (Pulumi TypeScript):
  `npm install && npx tsc --noEmit` must pass in each.
- `05-scale-brokers/`, `06-rolling-upgrade/`, `07-teardown/` (shell):
  `shellcheck --rcfile ../.shellcheckrc *.sh` must pass in each.
- Every command shown on a slide must be a command one of these scripts or
  `README.md`'s "Run the demo" section actually runs, with the same flags.

## The two-step Kafka version upgrade (06-rolling-upgrade)

Strimzi's documented upgrade procedure
(https://strimzi.io/docs/operators/latest/deploying, section on upgrading
Kafka in KRaft mode, read 2026-09-27) is two sequential changes, not one:

1. Change `Kafka.spec.kafka.version` to the new Kafka version; leave
   `metadataVersion` unchanged at the *current* version's value. This lets
   brokers running old and new binaries keep talking to each other during
   the rolling restart.
2. Once every broker is confirmed on the new version, update
   `metadataVersion` to the new version's value.

`06-rolling-upgrade/upgrade.sh` runs both steps as separate `pulumi config
set` + `pulumi up` pairs, in that order, against `02-kafka`. Do not collapse
this into a single config change; it is not the same operation.
