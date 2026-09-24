# cost-aware-iac-tagging-policy

Step 3: a Pulumi Policies pack (Python, `ResourceValidationPolicy`) that
requires a `CostCenter` tag on every `aws.ec2.Instance`.

## Design notes

- The validation logic lives in `rules.py`, not `__main__.py`, specifically
  so `test_policy.py` can exercise it without needing `pulumi_policy`
  installed or a live Pulumi program to run against. `__main__.py` is the
  thin `pulumi_policy` wiring around it.
- `args.props.get("tags")` reads the resource's raw provider properties,
  matching the pattern in Pulumi's own policy-pack authoring guide (which
  reads `args.props.get("storageEncrypted")` the same way for an RDS
  instance). Property names here are the provider's own camelCase/lowercase
  wire names, not the SDK's snake_case constructor keywords.
- Enforcement is `MANDATORY` (blocking), not `ADVISORY`, per the brief's
  learning outcome 3 ("watch `pulumi preview` block a deployment").

## Verification

`python -m unittest test_policy.py` passes: 3 tests, both the missing-tag
and present-tag cases. `python3 -m py_compile __main__.py rules.py
test_policy.py` passes. This is the real verification of the rule's logic.

`pulumi preview --policy-pack .` was run from `02-untagged-instance/`,
first without AWS credentials and then with syntactically valid but fake
static ones (`AKIAIOSFODNN7EXAMPLE` / a matching example secret, never a
real credential). Both times the pack loaded (`Policies: ✅
cost-aware-iac-tagging-policy`) but reported no violation, including
against the untagged instance — a false negative, not a pass. The AWS
provider's `Configure` calls STS before Pulumi's resource-registration step
runs, and on this build machine that call fails (`No valid credential
sources found` with no credentials, `Invalid credentials configured` with
fake ones) before the `aws.ec2.Instance` resource is ever registered, so
`ResourceValidationPolicy.validate` never runs against it. Confirming the
policy actually blocks a real preview requires valid AWS credentials this
build machine does not have; it is listed as unverified in the pull
request. Do not read a green "✅ policy pack" line in this environment as a
passing check — verify it fires against a resource with real credentials
before relying on it.
