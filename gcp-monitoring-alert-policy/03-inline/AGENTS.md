# gcp-monitoring-demo (03-inline)

Pulumi TypeScript project, steps 3 to 5: the Cloud Run service plus the custom service, SLO, alert policies, log-based metric and dashboard, written inline.

## How to work here

- Stack: `dev` (config in `Pulumi.dev.yaml`). It imports the Pulumi ESC environment that mints short-lived Google Cloud credentials. Do not add keys or `gcp:credentials`.
- Region `europe-west3`; set `gcp:project` with `pulumi config set gcp:project <id>`.
- Run `pulumi preview` before `pulumi up`.
- Never run `pulumi destroy` here for the demo teardown; use `07-teardown/teardown.sh`.
- The `stage` config (`slo`, `alerts`, `full`) controls how much is created; any other value throws. Keep it, the demo steps use it.
- The dashboard is plain JSON in `dashboard.ts`. Keep it in sync with `04-component/dashboard.ts`.
- Resource names here are the aliases `04-component` adopts. Renaming one breaks `adoptInline`.
