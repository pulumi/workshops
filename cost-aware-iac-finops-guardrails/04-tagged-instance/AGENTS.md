# cost-aware-iac-tagged-instance

Step 4: the same EC2 instance as step 2, with a `CostCenter` tag added, and
`instanceType` exposed as config for step 5's size-guardrail demo.

## Design notes

- `instanceType` defaults to `t3.micro` and is read via `config.get`, not
  `config.require`, so the project runs untouched for step 4's own clean
  preview. Step 5 changes it in place with `pulumi config set instanceType
  t3.2xlarge`, then resets it, rather than needing a second project.
- Same config-supplied `amiId` placeholder as `02-untagged-instance`, for
  the same reason (see that folder's `AGENTS.md`).

## Verification

`python3 -m py_compile __main__.py` passes. `pulumi preview` was run without
AWS credentials configured on this build machine; it stopped at the
provider's `Configure` call, same as `02-untagged-instance`. `pulumi preview
--policy-pack ../03-tagging-policy` and, after `pulumi config set
instanceType t3.2xlarge`, `pulumi preview --policy-pack
../05-size-guardrail` were both run; neither reached the resource-validation
step for the reason recorded in `03-tagging-policy/AGENTS.md` and
`05-size-guardrail/AGENTS.md` (the provider fails to configure before the
`aws.ec2.Instance` resource registers, so no policy ever actually evaluates
it here). `instanceType` was reset to `t3.micro` afterward. Actually
deploying the instance, confirming it exists tagged in a real account, and
confirming the policy packs fire against it for real all require a live AWS
account and are listed as unverified in the pull request.
