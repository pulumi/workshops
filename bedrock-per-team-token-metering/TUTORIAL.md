# Tutorial: per-team Bedrock token metering, with a stop

One Pulumi project. Each team gets a tagged inference profile, a role that can call only that profile, token metrics, and two alarms that cut the team off when it burns too many tokens, in a minute or in a day. A policy pack refuses the two classic mistakes at preview.

Step 1 deploys the finished thing. Steps 2 to 5 exercise it. Every Pulumi step is a plain `pulumi` command run from this folder. The scripts in `scripts/` only wrap the AWS side: calling Bedrock as a team, reading the log, checking the cutoff. Each one prints the AWS command it runs.

The deck: `cd slides && npm ci && npm run dev` serves it at http://localhost:3030 (presenter view at `/presenter`).

## Set two values, then copy every command as written

```bash
export PULUMI_ORG=XXXX
export ROLE_ARN=arn:aws:iam::XXXXXXXXXXXX:role/pulumi-environments-oidc
```

The first is your Pulumi organization. The second is an IAM role that trusts Pulumi's OIDC provider for that organization: it must trust `https://api.pulumi.com/oidc` with audience `aws:<org>` and be allowed to create IAM roles, Lambda functions, CloudWatch resources and Bedrock inference profiles.

What to have open in the editor: `Pulumi.dev.yaml`, `index.ts`, `meteredModelAccess.ts`, `tokenCutoff.ts`, `cutoff/index.mjs`, `policy/rules.ts`.

## 0. Setup, once

```bash
scripts/setup.sh
```

Creates the ESC environment `bedrock-metering/aws-login`, which mints short-lived AWS credentials over OIDC for the role above (nothing else in this tutorial holds an AWS key), prints the identity they resolve to, runs `npm ci` for the project and the policy pack, and selects the stack `dev`. From here on, `pulumi` knows the stack.

## 1. Deploy it

```bash
pulumi up
```

Thirty-six resources, about half a minute. Read `Pulumi.dev.yaml` while it runs. It is the whole policy:

```yaml
  bedrock-metering:alarmOutputTokens: "3000"     # default burst: output tokens per minute
  bedrock-metering:dailyOutputTokens: "100000"   # default cap: output tokens per UTC day
  bedrock-metering:teams:
    - name: search
      costCenter: cc-1001
      dailyOutputTokens: 500000      # a bigger day, the default burst
    - name: support
      costCenter: cc-2002           # both defaults
    - name: dev
      costCenter: cc-3003
      alarmOutputTokens: 20000       # allowed to burst (developers in Claude Code)
```

Two defaults and a list. A team is one entry; an entry may override either limit. Then `index.ts`, top to bottom:

- the config block, which reads exactly those keys;
- the invocation log: one `InvocationLoggingConfiguration` per account and Region, which is why this is one stack;
- the cutoff: one `TokenCutoff` (`tokenCutoff.ts`), a Lambda whose role may only write policies on roles named `bedrock-meter-*` and may only be called by alarms named `bedrock-*-output-tokens`;
- the line that maps the `teams` list over `MeteredModelAccess`, filling in the defaults.

In the preview the profile and role ARNs show as `[unknown]`: AWS mints those IDs at creation, and Pulumi will not guess. When it finishes, the outputs are what a team is handed:

```bash
pulumi stack output teamsOut
```

Per team: a role ARN to assume, a profile ARN to pass as the model id, and the two effective limits after the defaults are applied. No key. Any client with credentials in the account, a developer's SSO login, a CI job, an app's instance role, assumes `bedrock-meter-<team>` and calls through `<team>-nova`. (`teamRoles`, `teamProfiles` and `teamLimits` are the same values split up; the scripts read those.)

Open `meteredModelAccess.ts` and match the eight resources per team to the output:

- the inference profile `<team>-nova`, tagged `Team` and `CostCenter`. Its ARN is what callers pass as the model id;
- the role `bedrock-meter-<team>`. It may invoke that profile and nothing else; the second statement's condition blocks calling the model directly;
- two metric filters on the invocation log, matching the caller ARN on the role name, emitting input and output token counts;
- two alarms on output tokens, one over a minute and one over a day, each with an alarm action pointing at the cutoff function and a `CutoffRole` tag naming the role. Same metric, same stop; only the window and the threshold differ.

`scripts/test-call.sh` is optional: one call with the admin credentials, then the record it left in the log.

## 2. Call as each team and read the log

```bash
scripts/call.sh search 5
scripts/call.sh support 5
scripts/call.sh dev 5
scripts/show-log.sh
```

`call.sh` assumes the team role and sends Converse calls through the team's profile; it prints the command shape first. The first call after a `pulumi up` may wait a few seconds for IAM to propagate. `show-log.sh` prints the newest records: caller ARN, model, input and output tokens, no client changed. `scripts/metrics.sh search support dev` sums the per-team metrics for the last hour once they arrive, a minute or two behind the log.

## 3. Trip the alarm, then walk away from it

```bash
scripts/trip-alarm.sh search
```

It prints search's limits (3000 a minute, 500000 a day), then sends eight calls capped at 1000 output tokens each and keeps a running total, about 8000 in one minute. The alarm state it prints at the end is still `OK`: the alarm flips to `ALARM` 40 to 90 seconds after the last call, and the cutoff function acts in the same second. Carry on with step 4; step 5 comes back to it.

Optional, to see a limit that differs per team: `scripts/trip-alarm.sh dev` sends the same 8000 tokens and dev's alarm stays `OK`, because its line in the YAML says 20000.

## 4. Change the list, then the guardrails

The list is the whole interface. Add a fourth team to `teams` in `Pulumi.dev.yaml`:

```yaml
    - name: billing
      costCenter: cc-4004
```

```bash
pulumi preview
```

Exactly eight resources to create, one `MeteredModelAccess` with its children, nothing else touched. Change a number instead, say search's `dailyOutputTokens`, and the preview is one alarm to update with the old and new threshold. Put the file back; the next commands assume three teams.

Then the guardrails:

```bash
scripts/cross-team.sh
pulumi preview --policy-pack policy
pulumi config set demoViolations true
pulumi preview --policy-pack policy
pulumi config rm demoViolations
```

`cross-team.sh` assumes the support role and asks for the search profile: `AccessDenied`, from IAM, not from a convention. The first preview is clean. `demoViolations` adds an untagged profile and a wildcard invoke grant to the program; the second preview fails with two mandatory violations, `bedrock-profile-required-tags` and `bedrock-no-wildcard-invoke`, and nothing reaches AWS. The two rules are plain functions in `policy/rules.ts` with unit tests (`cd policy && npm test`).

The flag runs the pack from your machine. To have Pulumi Cloud run it on every preview and update of the stack, from any machine and any client, with no flag:

```bash
scripts/policy-enable.sh
```

It publishes the pack to your organization, creates a Policy Group named `bedrock-metering` that holds only this stack, and enables the pack in it (preventative mode). From then on plain `pulumi preview` prints a `Policies:` section and the stack's page in Pulumi Cloud shows the result of every run. Policy Groups need an organization on a paid edition; on the free edition keep the flag.

## 5. The stop

```bash
scripts/check-cutoff.sh search
```

If the alarm has not fired yet the script waits for it, printing the state every ten seconds. Then, in order, it shows: the alarm in `ALARM` with the cutoff function as its action; the one log line the function wrote; the inline policy `token-cutoff` now sitting on `bedrock-meter-search`; the Converse call, printed in full, run as search: `AccessDenied ... with an explicit deny`; and the same call run as support, which answers. One team over its limit, cut off; the other teams untouched. Open `cutoff/index.mjs`: about thirty lines, read the tag, put the Deny.

The daily alarm is the same stop on a longer clock. Its Sum only grows during the day, so the moment a team's output tokens since midnight UTC pass its cap, at 100001 or at 120000, it fires and the same function puts the same Deny. It then reads `ALARM` until the next UTC day, since the day's total cannot shrink. Nobody wants to watch a day go by, which is why the demo trips the minute.

The alarm stays in `ALARM` and the Deny stays on the role. Nothing lifts the stop on its own; a human does:

```bash
scripts/restore.sh search
```

It removes the inline policy, prints the command it used, and calls again as search; the first few attempts may still be denied while IAM propagates, about ten seconds. The minute alarm clears on the next normal minute of calls.

## 6. Tear down

```bash
scripts/teardown.sh
```

Runs `pulumi destroy` (a cutoff still in place does not block it), removes the demo flags from the config but keeps the teams, removes the stack, prints the checks (no application profiles, empty logging configuration, no log groups, no function), then deletes the ESC environment. The next run starts at step 0.

## Optional

- A budget per team: `pulumi config set enableBudget true`, `pulumi config set budgetEmail you@example.com`, `pulumi up`. The `Team` tag must be activated as a cost allocation tag first (up to a day) and the data arrives a day later, so it is not part of the live path.
- `pulumi config set model nova-lite` switches to the In-Region fallback if Nova 2 Lite is not available to the account.
- Lower a limit to make the alarm trip on ordinary traffic: `alarmOutputTokens: 500` on a team, or the default, then `pulumi up`.

## What is where

| Path | What |
| --- | --- |
| `Pulumi.dev.yaml` | Stack config: the ESC environment import, the region, the two default limits, the `teams` list with per-team overrides |
| `index.ts` | The program: config, invocation log, the cutoff, teams mapped over the component, dashboard, the two demo mistakes, the optional budget |
| `meteredModelAccess.ts` | One team: profile, role, two metric filters, two alarms |
| `tokenCutoff.ts`, `cutoff/index.mjs` | The stop: Lambda, its role and permission, the handler |
| `policy/` | The policy pack: `rules.ts` (two pure functions), `index.ts` (the pack), `test/` |
| `scripts/` | `setup`, `teardown`, `policy-enable` (optional, organization-wide enforcement), and the AWS-side helpers: `call`, `show-log`, `metrics`, `cross-team`, `trip-alarm`, `check-cutoff`, `restore`, `test-call`; `lib.sh` holds the shared bits |
| `diagrams/` | The architecture, the code map and the three stop lanes, PNGs and Mermaid sources |
| `slides/` | The deck |
