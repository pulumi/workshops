import pulumi
import pulumi_aws as aws
import pulumi_awsx as awsx

config = pulumi.Config()
base_name = config.get("base_name") or f"{pulumi.get_organization()}-{pulumi.get_stack()}".lower()

vpc = awsx.ec2.Vpc(base_name)

## Exercise ##
pulumi.export("vpc_id", vpc.vpc_id)
pulumi.export("subnet_id", vpc.public_subnet_ids[0])
## Exercise ##
