"""The fixed EC2 instance: same shape as step 2, with the CostCenter tag added.

Step 4 of the "Cost-aware infrastructure as code" workshop. `instanceType`
is exposed as config (default `t3.micro`) so step 5 can set it to something
oversized (`pulumi config set instanceType t3.2xlarge`) and show the
size-guardrail policy catch it, then reset it back to a clean preview.

Registry: https://www.pulumi.com/registry/packages/aws/api-docs/ec2/instance/
"""

import pulumi
import pulumi_aws as aws

config = pulumi.Config()
instance_type = config.get("instanceType") or "t3.micro"
# TODO(presenter): set a real, current Amazon Linux 2023 AMI ID for
# us-east-1 before the session (same command as 02-untagged-instance's
# AGENTS.md). A config-supplied ID, not a live aws.ec2.get_ami lookup, is
# used deliberately — see 02-untagged-instance/AGENTS.md for why.
ami_id = config.get("amiId") or "ami-000000000000TODO"

instance = aws.ec2.Instance(
    "demo-instance-tagged",
    ami=ami_id,
    instance_type=instance_type,
    tags={
        "Name": "cost-aware-iac-demo-tagged",
        "CostCenter": "workshop-finops-demo",
    },
)

pulumi.export("instance_id", instance.id)
pulumi.export("instance_type", instance.instance_type)
