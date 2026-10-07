# Meter every token: per-team Amazon Bedrock cost tracking and guardrails as code

Demo code for the workshop. One Pulumi program gives each team its own Amazon Bedrock application inference profile and a role that can call only that profile. Bedrock invocation logging feeds CloudWatch Logs, metric filters turn the log into per-team token counts, and a policy pack stops untagged profiles and wildcard invoke grants before they deploy.

## What you need

- A Pulumi Cloud account and the Pulumi CLI 3.267.0
- Node.js 24 (v24.21.0 was used) and npm
- AWS CLI v2, `jq`, `bc`, `bash`
- An AWS account with Amazon Bedrock enabled in `us-east-1` and access to Amazon Nova 2 Lite
- An IAM OIDC provider for `https://api.pulumi.com/oidc` (audience `aws:<your Pulumi org>`) and a role it can assume. Create both before the session.
- Pulumi organization: `export PULUMI_ORG=<org>` or run `pulumi org set-default <org>`

Pinned versions: `@pulumi/pulumi` 3.267.0, `@pulumi/aws` 7.48.0, `@pulumi/policy` 1.21.0.

## Layout

The folder numbers follow the steps of the demo.

| Folder | Step | What it does |
| --- | --- | --- |
| `01-credentials` | 1 | ESC environment `bedrock-metering/aws-login` with OIDC credentials, and a check |
| `02-platform` | 2 | The Pulumi project: log group, invocation logging, dashboard, and the `MeteredModelAccess` component |
| `03-first-team` | 3 | Add team `search` |
| `04-calls` | 4 | 20 Converse calls as a team, log reader, metric check |
| `05-second-team` | 5 | Add team `support` |
| `06-cross-team` | 6 | `support` calls the `search` profile and gets AccessDenied |
| `07-policy` | 7 | Policy pack (required tags, no wildcard invoke) with unit tests |
| `08-violations` | 8 | Add two mistakes, watch the preview fail, fix them |
| `09-alarm` | 9 | Push one team over the output token alarm |
| `10-budget` | 10 | Optional AWS Budget filtered by the Team tag |
| `11-teardown` | 11 | Destroy everything and verify |

There is one stack. Bedrock invocation logging is a single setting per account and Region, so the foundation and the teams live in the same project. Teams are entries in the `teams` config value.

## Run it

```bash
export PULUMI_ORG=<org>
ROLE_ARN=arn:aws:iam::<account>:role/<role> 01-credentials/create-env.sh
01-credentials/check.sh
02-platform/up.sh
02-platform/test-call.sh
03-first-team/up.sh
04-calls/send-calls.sh search 20
04-calls/show-log.sh
04-calls/check-metrics.sh search
05-second-team/up.sh
04-calls/send-calls.sh support 20
06-cross-team/try-cross-team.sh
07-policy/run-preview.sh
08-violations/break.sh
08-violations/fix.sh
09-alarm/trip-alarm.sh search
11-teardown/teardown.sh
```

Metrics and alarms lag the calls by a minute or two. The first invocation record can take about a minute to appear.

## Model choice

`amazon.nova-2-lite-v1:0` is reached through the US geographic system-defined profile `us.amazon.nova-2-lite-v1:0`, which routes to `us-east-1`, `us-east-2` and `us-west-2`. The invoke policy therefore names the foundation model in all three Regions. If Nova 2 Lite is not available to your account, switch to the In-Region fallback:

```bash
cd 02-platform && pulumi config set model nova-lite
```

## Cost

Nova 2 Lite In-Region lists at $0.00033 per 1K input tokens and $0.00275 per 1K output tokens (AWS Price List, read 2026-10-07). Under 200 calls of about 500 tokens each stay under $0.30 per participant. Plan for a budget of $1 per participant including CloudWatch Logs. The log group keeps data for one day.

## Teardown

`11-teardown/teardown.sh` destroys the stack, removes the stack, and prints the three checks: no application inference profiles, an empty invocation logging configuration, and no `/workshop/` log groups. It then deletes the ESC environment. Run it after every session.

## Verification status

See the pull request for which checks ran and which need a live AWS account.
