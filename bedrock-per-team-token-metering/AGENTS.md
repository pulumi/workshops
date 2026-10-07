# bedrock-per-team-token-metering

Demo code for a workshop on per-team Amazon Bedrock cost tracking with Pulumi.

## How to work here

- `02-platform` is the only deployed Pulumi project. Teams are entries in the `teams` stack config; do not copy the component per team.
- AWS credentials come from the ESC environment `bedrock-metering/aws-login` (OIDC). Do not add access keys or `aws:accessKey` config.
- The region is `us-east-1`. Do not set a region on a provider or a resource.
- Always run `pulumi preview` before `pulumi up`. Run `pulumi preview --policy-pack ../07-policy` from `02-platform` to check the guardrails.
- Every inference profile needs the `Team` and `CostCenter` tags. Invoke permissions name a profile ARN, never `*`.
- The metric filters match `identity.arn` on the role name `bedrock-meter-<team>`. If you rename the role, change the filter pattern with it.
- Pulumi Neo, Pulumi ESC and Pulumi Cloud are the product names. Do not run `pulumi destroy` unless a human asks for teardown.
- Scripts are bash and must pass `shellcheck -x` with the `.shellcheckrc` in this folder.
- Policy pack unit tests: `cd 07-policy && npm test`.
