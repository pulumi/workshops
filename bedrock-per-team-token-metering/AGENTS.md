# bedrock-per-team-token-metering

Demo code for a workshop on per-team Amazon Bedrock cost tracking with Pulumi. `TUTORIAL.md` is the walk-through; `README.md` the reference.

## How to work here

- The Pulumi project is this folder (`index.ts`, `meteredModelAccess.ts`, `tokenCutoff.ts`, `cutoff/`). Teams are entries in `teams` in `Pulumi.dev.yaml` (name, cost center, optional `alarmOutputTokens` and `dailyOutputTokens` overriding the stack defaults), deployed with `pulumi up`; do not copy the component per team. The committed config ships with three teams; `scripts/teardown.sh` keeps them.
- AWS credentials come from the ESC environment `bedrock-metering/aws-login` (OIDC). Do not add access keys or `aws:accessKey` config.
- The region is `us-east-1`. Do not set a region on a provider or a resource.
- Always run `pulumi preview` before `pulumi up`. `pulumi preview --policy-pack policy` checks the guardrails (`cd policy && npm ci` once first; `scripts/setup.sh` does it). `scripts/policy-enable.sh` publishes the pack and enforces it from Pulumi Cloud through the `bedrock-metering` Policy Group, after which every preview and update runs it with no flag; bump `version` in `policy/package.json` before re-running it with changed rules, since a published version is immutable.
- Every inference profile needs the `Team` and `CostCenter` tags. Invoke permissions name a profile ARN, never `*`. The one `Resource: "*"` on invoke is the Deny the cutoff function writes at runtime (`cutoff/index.mjs`); it is not Pulumi-managed and the team role has `forceDetachPolicies` so destroy still works.
- The metric filters match `identity.arn` on the role name `bedrock-meter-<team>`. If you rename the role, change the filter pattern and the cutoff's `roleNamePrefix` with it. Each alarm names its role in a `CutoffRole` tag; the function reads the tag, never the name.
- The cutoff is sticky by design: no `okActions`, nothing lifts it but `scripts/restore.sh`. Do not add an OK action that removes the Deny.
- Pulumi Neo, Pulumi ESC and Pulumi Cloud are the product names. Do not run `pulumi destroy` unless a human asks for teardown.
- Scripts live in `scripts/`, are bash, source `scripts/lib.sh`, and must pass `shellcheck -x` with the `.shellcheckrc` in this folder.
- Policy pack unit tests: `cd policy && npm test`.
- `.gitignore` drops every `*.md` except `README.md`, `AGENTS.md`, `TUTORIAL.md` and `slides/slides.md`; presenter-only notes stay local.
