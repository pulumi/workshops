# gcp-monitoring-guardrails (05-policy)

Pulumi Policies pack, step 8: a mandatory stack validation policy, `custom-service-needs-alert-policy`. A stack with a `gcp:monitoring/customService:CustomService` and no `gcp:monitoring/alertPolicy:AlertPolicy` fails the update.

## How to work here

- The rule logic lives in `rules.ts` so `test/rules-test.ts` can call it without the Pulumi engine. Put logic there, keep `index.ts` thin.
- `npm test` runs the rule tests. Run the pack with `pulumi preview --policy-pack ../05-policy` from a project folder.
- `tsconfig.json` sets `skipLibCheck` because `@pulumi/policy` 1.21.0 ships an empty `proxy.d.ts`. Do not remove it.
- Keep the enforcement level `mandatory`. Local `--policy-pack` use needs no Pulumi Cloud policy group.
