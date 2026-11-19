# Cost-aware infrastructure as code: tagging, budgets and FinOps guardrails with Pulumi

A hands-on workshop on keeping cloud cost visible and bounded from code. You
provision an AWS budget with an alert, deploy an untagged instance, then write
a Pulumi Policies pack that blocks an untagged or oversized `aws.ec2.Instance`
at `pulumi preview`, before anything reaches the bill.

> Cloud bills are read after the money is spent, and a tagging rule that lives
> in a wiki page is not a rule. This workshop moves both into code: a budget
> that alerts at 80% of its limit, and a policy pack that rejects an instance
> without a `CostCenter` tag or larger than `t3.large`.

## Sessions and speakers

Not scheduled yet. There is no event page, date, length or speaker. Planned
length is 60 to 90 minutes, audience is platform and DevOps engineers at an
intermediate level.

## What attendees learn

1. Provision an AWS budget with a monthly limit and an alert threshold as Pulumi code, with the SNS topic and email subscriber that deliver the alert.
2. Deploy an `aws.ec2.Instance` with no `CostCenter` tag and see that `pulumi up` accepts it.
3. Write a `ResourceValidationPolicy` in Python that requires the `CostCenter` tag, and watch `pulumi preview --policy-pack` fail on the untagged instance.
4. Add the tag and see the same preview pass.
5. Add a second rule that blocks instance types larger than `t3.large`, and see a distinct violation for `t3.2xlarge`.
6. Tell preventative enforcement (blocks the update) from audit-only enforcement, and know when each fits cost governance.
7. Tear everything down, including the budget, which AWS does not soft-delete.

## Layout

```
cost-aware-iac-finops-guardrails/
├── README.md                    this file
├── AGENTS.md                    build rules for agents working in this folder
├── 01-budget/                   step 1: aws.budgets.Budget + SNS topic and email subscriber
├── 02-untagged-instance/        step 2: t3.micro instance without a CostCenter tag
├── 03-tagging-policy/           step 3: policy pack requiring CostCenter (rules.py + unit tests)
├── 04-tagged-instance/          step 4: same instance with the tag; instanceType is config
└── 05-size-guardrail/           step 5: policy pack with the tag rule and the t3.large size rule
```

Each numbered folder is a standalone Pulumi project or policy pack with its own
`requirements.txt`. Nothing is imported across folders.

## Prerequisites

Participants:

- An AWS account with Billing console access, and credentials for `us-east-1` in your shell.
- A [Pulumi Cloud](https://app.pulumi.com/signup?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) account and `pulumi login`.
- Python 3.11 or newer, and basic familiarity with EC2.
- Pulumi CLI 3.264.0, the version the demo was built and checked with.

Presenter, before the session:

- Use an email address you can read for `alertEmail`. AWS sends a confirmation message and the SNS subscription delivers nothing until you confirm it.
- Confirm that the AWS account has fewer than two other budgets, or accept that extras may be billed.
- Rehearse the live steps once. The build machine had no AWS credentials, so steps 1, 2 and the teardown were never run against a real account (see below).

## Run the slides

The deck is built in a later step and will live in `slides/`.

## Run the demo

Once, per participant:

```bash
cd 01-budget
python3 -m venv venv && venv/bin/pip install -r requirements.txt
pulumi stack init dev
pulumi config set aws:region us-east-1
pulumi config set alertEmail you@example.com
pulumi config set limitAmount 50
```

Step 1, the budget (confirm the SNS email, then check the Billing console):

```bash
pulumi up
```

Step 2, the untagged instance (`pulumi up` succeeds):

```bash
cd ../02-untagged-instance
python3 -m venv venv && venv/bin/pip install -r requirements.txt
pulumi stack init dev
pulumi up
```

Step 3, the tagging policy. Install the pack's dependencies once, then preview with it. The preview fails with a mandatory `cost-center-tag-required` violation:

```bash
python3 -m venv ../03-tagging-policy/venv && ../03-tagging-policy/venv/bin/pip install -r ../03-tagging-policy/requirements.txt
pulumi preview --policy-pack ../03-tagging-policy
```

Step 4, the tagged instance. Replace the untagged instance and run the same pack, which now passes:

```bash
pulumi destroy
cd ../04-tagged-instance
python3 -m venv venv && venv/bin/pip install -r requirements.txt
pulumi stack init dev
pulumi preview --policy-pack ../03-tagging-policy
pulumi up --policy-pack ../03-tagging-policy
```

Step 5, the size guardrail. The preview fails with a second, distinct violation, `instance-size-guardrail`:

```bash
python3 -m venv ../05-size-guardrail/venv && ../05-size-guardrail/venv/bin/pip install -r ../05-size-guardrail/requirements.txt
pulumi config set instanceType t3.2xlarge
pulumi preview --policy-pack ../05-size-guardrail
pulumi config set instanceType t3.micro
pulumi preview --policy-pack ../05-size-guardrail
```

Both packs run at the `mandatory` enforcement level, which blocks the update.
An `advisory` level only warns. Auditing resources that already exist is a
separate feature of Pulumi Cloud, and is covered on a slide, not in code.

### Teardown and cost

```bash
pulumi destroy                      # in 04-tagged-instance
cd ../01-budget && pulumi destroy
```

Then open the Billing console and confirm the budget `cost-aware-iac-workshop`
is gone. AWS Budgets does not soft-delete, so a budget that is still listed was
not removed. Cost is one `t3.micro` for the length of the session plus the
budget; AWS Budgets does not charge for the first two budgets in an account.

### Offline checks

These need no AWS account, only Python and the pinned CLI:

```bash
cd 03-tagging-policy && python3 -m venv venv && venv/bin/pip install -r requirements.txt && venv/bin/python -m unittest test_policy.py
cd ../05-size-guardrail && python3 -m venv venv && venv/bin/pip install -r requirements.txt && venv/bin/python -m unittest test_policy.py
```

## What was verified

Checked on the build machine with Pulumi CLI 3.264.0, `pulumi-aws` 7.48.0 and
`pulumi-policy` 1.21.0, using a local state backend, dummy credentials,
`aws:skip*` provider settings and an `amiId` override:

- Rule unit tests pass: 3 for step 3, 5 for step 5.
- `pulumi preview` plans the five resources of step 1 and the instance of steps 2 and 4.
- `pulumi preview --policy-pack ../03-tagging-policy` on step 2 fails with the `cost-center-tag-required` violation; on step 4 it passes.
- `pulumi preview --policy-pack ../05-size-guardrail` passes for `t3.micro` and fails with `instance-size-guardrail` for `t3.2xlarge`.

Not checked, because there was no AWS account: `pulumi up` and `pulumi destroy`
for real, the budget in the Billing console, the alert email actually
arriving, the live `aws.ec2.get_ami` lookup, and removal of the budget after
teardown.

## Sources

Read on 2026-10-03:

- [Write a policy pack](https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops): `ResourceValidationPolicy`, enforcement levels, `--policy-pack`.
- [aws.budgets.Budget](https://www.pulumi.com/registry/packages/aws/api-docs/budgets/budget/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops): required fields, notification subscribers.
- Pins checked by installing them: `pulumi-aws==7.48.0` from PyPI and Pulumi CLI 3.264.0 from get.pulumi.com.
