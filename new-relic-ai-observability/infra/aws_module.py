import os

import pulumi
import pulumi_aws as aws


def declare_aws_resources():
    """_summary_"""
    # Create a VPC
    vpc = aws.ec2.Vpc(
        "ai_demo_vpc",
        cidr_block="10.0.0.0/16",
        enable_dns_hostnames=True,
        enable_dns_support=True,
        tags={
            "Name": "ai-demo-vpc",
        },
    )

    # Create an Internet Gateway
    igw = aws.ec2.InternetGateway(
        "ai_demo_igw",
        vpc_id=vpc.id,
        tags={
            "Name": "ai-demo-igw",
        },
    )

    # Create a Route Table
    route_table = aws.ec2.RouteTable(
        "ai_demo_route_table",
        vpc_id=vpc.id,
        routes=[
            {
                "cidr_block": "0.0.0.0/0",
                "gateway_id": igw.id,
            }
        ],
        tags={
            "Name": "ai-demo-routetable",
        },
    )

    # Create a subnet
    subnet = aws.ec2.Subnet(
        "ai_demo_subnet",
        vpc_id=vpc.id,
        cidr_block="10.0.1.0/24",
        map_public_ip_on_launch=True,
        tags={
            "Name": "ai-demo-subnet",
        },
    )

    # Associate the Route Table with the Subnet
    route_table_association = aws.ec2.RouteTableAssociation(
        "ai_demo_route_table_association",
        subnet_id=subnet.id,
        route_table_id=route_table.id,
    )

    # Create a security group
    security_group = aws.ec2.SecurityGroup(
        "ai_demo_security_group",
        vpc_id=vpc.id,
        description="Allow SSH and HTTP",
        ingress=[
            {
                "protocol": "tcp",
                "from_port": 80,
                "to_port": 80,
                "cidr_blocks": ["0.0.0.0/0"],
            }
        ],
        egress=[
            {
                "protocol": "-1",
                "from_port": 0,
                "to_port": 0,
                "cidr_blocks": ["0.0.0.0/0"],
            }
        ],
        tags={
            "Name": "ai-demo-security-group",
        },
    )

    pulumi_access_token = os.getenv("PULUMI_TEAM_TOKEN_EC2_ESC")
    ai_model = os.getenv("MODEL_TO_USE")
    # Use the following command on the EC2 instance
    # to check the status and see any errors from the userData script
    # cat /var/log/cloud-init-output.log
    user_data = f"""#!/bin/bash
    sudo -u ubuntu -i <<EOF
    # Set up dependencies
    echo "user_data SCRIPT_LOG_START"

    echo "setup using model: {ai_model}"

    sudo apt-get update -y -qq
    sudo apt-get install -y -qq docker.io git
    sudo systemctl start docker
    sudo systemctl enable docker

    sudo curl -L "https://github.com/docker/compose/releases/download/v2.29.7/docker-compose-$(uname -s | tr '[:upper:]' '[:lower:]')-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose

    # Set up the repo
    git clone https://github.com/pierskarsenbarg/ai-chat-app.git /home/ubuntu/repo
    cd /home/ubuntu/repo/app

    # Set environment variables with Pulumi ESC
    curl -fsSL https://get.pulumi.com/esc/install.sh | sh
    export PULUMI_ACCESS_TOKEN={pulumi_access_token}
    export PULUMI_ESC_ENV=ai-demo/demos/ai-chat-demo
    /home/ubuntu/.pulumi/bin/esc env open ai-demo/demos/ai-chat-demo --format dotenv > .env
    unset PULUMI_ACCESS_TOKEN

    # Fix Redis memory over commit
    sudo sysctl -w vm.overcommit_memory=1

    # Run Docker Compose
    sudo ufw allow 80/tcp
    sed -i 's/8888:/80:/g' docker-compose.yml
    sudo docker-compose up --force-recreate -d
EOF
    """

    ami = aws.ec2.get_ami(
        filters=[
            {
                "name": "name",
                "values": ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"],
            }
        ],
        most_recent=True,
        owners=["amazon"],
    )

    instance = aws.ec2.Instance(
        "ai_demo_instance",
        instance_type=aws.ec2.InstanceType.T2_MICRO,
        ami=ami.id,  # Replace with a valid AMI ID, amd64/Ubuntu 22.04
        user_data=user_data,
        user_data_replace_on_change=True,
        vpc_security_group_ids=[security_group.id],
        subnet_id=subnet.id,
        associate_public_ip_address=True,
        tags={
            "Name": "ai-demo-instance",
        },
        # Ensure the instance is created only after the route table association
        # is created
        # This is to ensure that the instance can communicate with the internet
        # thus the user_data script can successfully run
        opts=pulumi.ResourceOptions(depends_on=[route_table_association]),
    )

    pulumi.export("url", instance.public_ip)
