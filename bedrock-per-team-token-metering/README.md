# Meter every token: per-team Amazon Bedrock cost tracking and guardrails as code

Demo code for the workshop. One Pulumi program gives each team its own Amazon Bedrock application inference profile and a role that can call only that profile. Bedrock invocation logging feeds CloudWatch Logs, metric filters turn the log into per-team token counts, an alarm per team calls a function that cuts the team off when it passes its output-token threshold, and a policy pack stops untagged profiles and wildcard invoke grants before they deploy.

**Start with [TUTORIAL.md](TUTORIAL.md)**: the walk-through, about twelve commands, with what to read in the editor at each step.

## What you need

- A Pulumi Cloud account and the Pulumi CLI 3.267.0
- Node.js 24 (v24.21.0 was used) and npm
- AWS CLI v2, `jq`, `bash`
- An AWS account with Amazon Bedrock enabled and access to Amazon Nova 2 Lite. The demo runs in `us-east-1` unless you `export AWS_REGION=<region>` before the first script (verified in `us-east-1` and `ca-central-1`)
- An IAM OIDC provider for `https://api.pulumi.com/oidc` (audience `aws:<your Pulumi org>`) and a role it can assume. Create both before the session.
- Pulumi organization: `export PULUMI_ORG=<org>` or run `pulumi org set-default <org>`. The account id is read at runtime from the credentials; nothing account-specific is in the config.

Pinned versions: `@pulumi/pulumi` 3.267.0, `@pulumi/aws` 7.48.0, `@pulumi/policy` 1.21.0.

## Layout

The Pulumi project is this folder.

| Path | What |
| --- | --- |
| `index.ts` | The program: config, the invocation log, the `TokenCutoff` function, the `teams` list mapped over `MeteredModelAccess`, a dashboard, the two demo mistakes behind `demoViolations`, the optional budget behind `enableBudget` |
| `meteredModelAccess.ts` | One team: tagged inference profile, scoped role, two metric filters, two alarms (a minute, a day) wired to the cutoff |
| `tokenCutoff.ts`, `cutoff/index.mjs` | The stop: a Lambda the alarms call, which puts an inline Deny on the team role |
| `policy/` | Policy pack (required tags, no wildcard invoke) with unit tests: `cd policy && npm test`. Run it with `--policy-pack policy`, or once `scripts/policy-enable.sh` has published it to the organization, on every run with no flag |
| `Pulumi.dev.yaml` | Stack config: the ESC environment import, the region, the two default limits, the `teams` list with per-team overrides |
| `scripts/` | `setup` (once, before a session) and `teardown`, plus the AWS-side helpers the tutorial calls: `test-call`, `call`, `show-log`, `metrics`, `cross-team`, `trip-alarm`, `check-cutoff`, `restore`; `lib.sh` holds the shared bits |
| `diagrams/` | The architecture and the three stop lanes as PNGs, with their Mermaid sources; the deck reads them through a symlink |
| `slides/` | The deck |

There is one stack. Bedrock invocation logging is a single setting per account and Region, so the foundation and the teams live in the same project. Teams are entries in `teams` in `Pulumi.dev.yaml`, next to the two defaults every team inherits: `alarmOutputTokens` (3000 output tokens a minute) and `dailyOutputTokens` (100000 a UTC day). An entry may override either. Add a team or change a number and run `pulumi up`.

## Run it

`TUTORIAL.md` has the same commands with what to read at each step.

```bash
export PULUMI_ORG=adamgordonbell-org
export ROLE_ARN=arn:aws:iam::616138583583:role/pulumi-environments-oidc
scripts/setup.sh
pulumi up                       # three teams from Pulumi.dev.yaml, 36 resources
pulumi stack output teamsOut
scripts/call.sh search 5
scripts/call.sh support 5
scripts/call.sh dev 5
scripts/show-log.sh
scripts/trip-alarm.sh search
scripts/cross-team.sh
pulumi preview --policy-pack policy
pulumi config set demoViolations true
pulumi preview --policy-pack policy
pulumi config rm demoViolations
scripts/check-cutoff.sh search
scripts/restore.sh search
scripts/teardown.sh
```

The second preview fails with two mandatory violations; that is the point. `trip-alarm.sh` is run early so the alarm has fired by the time `check-cutoff.sh` runs.

Metrics and alarms lag the calls by a minute or two. The first invocation record can take about a minute to appear. When the alarm reaches `ALARM` it calls the `bedrock-token-cutoff` function, which puts an inline Deny on Bedrock invocation (policy name `token-cutoff`) on the team's role; `check-cutoff.sh` shows the function's log line, the inline policy, and the team's own call failing. Nothing lifts the cutoff on its own: `restore.sh` removes the inline policy and proves the team can call again. Teardown works with a cutoff still in place.

## Model choice

`amazon.nova-2-lite-v1:0` is reached through the US geographic system-defined profile `us.amazon.nova-2-lite-v1:0`, which routes to several US Regions (and `ca-central-1` when called from there). The program reads the routed Regions from the profile and names the foundation model in each of them in the invoke policy. If Nova 2 Lite is not available to your account, switch to the In-Region fallback:

```bash
pulumi config set model nova-lite
```

## Cost

Nova 2 Lite In-Region lists at $0.00033 per 1K input tokens and $0.00275 per 1K output tokens (AWS Price List, read 2026-10-07). Under 200 calls of about 500 tokens each stay under $0.30 per participant. Plan for a budget of $1 per participant including CloudWatch Logs. The log groups keep data for one day.

## Teardown

`scripts/teardown.sh` destroys the stack, resets the demo config keys, removes the stack (keeping `Pulumi.dev.yaml`, which imports the ESC environment), and prints the checks: no application inference profiles, an empty invocation logging configuration, no `/workshop/` or cutoff log groups, no cutoff function. It then deletes the ESC environment. Run it after every session; the next run starts again from the first script.

## Timing seen in live runs

Runs on 2026-10-30 (`us-east-1` and `ca-central-1`) and 2026-11-02 (`us-east-1`): the foundation deploys in about 20 seconds, each team in about 5 seconds, the first invocation record appears within 15 seconds, metrics follow within a minute, and the alarm reached `ALARM` 40 to 90 seconds after the last call of `trip-alarm.sh`. The cutoff function wrote the Deny in the same second the alarm fired; lifting it took about six seconds to propagate. A team role created seconds ago can take a few seconds to become assumable, and its invoke policy a few more; the scripts retry.

## Verification status

Every step ran end to end against a live AWS account on 2026-10-30, twice (`us-east-1`, then `ca-central-1`), including teardown. The cutoff ran end to end on 2026-11-02 in `us-east-1`: alarm, Deny, AccessDenied for the team, the other team unaffected, restore, policy pack still passing, and teardown with the Deny in place. The flat layout and `TUTORIAL.md`, with plain `pulumi` commands and teams in `Pulumi.dev.yaml`, were run end to end on 2026-11-02 after the restructure. Details in the pull request.
