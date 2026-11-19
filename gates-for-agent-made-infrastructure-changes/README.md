# Gates for agent-made infrastructure changes: mandatory policies, ESC approvals and an audit trail with Pulumi

A 90-minute hands-on workshop for platform and DevOps engineers who are being asked to let AI agents change cloud infrastructure. You put three independent controls between an agent and production: Pulumi policies that block a non-compliant change, a Pulumi ESC approval that gates the agent's cloud credentials, and a Pulumi Cloud audit log that records who did what. Pulumi Neo approval modes are the agent-side control.

Everything runs in Python on AWS in eu-west-1.

## What you'll build

- A baseline Pulumi IaC stack (`agent-gates`) with one S3 bucket, whose AWS credentials come from a Pulumi ESC environment through OIDC.
- A policy pack with three mandatory rules for S3 buckets: owner and change-ref tags, a public access block, and server-side encryption.
- A scripted "agent" that adds a second bucket, is blocked by the policy pack, fixes the change, and then is blocked again by an ESC approval until a reviewer approves.
- An audit trail you read in the Pulumi console and export with the CLI, mapped back to the steps.

## Prerequisites

- Python 3.12, the Pulumi CLI 3.272.0, the AWS CLI and `jq` (the OIDC role script uses both).
- An AWS account where you can create S3 buckets and an IAM OIDC role in eu-west-1.
- A Pulumi Cloud org on an edition that includes ESC approvals and audit logs (Pro or Enterprise per the docs) and policy enforcement. Without one you can still run steps 1 to 3 offline; follow steps 4 to 7 in the presenter's org.
- Two Pulumi Cloud identities for the full run: the agent and a reviewer. One person can play both roles with self-approval (step 4), at the price of the separation of duties.
- Optional: access to Pulumi Neo for step 6.

Every script reads the org from `PULUMI_ORG`:

```bash
export PULUMI_ORG=<your-org>
```

## Cost

The demo creates two small S3 buckets and an IAM role. The cost is a few cents if you run step 9 the same day. Run the teardown in the order shown, then check the AWS console.

## Layout

```
.
├── lib.sh                      shared names and helpers
├── 01-baseline/                stack, ESC environment, OIDC role
├── 02-policy-pack/             the policy pack and its tests
├── 03-agent-change/            the scripted agent's two attempts
├── 04-approval-gate/           ESC open approval
├── 05-review-and-apply/        reviewer steps and the agent's apply
├── 06-neo-approval-modes/      Neo approval modes
├── 07-audit-trail/             audit log export and timeline
├── 08-limits-drill/            what the open gate cannot cover
└── 09-teardown/                removal, in order
```

## Step by step

Steps marked **console** have no CLI or API route in the docs read for this workshop, so the script prints the console steps instead of running them.

### 01 Baseline

Create the OIDC role, the ESC environment `agent-gates/aws-prod` and the stack, then deploy the baseline bucket.

```bash
01-baseline/oidc/create-oidc-role.sh     # prints ROLE_ARN=...
export ROLE_ARN=<the printed ARN>
01-baseline/setup.sh
```

`setup.sh` runs `pulumi env init` and `pulumi env edit` on `$PULUMI_ORG/agent-gates/aws-prod`, checks that the credentials resolve with `pulumi env run` (values stay hidden), selects or creates the stack `agent-gates`, asks before `pulumi config env add agent-gates/aws-prod`, then runs `pulumi preview` and `pulumi up`. To return to the baseline later, run `01-baseline/reset.sh`.

The program uses the Python SDK's `BucketV2`, `BucketServerSideEncryptionConfigurationV2` and `BucketVersioningV2`, so previews print three deprecation warnings. They are expected.

### 02 Policy pack

Three mandatory rules in `02-policy-pack/rules.py`: `s3-required-tags`, `s3-public-access-block` and `s3-server-side-encryption`. Run the unit tests, then publish and enable the pack.

```bash
cd 02-policy-pack && python3 -m venv venv && venv/bin/pip install -r requirements.txt pytest
venv/bin/python -m pytest tests
cd ..
02-policy-pack/publish.sh
```

`publish.sh` runs `pulumi policy publish $PULUMI_ORG` and, after a prompt, `pulumi policy enable $PULUMI_ORG/agent-gates-s3 latest`. Set `POLICY_GROUP` to enable the pack in a named policy group; without it the pack goes to the org's default group.

### 03 The agent's change is blocked

```bash
03-agent-change/agent.sh
```

The script sets `agentChange` to `noncompliant` and runs `pulumi preview`. The new bucket has no tags, no public access block and no encryption, so the preview fails with the three rule names. If your org has no policy group for the stack, pass the local pack instead:

```bash
POLICY_PACK_DIR=$PWD/02-policy-pack 03-agent-change/agent.sh
```

Then the agent fixes the change:

```bash
03-agent-change/fix.sh
```

`fix.sh` sets `agentChange` to `fixed` and previews again. The preview passes, but applying it still needs the agent's AWS credentials, which come from the ESC environment.

### 04 Approval gate

**Console:** add an Open approval ruleset to `agent-gates/aws-prod`.

```bash
04-approval-gate/ruleset-steps.sh        # prints the console steps
```

Then the agent asks for access:

```bash
04-approval-gate/request-open.sh
```

This runs `pulumi env open-request $PULUMI_ORG/agent-gates/aws-prod --reason ... --access-duration-seconds 30m --grant-expiration-seconds 4h`. Override with `REASON`, `ACCESS_DURATION` and `GRANT_EXPIRATION`. The request stays pending in the environment's Approvals tab and the stack is unchanged.

With one identity, run `04-approval-gate/self-approval.sh` instead. It prints the console step that enables self-approval, then opens the same request.

### 05 Review and apply

**Console:** the reviewer reads the preview diff, selects Review changes, approves, then selects Apply. Approval alone grants nothing.

```bash
05-review-and-apply/review-steps.sh      # prints the reviewer steps
05-review-and-apply/agent-up.sh          # the agent, inside the access duration
05-review-and-apply/verify-bucket.sh <bucket-name>
```

`agent-up.sh` runs `pulumi preview` and `pulumi up` on the stack. `verify-bucket.sh` runs `aws s3api get-bucket-tagging`, `get-bucket-encryption` and `get-public-access-block` through `pulumi env run`. Take the bucket name from `pulumi stack output`.

### 06 Neo approval modes

**Console:** start a Pulumi Neo task on the stack in Review mode, then Balanced, then with the read-only permission mode, using the same prompt from `06-neo-approval-modes/task-prompt.txt`. The folder's own README lists what to expect in each run.

A terminal equivalent exists:

```bash
06-neo-approval-modes/neo-cli.sh manual      # console name: Review
06-neo-approval-modes/neo-cli.sh balanced
06-neo-approval-modes/neo-cli.sh readonly
```

The script runs `pulumi neo --org ... --stack ... --cwd ... --approval-mode ... --permission-mode ...` with the task prompt. Auto mode is not offered. Neo acts with your own Pulumi permissions, so the open ruleset from step 4 still applies.

### 07 Audit trail

Open Settings, Audit Logs in the Pulumi console as an org admin and filter by the agent identity. Then export the same window:

```bash
07-audit-trail/export.sh <start-unix> [end-unix]
python3 07-audit-trail/timeline.py 07-audit-trail/audit.json
```

`export.sh` runs `pulumi org audit-log list --org ... --start-time ... --all --output json` (an experimental command; the console export is the fallback). Set `AGENT_LOGIN` to filter by user. `timeline.py` accepts the JSON or CSV export and maps events to steps 3 to 6. The audit log has no event for opening an environment request, so the request itself appears only in the Approvals tab.

### 08 Limits drill

```bash
08-limits-drill/limits-drill.sh explain
08-limits-drill/limits-drill.sh user
```

`explain` prints why an open grant cannot gate git-push or pull-request deployments (they run with an ephemeral stack token) and the workaround from the gated deployments page: a dedicated access token principal, approved ahead of each run. `user` queues a user-initiated deployment with `pulumi deployment run update`; it needs deployment settings on the stack. Without an active grant the run fails; it does not wait.

### 09 Teardown

```bash
09-teardown/teardown.sh
```

Every destructive step asks first. The order matters: disable the Open ruleset (**console**), `pulumi destroy`, `pulumi stack rm`, `pulumi env remove`, `pulumi policy disable` and `pulumi policy remove`, delete the policy group (**console**) and the IAM role, then check that no buckets remain. Set `POLICY_GROUP`, `POLICY_PACK` and `ROLE_NAME` if you changed the defaults.

## Sources

Read 2026-10-23.

- [Pulumi Neo permissions model](https://www.pulumi.com/docs/ai/concepts/neo/permissions/)
- [Pulumi Neo in the Pulumi CLI](https://www.pulumi.com/docs/ai/neo/pulumi-cli/)
- [Approvals (Pulumi ESC)](https://www.pulumi.com/docs/esc/concepts/approvals/)
- [Requiring Deployment Approval](https://www.pulumi.com/docs/deployments/guides/gated-deployments/)
- [Enforce policies in CI/CD](https://www.pulumi.com/docs/discovery-governance/guides/policies-in-ci-cd/)
- [Write a policy pack](https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/)
- [Audit Logs](https://www.pulumi.com/docs/administration/concepts/audit-logs/)
- [Audit log events reference](https://www.pulumi.com/docs/administration/reference/audit-log-events/)
- [pulumi org audit-log](https://www.pulumi.com/docs/iac/cli/commands/pulumi_org_audit-log/)
- [pulumi env open-request](https://www.pulumi.com/docs/iac/cli/commands/pulumi_env_open-request/)
- [Configuring OIDC for AWS (Pulumi ESC)](https://www.pulumi.com/docs/esc/environments/configuring-oidc/aws/)
- KubeCon + CloudNativeCon North America 2026 [session 1250982](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/?id=1250982) and [session 1334820](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/?id=1334820)
- devopsdays Boston 2026, ["We Gave the Agent Production Credentials"](https://devopsdays.org/events/2026-boston/program/anish-puthuraya)
- [neo-in-a-docker-sandbox](https://github.com/pulumi/workshops/tree/main/neo-in-a-docker-sandbox), the layout reference for this folder
