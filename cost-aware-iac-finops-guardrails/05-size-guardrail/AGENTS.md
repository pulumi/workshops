# cost-aware-iac-size-guardrail

Step 5: the tagging policy from step 3, plus a second, independent rule
that blocks any EC2 instance larger than `t3.large`.

## Design notes

- Two separate `ResourceValidationPolicy` objects in one pack, each with its
  own name and its own validator, so the two violations are reported (and
  can be reasoned about) independently — a stack that is both untagged and
  oversized gets two distinct violation messages, not one conflated one.
- `instance_type_too_large` checks membership in an explicit allow-set
  (`t3.nano` through `t3.large`) rather than parsing the AWS instance-type
  naming scheme, per the brief's guardrail ("anything above `t3.large`
  blocked"). This folder duplicates the tagging rule from
  `03-tagging-policy/rules.py` rather than importing across folders, per the
  root `AGENTS.md` rule that every workshop folder — and, by the same logic,
  every numbered step within one — stays self-contained.
- `args.props.get("instanceType")` reads the provider's own camelCase
  property name, same convention as `tags` in `03-tagging-policy`.

## Verification

`python -m unittest test_policy.py` passes: 5 tests, covering both rules'
passing and failing cases. `python3 -m py_compile __main__.py rules.py
test_policy.py` passes. This is the real verification of both rules' logic.

`pulumi preview --policy-pack .` was run from `04-tagged-instance/` at
`instanceType: t3.2xlarge` and again after resetting to `t3.micro`, without
AWS credentials configured (see `03-tagging-policy/AGENTS.md` for the same
finding with fake static credentials). Both runs showed the pack load
(`Policies: ✅ cost-aware-iac-size-guardrail`) with no violation reported for
either config, including the oversized one — the same false negative as
`03-tagging-policy`: the AWS provider's `Configure` fails before
`aws.ec2.Instance` is registered, so `validate` never runs. Confirming the
size guardrail actually blocks a real preview against `t3.2xlarge` and
passes at `t3.micro` requires valid AWS credentials this build machine does
not have; it is listed as unverified in the pull request.
