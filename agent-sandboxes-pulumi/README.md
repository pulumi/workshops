# Disposable Cloud Sandboxes for AI Agents: One Pulumi Stack per Task

A 90-minute workshop on giving every AI agent task its own disposable AWS environment. A Python
program built on the Pulumi Automation API creates one stack per task, hands the agent a narrow
role through Pulumi ESC, and destroys the stack when its time limit passes.

> An agent with your long-lived cloud key is a production incident waiting for a prompt. A sandbox
> that is shared, never cleaned up and wide open is the same incident, slower. This workshop builds
> the other kind: one environment per task, scoped, short-lived and deleted on schedule.
>
> The workshop page has not been published yet.

## Sessions and speakers

| Session | Date | Length |
|---|---|---|
| TBD | TBD | 90 min |

- Speakers: TBD

## What attendees learn

1. Create and tear down a stack per agent task from Python with the Automation API.
2. Issue 1-hour AWS credentials from a Pulumi ESC environment instead of storing keys.
3. Confine a sandbox with an IAM role plus permissions boundary and show a denied cross-sandbox read.
4. Enforce sandbox rules with a Pulumi Policies pack at preview time.
5. Expire sandboxes with a reaper that reads stack tags and destroys stacks past their expiry.

## Layout

```
agent-sandboxes-pulumi/
├── README.md                 this file
├── AGENTS.md                 conventions for agents (and humans) editing this folder
├── .gitignore                ignores working docs, state and virtualenvs
├── .shellcheckrc             shellcheck settings for the scripts
├── requirements.txt          pinned Python dependencies for every step
├── lib.sh                    shared names and settings, sourced by the scripts
├── 01-setup/                 step 1: OIDC provider and the base role agent-sandbox-provisioner
│   ├── setup.sh              creates the provider and role
│   ├── trust-policy.json.tmpl   trust policy for Pulumi Cloud OIDC
│   └── provisioner-policy.json.tmpl   what the base role may do
├── 02-esc/                   step 2: the ESC environment agent-sandboxes/aws
│   ├── create-env.sh         creates the environment and proves the credentials are temporary
│   └── aws.yaml.tmpl         aws-login with OIDC, 1h
├── 03-boundary/              step 3: the permissions boundary policy
│   ├── Pulumi.yaml           project file
│   ├── __main__.py           the aws.iam.Policy
│   └── apply.sh              deploys it and stores the ARN
├── 04-sandbox/               step 4: the sandbox program for one task
│   ├── Pulumi.yaml           project file
│   ├── sandbox.py            bucket, role, scoped policy, tags
│   └── __main__.py           runs the same function for a plain pulumi preview
├── 05-orchestrator/          step 5: one stack per task, from the Automation API
│   └── orchestrator.py       spawn and list
├── 06-agent/                 step 6: the simulated agent
│   └── agent.py              assumes its role, writes, then tries a cross read
├── 07-policy/                step 7: the Pulumi Policies pack
│   ├── PulumiPolicy.yaml     pack file
│   ├── requirements.txt      pack dependency
│   └── __main__.py           role-has-boundary and tags rules
├── 08-reaper/                step 8: expiry
│   └── reaper.py             destroys stacks past their expires-at tag
├── 09-teardown/              step 9: cleanup
│   ├── teardown.sh           removes everything in reverse order
│   └── leftovers.sh          lists leftover buckets, roles and policies
└── slides/                   the deck (added on this branch after the demo code)
```

## Prerequisites

Participants:

- Python 3.12, Pulumi CLI 3.268.0, the AWS CLI.
- A Pulumi Cloud account. The Individual edition is enough.
- An AWS sandbox account with admin rights for setup. Not production.
- This folder cloned before the session.

Presenter, in addition: run steps 1 and 2 beforehand so the OIDC setup does not eat session time, and
keep a recorded fallback of step 2.

## Run the demo

Once only:

```bash
cd agent-sandboxes-pulumi
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export PULUMI_ORG=<your-pulumi-org>     # your user name on the Individual edition
export AWS_REGION=eu-west-1             # admin credentials for the sandbox account in the shell
```

| Step | Command | End state |
|---|---|---|
| 1 | `01-setup/setup.sh` | the base role `agent-sandbox-provisioner` exists; `pulumi whoami` works |
| 2 | `02-esc/create-env.sh` | `pulumi env run $PULUMI_ORG/agent-sandboxes/aws -- aws sts get-caller-identity` works; no static key on the machine |
| 3 | `03-boundary/apply.sh` | the boundary ARN is in `.state/boundary-arn` |
| 4 | `cd 04-sandbox && pulumi stack init demo && pulumi config set taskId a && pulumi config set boundaryArn "$(cat ../.state/boundary-arn)" && pulumi preview` | 5 resources to create for one task |
| 5 | `python 05-orchestrator/orchestrator.py spawn task-a task-b task-c --ttl-minutes 30` | three stacks, three buckets, three roles in Pulumi Cloud |
| 6 | `python 06-agent/agent.py task-a task-b` | write to its own bucket succeeds, read of the other returns AccessDenied |
| 7 | `python 05-orchestrator/orchestrator.py spawn bad-task --noncompliant --policy-pack 07-policy` | the preview fails and names the policy |
| 8 | `python 05-orchestrator/orchestrator.py spawn short --ttl-minutes 2`, wait, then `python 08-reaper/reaper.py` | stack `sandbox-short` and its bucket are gone; the other three remain |
| 9 | `09-teardown/teardown.sh` | `09-teardown/leftovers.sh` lists nothing |

Between runs: `09-teardown/teardown.sh`, then start again at step 1. Steps 4 to 8 can be repeated
without teardown; the stack name is derived from the task name, so reuse a name only after the reaper
or a destroy has removed it.

Cost: S3 buckets and IAM roles at demo volume, with no compute and no NAT gateway. Empty buckets and
a few small objects fall in the cents range; S3 storage prices are on the AWS S3 pricing page. IAM has
no charge. TTL stacks in Pulumi Cloud need the Pro or Enterprise edition; the demo uses its own reaper.

Teardown: step 9, then confirm that `aws s3 ls` shows no `agent-sandbox-*` bucket.

## Run the slides

The deck lives in `slides/` and is added on this branch after the demo code.

## Sources

Read on 2026-10-10 unless noted.

- Pulumi ESC, configuring OIDC for AWS: https://www.pulumi.com/docs/esc/environments/configuring-oidc/aws/
- Pulumi ESC, aws-login: https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/aws-login/
- Pulumi Automation API: https://www.pulumi.com/docs/iac/guides/building-extending/automation-api/
- Pulumi Policies: https://www.pulumi.com/docs/discovery-governance/concepts/policy-as-code/
- TTL stacks: https://www.pulumi.com/docs/deployments/concepts/ttl/
- Registry: aws.iam.Role, aws.iam.Policy, aws.iam.RolePolicyAttachment, aws.s3.BucketV2 under https://www.pulumi.com/registry/packages/aws/api-docs/
- Amazon S3 pricing: https://aws.amazon.com/s3/pricing/
- Python SDK `pulumi.automation`: `list_stacks` and `remove_stack` exist on `LocalWorkspace` in pulumi 3.268.0 (checked by importing the installed package).
