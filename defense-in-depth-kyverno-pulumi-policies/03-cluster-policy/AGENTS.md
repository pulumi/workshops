# AGENTS.md — 03-cluster-policy

Pulumi TypeScript project for step 4: the `require-resource-limits`
ClusterPolicy in `enforce` mode.

## How to work here

- Always run `./wait-for-kyverno.sh` before `pulumi up` (and before
  `pulumi preview`, which still contacts the live cluster to plan the
  CustomResource). Skipping it risks applying the ClusterPolicy before
  Kyverno's admission webhook has registered, which the brief calls out as a
  real failure mode, not a hypothetical one.
- Uses `spec.rules[].validate.failureAction: Enforce`, not the deprecated
  top-level `spec.validationFailureAction`. See the comment in `index.ts` and
  https://kyverno.io/docs/policy-types/cluster-policy/validate/ (read
  2026-09-25) before changing the schema.
- This is a separate Pulumi stack from `02-kyverno`; it has no `dependsOn`
  relationship to that project's resources because Pulumi dependencies do not
  cross projects. The wait script is the substitute for that ordering
  guarantee.
- `kubectl get clusterpolicy` should show `require-resource-limits` with
  `READY: true` once this stack is up.
