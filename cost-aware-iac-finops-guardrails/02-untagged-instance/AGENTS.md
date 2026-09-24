# cost-aware-iac-untagged-instance

Step 2: an `aws.ec2.Instance` with no `CostCenter` tag, deployed cleanly
because no policy pack is enforced yet.

## Design notes

- Fixed at `t3.micro` and a hardcoded, deliberately missing `CostCenter` tag
  — this project exists only to be the "before" state step 3's policy pack
  runs against. The size-guardrail demo in step 5 runs against
  `04-tagged-instance` instead, which exposes `instanceType` as config.
- The AMI is a config-supplied ID (`amiId`, `ami-000000000000TODO`
  placeholder), not a live `aws.ec2.get_ami` lookup. An earlier draft used
  `get_ami`, which is itself an AWS API call: on this build machine it fails
  before the `aws.ec2.Instance` resource below is ever registered, which
  hides the resource from local policy-pack evaluation entirely (see
  `03-tagging-policy/AGENTS.md`). The presenter must set a real AMI ID
  before the session (`aws ssm get-parameter --name
  /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64
  --query 'Parameter.Value' --output text --region us-east-1`).

## Verification

`python3 -m py_compile __main__.py` passes. `pulumi preview` was run, first
without AWS credentials and then with fake static ones, on this build
machine (`pulumi login` against a local file backend, no stack deployed);
both times it stopped at the provider's `Configure` call (`No valid
credential sources found` / `Invalid credentials configured`) before the
instance resource registered. This confirms the program is well-formed and
that the `CostCenter` tag really is absent from the `tags` map; it does not
confirm `pulumi up` succeeds against a live account, or that a policy pack
actually sees this resource (see `03-tagging-policy/AGENTS.md` for that
finding). Both require a live AWS account and are listed as unverified in
the pull request.
