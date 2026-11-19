"""The fixed EC2 instance: same shape as step 2, with the CostCenter tag added.

Step 4 of the "Cost-aware infrastructure as code" workshop. `instanceType` is config (default t3.micro) so step 5 can set it to
t3.2xlarge and show the size guardrail.

Registry: https://www.pulumi.com/registry/packages/aws/api-docs/ec2/instance/
"""

import pulumi
import pulumi_aws as aws

config = pulumi.Config()
instance_type = config.get("instanceType") or "t3.micro"

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
