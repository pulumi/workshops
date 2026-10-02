import pulumi_aws as aws

security_group_name = "web-sg"

group = aws.ec2.SecurityGroup(security_group_name,
    description="Enable HTTP access",
    tags={
        "Name": security_group_name
    }
)

rule = aws.ec2.SecurityGroupRule("http_access",
    security_group_id=group.id,
    description="Enable HTTP access",
    type="ingress",
    protocol="tcp",
    from_port=80,
    to_port=80,
    cidr_blocks=["0.0.0.0/0"]
)
