# AGENTS.md — 05-pipeline-policy

Step 6: the same `require-resource-limits` rule as `03-cluster-policy`,
enforced at the Pulumi pipeline layer instead of at Kubernetes admission.
Two projects, following the reference workshop's `04-policy/` pattern:

- `policy-pack/` — the Pulumi Policies pack (`@pulumi/policy`). `npx tsc
  --noEmit` must pass, and `npx tsc && node bin/test/rules-test.js` must
  report `failed=0`. The rule logic lives in `rules.ts` as a plain function
  (`missingResourceLimits`) precisely so it can be tested this way, without
  Pulumi Cloud — see
  https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/
  (read 2026-09-25), which documents unit-testing the check logic directly
  as the standard pattern.
- `workload/` — a Pulumi TypeScript project declaring one Pod
  (`unsafe-workload`) with no `resources.limits`, the target the policy pack
  is run against: `pulumi preview --policy-pack ../policy-pack` from this
  folder.

## Rules

- Keep the rule in `policy-pack/rules.ts` and `03-cluster-policy/index.ts`'s
  ClusterPolicy pattern checking the same thing (cpu and memory limits on
  every container). If one changes, check the other.
- `enforcementLevel: "mandatory"` on the policy, matching `enforce` mode on
  the ClusterPolicy — the whole point of step 7's side-by-side slide is that
  both layers enforce the identical rule.
- Never call this product "CrossGuard" (legacy name, absent from current
  docs); it is Pulumi Policies.
