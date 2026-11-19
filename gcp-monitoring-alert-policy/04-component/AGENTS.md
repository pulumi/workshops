# gcp-monitoring-demo (04-component)

Pulumi TypeScript project, steps 6 and 7: the `ServiceMonitoring` component in `monitoring.ts`, consumed from `index.ts`, with mocha unit tests.

## How to work here

- Stack: `dev` (config in `Pulumi.dev.yaml`). It imports the Pulumi ESC environment that mints short-lived Google Cloud credentials. Do not add keys or `gcp:credentials`.
- Region `europe-west3`; set `gcp:project` with `pulumi config set gcp:project <id>`.
- Run `pulumi preview` before `pulumi up`.
- Never run `pulumi destroy` here for the demo teardown; use `07-teardown/teardown.sh`.
- Follow the component rules: children get `parent: this`, names derive from the component name, `registerOutputs()` is the last call.
- `npm test` must pass. `npm run test:plain` must fail: it is the demo of a stack without an alert policy. Do not fix it.
- `adoptInlineResources` (config `adoptInline`) adds aliases to the `03-inline` resource names. Keep it off by default.
- Fast and slow burn thresholds default to 10 and 2 over 3600s and 21600s. They are a design choice shown on the slides, not Google guidance.
