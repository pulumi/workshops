"""A small EC2 instance with no cost-allocation tag.

Step 2 of the "Cost-aware infrastructure as code" workshop. `pulumi up` succeeds here because no policy pack is attached yet.
Step 3's policy pack closes that gap.

Registry: https://www.pulumi.com/registry/packages/aws/api-docs/ec2/instance/
"""

import pulumi
import pulumi_aws as aws

config = pulumi.Config()
instance_type = "t3.micro"

# Live runs look up the latest Amazon Linux 2023 AMI. `amiId` overrides the
# lookup: aws.ec2.get_ami calls AWS, so an offline preview needs the override
# to get as far as registering the instance for the policy pack.
ami_id = config.get("amiId") or aws.ec2.get_ami(
    most_recent=True,
    owners=["amazon"],
    filters=[
        aws.ec2.GetAmiFilterArgs(name="name", values=["al2023-ami-2023.*-x86_64"]),
        aws.ec2.GetAmiFilterArgs(name="virtualization-type", values=["hvm"]),
    ],
).id

instance = aws.ec2.Instance(
    "demo-instance-untagged",
    ami=ami_id,
    instance_type=instance_type,
    tags={
        "Name": "cost-aware-iac-demo-untagged",
        # No CostCenter tag on purpose: step 3 catches this.
    },
)

pulumi.export("instance_id", instance.id)
pulumi.export("instance_type", instance.instance_type)
