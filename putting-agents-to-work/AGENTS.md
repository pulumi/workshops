# AGENTS.md

Instructions for any agent (or person) changing the infrastructure in this
repository. Claude Code reads this file through `CLAUDE.md`. Other agents that
support `AGENTS.md`, including Pulumi Neo, read it directly.

## What this repository is

`feedback-api` is a tiny feedback service on AWS, written in Pulumi Python:
a Lambda function behind a function URL, storing entries in one DynamoDB table.

| Path | What it is |
|---|---|
| `__main__.py`, `feedback_api/` | The Pulumi program |
| `app/handler.py` | The Lambda code |
| `scripts/smoke_test.py` | Writes an entry through the URL and reads it back |
| `policy/` | The Pulumi Policies pack (enforced by Pulumi Cloud) |
| `iam/`, `esc/`, `.claude/` | Your own permissions. People change these, never agents. |

Two stacks:

| Stack | Purpose | Deployed by |
|---|---|---|
| `YOUR_ORG/feedback-api/dev` | Testing | An agent or person, after a human merges the PR |
| `YOUR_ORG/feedback-api/prod` | Real traffic | An agent or person, after the PR is merged **and** a second person approves an ESC open request |

## How changes happen here

Every change goes through four steps, in this order. Don't skip one or merge two.

1. **Plan.** Find out what's deployed before proposing anything: use the
   Pulumi MCP server (`get-stacks`, `resource-search`,
   `get-policy-violations`) and read the code. Write down which stacks are
   affected and what the preview should show.
2. **Author.** Change the code on a branch, run `pulumi preview` against every
   affected stack with read-only credentials, and open a pull request with
   the preview diff and a plain-language explanation.
3. **Review.** A human reviews and merges the PR. Agents never approve or
   merge PRs.
4. **Deploy.** Only after the merge: preview again on `main`, run `pulumi up`
   on the named stack, run the smoke test, check the logs, and report.

## Stop and ask before anything that loses data

The DynamoDB table holds real entries. If any preview shows the table being
**replaced** or **deleted**, for example because `hash_key`, the attribute
list, or the table's logical name changed, **stop**. Don't open a PR and
don't deploy. Explain:

- what in the change causes the replacement
- that replacing the table deletes every stored entry
- a safer way to get the same result (for example, add a new attribute or a
  global secondary index instead of changing the key, or create a new table
  alongside and migrate the data first)

Then wait for a human to decide.

Stop for dev too: the dev table is disposable, but deleting it is still a
person's call.

The prod table is also locked from outside, so this doesn't depend on you
alone. It has Pulumi `protect=True` and AWS `deletion_protection_enabled=True`
(from `protectData: true` in `Pulumi.prod.yaml`). Pulumi Policies blocks any
prod change that turns either off or removes the table from the code, and the
deploy roles can't call `DeleteTable` on `feedback-prod-*` tables at all. A
change that would replace the prod table fails the preview with a "protected"
error: that's expected. Report it; don't try to remove the protection.

## Credentials

There are no static cloud keys in this repository, in stack config, or in
your shell. Cloud access comes from Pulumi ESC environments, each minting
short-lived AWS credentials through OIDC for one job:

| ESC environment | AWS role | Use it for | AWS refuses |
|---|---|---|---|
| `YOUR_ORG/infra-agents/read-only` | `feedback-agent-read` | `pulumi preview`, reading logs, the smoke test | Any change |
| `YOUR_ORG/infra-agents/dev-deploy` | `feedback-agent-dev-deploy` | `pulumi up --stack dev` | Anything named `feedback-prod-*`; creating IAM roles |
| `YOUR_ORG/infra-agents/prod-deploy` | `feedback-agent-prod-deploy` | `pulumi up --stack prod` | Anything named `feedback-dev-*`; creating IAM roles. Opening it needs a second person's approval. |

Run every cloud-touching command through `pulumi env run`:

```bash
pulumi env run YOUR_ORG/infra-agents/read-only -- pulumi preview --stack dev --diff
pulumi env run YOUR_ORG/infra-agents/dev-deploy -- pulumi up --stack dev --yes --diff
```

- **Never run `pulumi env open`.** It prints credentials into your context.
  `pulumi env run` passes them to the child process only.
- **Never use a deploy environment for a preview.** Preview with `read`.
- **Never use one stack's deploy environment for another stack.** AWS will
  refuse anyway.
- **Deploy environments only ever run `pulumi up`.** Never wrap the AWS CLI, a
  script, or anything else in `dev-deploy` or `prod-deploy`; use `read` for
  those. Every change to AWS goes through Pulumi, so it goes past Pulumi
  Policies. The hook enforces this, and the deploy roles can't delete tables
  at all.
- **Prod needs approval first.** Before deploying prod, request access and
  stop until a human confirms it was approved:

  ```bash
  pulumi env open-request YOUR_ORG/infra-agents/prod-deploy \
    --access-duration-seconds=30m --grant-expiration-seconds=2h \
    --reason "<PR link>: <one-line summary of the change>"
  ```

## Conventions

- **Names:** every resource name is `feedback-<stack>-<thing>`. Build it with
  `naming.name("thing")` from `feedback_api/naming.py`. The deploy roles can
  only write resources with that prefix, so a resource that ignores the
  convention fails to create.
- **Tags:** every taggable resource gets `tags=naming.tags()` (`app`,
  `environment`, `managed-by`). Pulumi Policies enforce this.
- **IAM:** don't create IAM roles or policies. The function uses the
  execution role in the `execRoleArn` config value. If it needs more access,
  say so in the PR. A person changes `iam/`.
- **Config, not constants:** stack-specific values (`memorySize`, `timeout`,
  `logRetentionDays`, `appVersion`) live in `Pulumi.<stack>.yaml` and are read
  with `pulumi.Config()`. Don't branch on the stack name in code.
- **Data table:** both locks come from the `protectData` config value, which
  is `true` in `Pulumi.prod.yaml` only. Don't change it. Pulumi Policies
  requires both locks on prod, whatever the config says.
- **Lambda limits:** memory at most 512 MB, timeout at most 30 s. Pulumi
  Policies enforce this.
- **Python:** 3.12, type hints, `ruff` clean.
- **Smoke test** after every deploy:
  `pulumi env run YOUR_ORG/infra-agents/read-only -- python scripts/smoke_test.py --stack <stack>`

## Policies

Pulumi Policies run server-side on both stacks during `pulumi preview` and
`pulumi up`. You don't run them yourself and you can't turn them off. Every rule
is mandatory:

| Rule | What it stops |
|---|---|
| `protect-data` | In prod: turning off the table's Pulumi protect, AWS deletion protection, or point-in-time recovery |
| `table-present` | In prod: removing the table from the code |
| `no-new-identities` | Declaring any IAM role, policy, or user. Access changes go through `iam/`, owned by a person. |
| `no-public-access` | Any Lambda permission open to everyone except the function URL's own pair |
| `lambda-cost-cap` | Lambda memory over 512 MB or a timeout over 30 s |
| `required-tags` | Functions, tables, or log groups without `naming.tags()` |

If a preview reports a violation:

1. Don't try to work around it: no `--policy-pack` overrides, and no
   restructuring the code just to dodge a check.
2. Fix the code so it complies. If you believe the policy is wrong for this
   case, stop and explain why, for a human to decide.

## Never

- Run `pulumi destroy`, `pulumi stack rm`, `pulumi state delete`, or
  `pulumi up --skip-preview`.
- Run `pulumi up` without an explicit `--stack`, or before the PR is merged.
- Approve, merge, or force-push a pull request.
- Set AWS credentials yourself (`aws configure`, `export AWS_ACCESS_KEY_ID=…`).
- Change files under `iam/`, `esc/`, `policy/`, or `.claude/`.

## Reporting

End every task with a short report:

- **Stack(s):** which stacks you read or changed
- **Change:** what the preview showed (creates / updates / replaces / deletes), in plain language
- **Policies:** any violations, and what you did about them
- **Result:** deployed or not, smoke test pass/fail, ERROR lines in the logs since the deploy
- **Links:** PR, Pulumi Cloud update URL
