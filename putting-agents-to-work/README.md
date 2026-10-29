# feedback-api: a governed agent harness

The demo for the webinar: a tiny AWS service that three Claude Code agents
(planner, author, deployer) change under the same controls a person would
face: short-lived scoped credentials from Pulumi ESC, IAM roles that refuse
anything outside the job, Pulumi Policies, and a human approval before prod.

```
Pulumi.yaml, __main__.py      the app: Lambda function URL -> Lambda -> DynamoDB
feedback_api/naming.py        naming and tagging conventions
app/handler.py                Lambda code (POST an entry, GET it back)
scripts/smoke_test.py         writes an entry through the URL and reads it back
scripts/show_access.sh        presenter demo: same command, different credentials
policy/                       Pulumi Policies pack: Lambda cost cap + required tags
iam/                          OIDC trust, agent roles, Lambda execution roles (a person deploys this)
esc/                          read, dev-deploy, prod-deploy environment definitions
AGENTS.md                     the rules every agent follows (Claude Code, Neo, anyone)
CLAUDE.md, .mcp.json, .claude/  Claude Code: subagents, /ship-change, guardrail hook, settings
```

## Who can do what

| ESC environment | AWS role | Can | AWS refuses |
|---|---|---|---|
| `infra-agents/read` | `feedback-agent-read` | Preview, read logs, run the smoke test | Any change |
| `infra-agents/dev-deploy` | `feedback-agent-dev-deploy` | Change `feedback-dev-*`; give Lambda the `feedback-dev-exec` role | Anything `feedback-prod-*`; creating or passing any other IAM role |
| `infra-agents/prod-deploy` | `feedback-agent-prod-deploy` | Change `feedback-prod-*` | Anything `feedback-dev-*`; and nobody can open this environment until a second person approves |

| Agent | Tools | Credentials | Produces |
|---|---|---|---|
| planner | Read files, Pulumi MCP (read-only) | None | `work/plan.md` |
| author | Edit files, shell, Pulumi Registry lookups | `read` | A PR with the preview |
| deployer | Read files, shell | `read`, then `<stack>-deploy` | `work/deploy-report.md` |

Three layers, from weakest to strongest:

1. **Subagent tool lists**: the planner has no shell and no write tools.
2. **The guardrail hook** (`.claude/hooks/guardrails.py`) blocks unsafe
   commands and explains why: deploying outside the right environment,
   previewing with deploy credentials, `pulumi env open`, destroy, skipping
   the preview, pushing to `main`.
3. **AWS and Pulumi Cloud**: IAM roles that trust exactly one ESC environment
   and only write their own stack's resources; Pulumi Policies on every
   preview and update; an ESC open approval in front of prod. These apply
   whatever the agent does, and they're the same for a person.

## Setup

You need the Pulumi CLI (v3.261+), Python 3.12, Claude Code, `gh`, the AWS CLI,
a sandbox AWS account where you're an admin (for step 3 only), and a second
Pulumi account to approve prod access.

**1. Repo.** Replace `YOUR_ORG` with your Pulumi org, push to GitHub, and
protect `main` (require a PR with one approving review).

```bash
grep -rl YOUR_ORG . | xargs sed -i '' 's/YOUR_ORG/<your-org>/g'   # macOS; drop '' on Linux
git init && git add . && git commit -m "chore: feedback-api harness"
gh repo create <your-org>/feedback-api --private --source . --push
```

**2. Tokens.** `pulumi login` as yourself for the CLI. Separately, create an
**organization token** with a stack-read role for the MCP server (step 8).

**3. IAM (you, with admin credentials, not an agent).**

```bash
cd iam && python3 -m venv venv && venv/bin/pip install -r requirements.txt
pulumi stack init <your-org>/infra-agents-iam/main
pulumi config set pulumiOrg <your-org>
pulumi config set aws:region us-west-2
# If the account already has an api.pulumi.com/oidc provider:
# pulumi config set existingOidcProviderArn arn:aws:iam::<acct>:oidc-provider/api.pulumi.com/oidc
pulumi up
pulumi stack output --json   # role ARNs for step 4, exec role ARNs for step 6
cd ..
```

**4. ESC environments.** Put the three agent role ARNs into `esc/*.yaml`
(replacing `123456789012`), then:

```bash
pulumi env init <your-org>/infra-agents/read-only        --file esc/read.yaml
pulumi env init <your-org>/infra-agents/dev-deploy  --file esc/dev-deploy.yaml
pulumi env init <your-org>/infra-agents/prod-deploy --file esc/prod-deploy.yaml
pulumi env run <your-org>/infra-agents/read-only -- aws sts get-caller-identity   # shows feedback-agent-read
```

**5. Prod approval.** On `prod-deploy`, add an **Open** approval ruleset:
the second account as approver, 1 approval, self-approval **off**. Test it:
`pulumi env run …/prod-deploy -- aws sts get-caller-identity` should fail;
then `pulumi env open-request …/prod-deploy --reason test`, approve and apply
from the second account, and run it again.

**6. App stacks and first deploy (you, not an agent).**

```bash
python3 -m venv venv && venv/bin/pip install -r requirements.txt
for s in dev prod; do
  pulumi stack init <your-org>/feedback-api/$s
  pulumi config set --stack $s aws:region us-west-2
  pulumi config set --stack $s execRoleArn <${s}_exec_role_arn from step 3>
  # If your org blocks public endpoints:  pulumi config set --stack $s publicUrl false
done
pulumi env run <your-org>/infra-agents/dev-deploy -- pulumi up --stack dev
pulumi env run <your-org>/infra-agents/read-only -- python scripts/smoke_test.py --stack dev
# prod: open request -> approval -> same two commands with prod-deploy / --stack prod
```

**7. Policies.** `cd policy && pulumi policy publish <your-org>`. In Pulumi
Cloud, create a **preventative** policy group with `feedback-api/dev` and
`feedback-api/prod` and add `feedback-api-guardrails`. (Mandatory enforcement
managed centrally depends on your Pulumi Cloud edition.) Check it: set
`memorySize` to 3008 on dev, run a read-only preview, and it should fail on
`lambda-cost-cap`. Set it back.

**8. Claude Code.** Run `python3 .claude/hooks/test_guardrails.py` (expect
`ok: 7 allowed, 15 blocked`). Start `claude` in the repo, trust the project
settings, approve the `pulumi` MCP server, run `/mcp` → **pulumi** and paste the
organization token. `/agents` should list planner, author, and deployer.

## Rehearsal: the six demo moments

| # | Moment | How |
|---|---|---|
| 1 | **Scoped access** (before any agent) | `scripts/show_access.sh <your-org>`: the same write is denied under `read`, allowed on dev and denied on prod under `dev-deploy`, and blocked under `prod-deploy` until approved. |
| 2 | **Context** | "Use the planner to tell me what's deployed in dev and prod." It uses the MCP server, runs nothing, and returns a plan. |
| 3 | **Change, preview, PR** | `/ship-change accept an optional category on new entries and bump appVersion to 1.1.0 in dev`. The author previews with read-only credentials and opens a PR; you review and merge. |
| 4 | **Careful, not fast** | "Change the table's key from `id` to `entryId`." The preview shows the table being **replaced**; the agent stops, says every entry would be lost, and proposes a safer path. No PR. |
| 5 | **Policy** | "It's slow, give it 3 GB of memory." The preview fails on `lambda-cost-cap` server-side; the agent explains the cap and proposes a compliant change. |
| 6 | **Deploy, test, report, and the prod gate** | After the merge, the deployer deploys dev, runs the smoke test, checks the logs for ERROR, and reports. For prod it stops at the open request until the second account approves. Show the update in Pulumi Cloud and `feedback-agent-*-deploy` sessions in CloudTrail. |

**Reset between run-throughs:** close leftover PRs and branches, reset `main`
to the baseline commit, redeploy dev and prod yourself, and clear `work/`.

## Known limits (worth saying out loud)

- **All three subagents share your Pulumi CLI login.** The tool lists and hook
  keep each in its lane, but they're Claude Code settings, not separate
  identities. For a true split, run the deployer as its own process with its
  own token (for example in CI after merge).
- **Bash is broad.** The author and deployer need it for `pulumi`, `git`, and
  `gh`. The hook covers the dangerous commands; AWS and Pulumi Cloud enforce
  the rest.
- **`ReadOnlyAccess` can read data,** including DynamoDB items. Fine for a demo
  account; use a narrower policy in production.
- **Dev and prod share one AWS account.** Everything here is scoped by name,
  so that's safe for the demo. In production, separate accounts are still the
  stronger boundary.

## Tested so far

Run in a sandbox without AWS access: a real `pulumi preview` of the app with
the policy pack (7 resources; the pack blocks 3008 MB memory and missing
tags), the policy unit tests, the guardrail tests, the IAM program under
Pulumi's mock engine (each role trusts only its own environment; dev's write
policy has nothing for prod and no role creation), and the Lambda handler plus
smoke test against a local stand-in for the URL. Not yet tested: anything
against real AWS or Pulumi Cloud, which is what the setup steps above cover.

