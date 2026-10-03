# AGENTS.md

Rules for agents working in `cost-aware-iac-finops-guardrails/`.

## Shape

Five numbered folders, each a standalone Pulumi project (01, 02, 04) or policy
pack (03, 05) with its own `requirements.txt` and venv. Nothing is imported
across folders. The tagging rule is deliberately duplicated in `03` and `05`.

## Rules

- AWS only, `us-east-1`, Python. Pins: Pulumi CLI 3.264.0, `pulumi-aws` 7.48.0.
- Policy packs are `ResourceValidationPolicy` at `EnforcementLevel.MANDATORY`. The validate function reads `args.name` (the resource name), not `args.resource_name`, which does not exist.
- Rule logic lives in `rules.py` and is covered by `test_policy.py`. Change a rule and its tests together.
- The instance programs use `aws.ec2.get_ami` unless `amiId` is set. An offline `pulumi preview` needs `amiId`, because the lookup calls AWS and fails before the instance is registered.
- `04-tagged-instance` exposes `instanceType` as config so step 5 can set `t3.2xlarge`. Keep the default `t3.micro`.
- The budget's alert threshold is 80% and delivery goes through an SNS topic plus an email subscriber. `alertEmail` is required config and is not committed.
- Product names: Pulumi Policies, Pulumi Cloud, Pulumi ESC. Not "CrossGuard", not "Insights".

## Checks

```bash
# in 03-tagging-policy and 05-size-guardrail
venv/bin/python -m unittest test_policy.py
```

Offline policy-pack preview works from a project folder with a throwaway local
stack: dummy `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`, the provider
settings `skipCredentialsValidation`, `skipMetadataApiCheck`,
`skipRequestingAccountId` and `skipRegionValidation` set to `true`, and an
`amiId`. The violation must appear as a block naming the policy and the
resource. A green line alone proves nothing. Never commit the throwaway stack
file.

## Not verifiable offline

`pulumi up`, `pulumi destroy`, the budget in the Billing console, the alert
email and budget removal after teardown need a real AWS account.
