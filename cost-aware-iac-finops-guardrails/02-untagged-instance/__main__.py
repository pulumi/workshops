"""A small EC2 instance with no cost-allocation tag.

Step 2 of the "Cost-aware infrastructure as code" workshop. `pulumi up`
succeeds cleanly here because no policy pack is in place yet — this is the
gap step 3's policy pack closes.

Registry: https://www.pulumi.com/registry/packages/aws/api-docs/ec2/instance/
"""

import pulumi
import pulumi_aws as aws

config = pulumi.Config()
# TODO(presenter): set a real, current Amazon Linux 2023 AMI ID for
# us-east-1 before the session, e.g.:
#   aws ssm get-parameter \
#     --name /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 \
#     --query 'Parameter.Value' --output text --region us-east-1
# A hardcoded, config-supplied ID (rather than a live aws.ec2.get_ami lookup)
# is used deliberately: get_ami is itself an invoke against AWS and fails
# before the Instance resource below is ever registered, which would hide
# this resource from local policy-pack evaluation entirely. See this
# folder's AGENTS.md for how that was found.
ami_id = config.get("amiId") or "ami-000000000000TODO"

instance = aws.ec2.Instance(
    "demo-instance-untagged",
    ami=ami_id,
    instance_type="t3.micro",
    tags={
        "Name": "cost-aware-iac-demo-untagged",
        # Deliberately no CostCenter tag — this is the resource step 3's
        # policy pack is written to catch.
    },
)

pulumi.export("instance_id", instance.id)
pulumi.export("instance_type", instance.instance_type)
