# Cost-aware infrastructure as code

A budget, a tag, and a size limit — all as Pulumi code, all checked before anything reaches the cloud bill.

> Enforce cost visibility and spending guardrails as code: an AWS budget with an alert threshold, a mandatory cost-allocation tag on every resource, and a Pulumi Policies check that blocks an untagged or oversized instance before deployment. TODO(presenter): link to this workshop's event page once scheduled.

## Sessions and speakers

| Session | Speaker | Company |
| --- | --- | --- |
| Cost-aware infrastructure as code | TODO(presenter) | TODO(presenter) |

- **TODO(presenter)** — TODO(presenter role), TODO(presenter company)

## What attendees learn

1. How to provision an AWS budget with a spending limit and an alert threshold as Pulumi code, instead of console clicks.
2. How to enforce a mandatory cost-allocation tag on every resource in a stack with a Pulumi Policies pack.
3. How a `ResourceValidationPolicy` blocks `pulumi preview`/`pulumi up` for a resource that skips the tag, before it ever reaches the cloud.
4. The difference between a preventative (blocking) guardrail and an audit-only one, and why this workshop's guardrails are preventative by default.

## Layout

```
cost-aware-iac-finops-guardrails/
├── README.md                this file
├── AGENTS.md                conventions for agents (and humans) editing this folder
├── 01-budget/                Pulumi project: an aws.budgets.Budget with a monthly limit and an 80%-threshold alert
├── 02-untagged-instance/     Pulumi project: an EC2 instance with no CostCenter tag — the gap this workshop closes
├── 03-tagging-policy/        Pulumi Policies pack: requires a CostCenter tag on every EC2 instance
├── 04-tagged-instance/       Pulumi project: the fixed instance, CostCenter tag added, instance size as config
└── 05-size-guardrail/        Pulumi Policies pack: the tagging rule plus a max-instance-size guardrail
```

The numbered folders follow the demo flow: provision the budget (`01`), show the ungoverned instance (`02`), write the tagging policy and watch it block that instance (`03`), fix the instance (`04`), then add a second, independent guardrail on top (`05`). There is no `06-` folder — teardown is a "Run the demo" step, not a folder, since destroying `01` and `02`/`04` needs no new code.

## Prerequisites

- A [Pulumi Cloud](https://app.pulumi.com/signup/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) account, or `pulumi login --local` for a self-contained run.
- The Pulumi CLI, pinned to **3.264.0** for this demo. TODO(presenter): confirm this version is installed (`pulumi version`); this build machine had 3.263.0 available and could not confirm 3.264.0 exists on the release channel — see Sources.
- Python ≥ 3.9 and `pip`, for the demo projects and the policy packs (each folder gets its own virtual environment per `PulumiPolicy.yaml`/`Pulumi.yaml`).
- AWS credentials for the account this runs against (`aws configure`, or an [environment variable pair](https://www.pulumi.com/registry/packages/aws/installation-configuration/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)), and permission to create an `aws.budgets.Budget` and `aws.ec2.Instance` in `us-east-1`. **The demo has not been run against a live AWS account** — see Sources and the pull request for what that leaves unverified.
- A confirmable email address for the budget's alert subscription, set with `pulumi config set alertEmail <address>` in `01-budget` before the session (AWS Budgets requires the subscriber to confirm the subscription before it delivers).
- A real AMI ID for `us-east-1`, set with `pulumi config set amiId <ami-id>` in `02-untagged-instance` and `04-tagged-instance` before the session:
  ```bash
  aws ssm get-parameter \
    --name /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 \
    --query 'Parameter.Value' --output text --region us-east-1
  ```

## Run the slides

The slides for this workshop have not been built yet. This branch carries the demo code only; a follow-up run builds `slides/` from this demo's exact flow and commands.

## Run the demo

The demo is five steps in roughly 45–60 minutes: provision a budget, deploy an ungoverned instance, write a policy that blocks it, fix the instance, then layer on a size guardrail. Set up config once per folder, then run each step's `pulumi up`/`preview` as often as you like:

```bash
# 0. once per folder: install dependencies into that folder's venv
for dir in 01-budget 02-untagged-instance 03-tagging-policy 04-tagged-instance 05-size-guardrail; do
  (cd "$dir" && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt)
done

# 1. the budget, provisioned as code
cd 01-budget
pulumi stack init dev
pulumi config set alertEmail <your-confirmable-email>
pulumi up                                          # creates the monthly budget with an 80% alert threshold
cd ..

# 2. the ungoverned instance — deploys cleanly, no policy pack in place
cd 02-untagged-instance
pulumi stack init dev
pulumi config set amiId <ami-id-for-us-east-1>
pulumi up                                          # succeeds; no CostCenter tag
cd ..

# 3. the tagging policy — same instance, now blocked
cd 02-untagged-instance
pulumi preview --policy-pack ../03-tagging-policy  # reports the missing-CostCenter violation
cd ..

# 4. the fixed instance — same shape, CostCenter tag added
cd 04-tagged-instance
pulumi stack init dev
pulumi config set amiId <ami-id-for-us-east-1>
pulumi preview --policy-pack ../03-tagging-policy  # clean: the tag is present
pulumi up
cd ..

# 5. the size guardrail — tagging rule plus a max-instance-size rule
cd 04-tagged-instance
pulumi config set instanceType t3.2xlarge
pulumi preview --policy-pack ../05-size-guardrail   # blocked: oversized, not just untagged
pulumi config set instanceType t3.micro
pulumi preview --policy-pack ../05-size-guardrail   # clean again
cd ..

# 6. teardown — reverse order, budget last since it has no dependents
cd 04-tagged-instance && pulumi destroy && cd ..
cd 02-untagged-instance && pulumi destroy && cd ..
cd 01-budget && pulumi destroy && cd ..            # AWS Budgets does not soft-delete; confirm it is gone
```

Cost note: every resource here is short-lived and small — a `t3.micro` instance for the length of the demo, and a budget (the first two budgets per AWS account are free of charge). Tear down promptly after the session regardless; a budget left in place keeps alerting on activity in the account.

## Sources

- Workshop topic proposal document (third edition), 2026-09-23.
- `aws.budgets.Budget` resource, Pulumi AWS provider registry (`pulumi-aws` v7.48.0), read 2026-09-24: https://www.pulumi.com/registry/packages/aws/api-docs/budgets/budget/ — `budget_type` and `time_unit` are the only schema-required fields; `limit_amount` and a `notifications` block are added by this demo, not required by the resource itself.
- Pulumi Policies authoring guide, read 2026-09-24: https://www.pulumi.com/docs/insights/policy/policy-packs/authoring/ — the `ResourceValidationPolicy` / `PolicyPack` pattern this workshop's policy packs follow.
- Pulumi Policies naming, read 2026-09-24: the CrossGuard product page now redirects to https://www.pulumi.com/docs/discovery-governance/concepts/policy-as-code/ and does not use the name "CrossGuard" anywhere in current docs. This workshop uses **Pulumi Policies** (product) and **policy pack** (the `--policy-pack` bundle) throughout; see the pull request for where the original brief's "CrossGuard" framing was dropped.
- CLI and provider version pins (Pulumi CLI 3.264.0, `pulumi-aws` 7.48.0): this build machine had Pulumi CLI 3.263.0 available and could not confirm a 3.264.0 release exists; `pulumi-aws` 7.48.0 resolves on PyPI as of 2026-09-24. See the pull request for the delta.
