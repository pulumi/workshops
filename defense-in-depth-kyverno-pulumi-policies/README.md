# Defense in Depth as Code: Kyverno Admission Control and Pulumi Policies

A 90-minute workshop on enforcing the same rule — every container sets
resource limits — at two independent layers: Kubernetes admission control
(Kyverno) and the Pulumi pipeline itself (Pulumi Policies). Everything runs
against a local `kind` cluster, so there is no cloud account and no cloud
spend: estimated cost **$0.00**.

> Leave with a cluster that rejects an unsafe workload at admission time, and
> a Pulumi program that is blocked from ever proposing that workload in the
> first place — and a clear answer to "which layer should catch this?"

## Sessions and speakers

No session is scheduled yet. This folder was queued from the topic backlog
(`cncf-policy-identity-security` row) on cross-source demand evidence — four
independent signals over twelve months (AWS, a KubeCon EU 2026 session at
Apple, Red Hat Developer, and Unit 42/Palo Alto Networks), each about a
different project in the Kubernetes policy-and-identity space — not from an
event page or a named presenter. See the pull request for the full evidence
and the backlog row.

## What attendees learn

1. Install and configure Kyverno as Pulumi-managed infrastructure (Helm
   chart via the Pulumi Kubernetes provider).
2. Write a Kyverno `ClusterPolicy` that rejects a Pod without resource
   limits, and see `kubectl` blocked at admission time.
3. Write a Pulumi Policy (a Pulumi Policies policy pack, in TypeScript)
   enforcing the identical rule against Pulumi-declared resources, and see
   `pulumi preview` blocked before anything reaches the cluster.
4. Explain, in one sentence each, what each layer catches that the other
   cannot.
5. Tear down every resource so the local environment is left clean, with
   nothing left running.

## Layout

```
defense-in-depth-kyverno-pulumi-policies/
├── README.md                    this file
├── AGENTS.md                    conventions for agents (and humans) editing this folder
├── teardown.sh                  step 8: destroy every stack, then delete the kind cluster
├── 01-cluster/                  presenter setup (step 1): create the local kind cluster
├── 02-kyverno/                  Pulumi TypeScript project (steps 2-3): provider + Kyverno Helm chart
├── 03-cluster-policy/           Pulumi TypeScript project (step 4): the require-resource-limits ClusterPolicy
├── 04-admission-denied/         plain manifest + script (step 5): kubectl apply rejected live
└── 05-pipeline-policy/          policy-pack/ (step 6, the Pulumi Policy) + workload/ (the Pod it blocks)
```

Steps 2 and 3 share one folder: step 2 is "create the project and point the
Pulumi Kubernetes provider at the `kind` context," which is the same
`kubernetes.Provider` that step 3's Kyverno install runs against, so
splitting them into two projects would gain nothing. Step 7 (the brief's
side-by-side comparison of steps 5 and 6) has no code of its own — it is a
slide, once `slides/` exists on this branch — and is not a folder here.

## Prerequisites

- Docker Desktop (or another `kind`-compatible Docker runtime), with roughly
  **4 vCPU / 6 GB free** for the cluster plus Kyverno's admission-webhook
  pods to schedule smoothly.
- [`kind`](https://kind.sigs.k8s.io/) v0.33.0 or later.
- `kubectl`, matching the cluster's Kubernetes minor version (v1.37 node
  image, see `01-cluster/`).
- Node.js LTS (22 or 24) and npm.
- The Pulumi CLI, v3.264.0 or later, and a Pulumi Cloud account (or a local
  state backend) for `pulumi login`.

Presenter setup, before the session: run `01-cluster/create-cluster.sh` and
`01-cluster/preflight.sh` in advance so the cluster is up and Kyverno's image
is pre-pulled; a live image pull mid-demo can eat several minutes of the
90-minute budget.

## Run the demo

```bash
# 1. presenter setup (before the session)
01-cluster/create-cluster.sh
01-cluster/preflight.sh

# 2-3. point the provider at the cluster, install Kyverno
cd 02-kyverno && npm install
pulumi stack init dev
pulumi preview                 # step 2 end state: succeeds, zero resources
pulumi up                      # step 3 end state: kyverno pods Running
kubectl --context kind-policy-demo get pods -n kyverno
cd ..

# 4. the ClusterPolicy, enforce mode
cd 03-cluster-policy && npm install
pulumi stack init dev
./wait-for-kyverno.sh          # blocks until the admission webhook is Ready
pulumi up                      # step 4 end state: clusterpolicy Ready: true
kubectl --context kind-policy-demo get clusterpolicy
cd ..

# 5. live: kubectl apply rejected at admission time
04-admission-denied/try-apply.sh

# 6. the same rule as a Pulumi Policy, blocking pulumi preview
cd 05-pipeline-policy/policy-pack && npm install && cd ../workload
npm install
pulumi stack init dev
pulumi preview --policy-pack ../policy-pack    # blocked before reaching the cluster
cd ../..

# 8. teardown: leave nothing running
./teardown.sh
```

Step 7 (the side-by-side comparison of steps 5 and 6) is a slide, not a
command.

## Sources

Facts in this folder come from these pages, read on September 25, 2026:

- Kyverno Helm chart, current stable version (3.9.1) and `crds.install`:
  https://artifacthub.io/packages/helm/kyverno/kyverno
- Kyverno `ClusterPolicy` validate schema, the deprecation of top-level
  `spec.validationFailureAction` in favor of per-rule
  `spec.rules[].validate.failureAction`, and the current status of
  `ClusterPolicy` itself (supported, but superseded going forward by
  CEL-based kinds): https://kyverno.io/docs/policy-types/cluster-policy/validate/
  and https://kyverno.io/docs/guides/migration-to-cel/
- Kyverno's own sample policy, "Require Limits and Requests" (adapted here to
  the current `failureAction` syntax):
  https://kyverno.io/policies/best-practices/require-pod-requests-limits/require-pod-requests-limits/
- `@pulumi/kubernetes` current version (4.34.2), `kubernetes.helm.v4.Chart`
  and `kubernetes.apiextensions.CustomResource` argument surfaces, and
  `kubernetes.Provider`'s `kubeconfig`/`context` inputs:
  https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v4/chart/,
  https://www.pulumi.com/registry/packages/kubernetes/api-docs/apiextensions/customresource/,
  https://www.pulumi.com/registry/packages/kubernetes/api-docs/provider/
- `@pulumi/policy` current version (1.21.0), the `PolicyPack`/
  `validateResourceOfType` API, and the current docs location (moved off the
  `crossguard` URL slug; the product is Pulumi Policies, not "CrossGuard"):
  https://www.pulumi.com/docs/discovery-governance/concepts/policy-as-code/,
  https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/,
  https://www.pulumi.com/docs/discovery-governance/reference/policy-project-file/
- `pulumi preview --policy-pack` flag reference:
  https://www.pulumi.com/docs/iac/cli/commands/pulumi_preview/
- `kind` current release (v0.33.0) and its default node image:
  https://github.com/kubernetes-sigs/kind/releases/latest
- Node.js LTS status: https://nodejs.org/en/about/previous-releases
- Pulumi CLI current release (3.264.0):
  https://github.com/pulumi/pulumi/releases/latest

Demand-signal sources (why this workshop, not what it teaches) are listed in
the pull request description and the topic backlog row
`cncf-policy-identity-security`.
