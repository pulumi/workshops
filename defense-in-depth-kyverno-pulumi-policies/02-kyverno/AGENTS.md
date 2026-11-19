# AGENTS.md — 02-kyverno

Pulumi TypeScript project covering steps 2 and 3 of the brief, grouped in one
folder because step 2 ("create the project and point the provider at the
kind context") produces the same `kubernetes.Provider` that step 3's Kyverno
install runs against — splitting them would mean two projects sharing one
provider for no benefit. `pulumi preview` with zero other resources (step 2's
end state) and `pulumi up` installing Kyverno (step 3's end state) are both
run from here, in that order, against the same stack.

## How to work here

- Stack: `dev` (config in `Pulumi.dev.yaml`), `kubernetes:context` set to
  `kind-policy-demo`. Do not hardcode a kubeconfig path or context in
  `index.ts`; if a presenter renames the cluster, only the stack config
  changes.
- `KYVERNO_CHART_VERSION` in `index.ts` pins the Helm chart to a stable
  release (never a release-candidate). Confirm the current stable version at
  https://artifacthub.io/packages/helm/kyverno/kyverno before bumping it, and
  update this comment's read date when you do.
- `crds.install` defaults to `true` on this chart, so the ClusterPolicy CRD
  is installed here; `03-cluster-policy` depends on that but cannot see this
  stack's resources directly (separate Pulumi project), so it waits on the
  cluster state instead — see `03-cluster-policy/AGENTS.md`.
- Always run `pulumi preview` before `pulumi up`.
- `npm install` before the first `pulumi preview`.
