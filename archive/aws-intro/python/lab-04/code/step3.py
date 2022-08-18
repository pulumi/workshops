from pulumi import export, Output
import pulumi_aws as aws
import json, hashlib

h = hashlib.new('sha1')

# Create the EKS Service Role and the correct role attachments
service_role = aws.iam.Role("eks-service-role",
    assume_role_policy=json.dumps({
        "Version": "2012-10-17",
        "Statement": [{
            "Sid": "",
            "Effect": "Allow",
            "Principal": {
                "Service": "eks.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }]
    })
)

service_role_managed_policy_arns = [
    "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy",
    "arn:aws:iam::aws:policy/AmazonEKSServicePolicy"
]

for policy in service_role_managed_policy_arns:
    h.update(policy.encode('utf-8'))
    role_policy_attachment = aws.iam.RolePolicyAttachment(f"eks-service-role-{h.hexdigest()[0:8]}",
        policy_arn=policy,
        role=service_role.name
    )

# Create the EKS NodeGroup Role and the correct role attachments
node_group_role = aws.iam.Role("eks-nodegroup-role",
    assume_role_policy=json.dumps({
       "Version": "2012-10-17",
       "Statement": [{
           "Sid": "",
           "Effect": "Allow",
           "Principal": {
               "Service": "ec2.amazonaws.com"
           },
           "Action": "sts:AssumeRole"
       }]
    })
)

nodegroup_role_managed_policy_arns = [
    "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
    "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
]

for policy in nodegroup_role_managed_policy_arns:
    h.update(policy.encode('utf-8'))
    role_policy_attachment = aws.iam.RolePolicyAttachment(f"eks-nodegroup-role-{h.hexdigest()[0:8]}",
        policy_arn=policy,
        role=node_group_role.name
    )

# Get the VPC and subnets to launch the EKS cluster into
default_vpc = aws.ec2.get_vpc(default="true")
default_vpc_subnets = aws.ec2.get_subnet_ids(vpc_id=default_vpc.id)

# Create the Security Group that allows access to the cluster pods
sg = aws.ec2.SecurityGroup("eks-cluster-security-group",
    vpc_id=default_vpc.id,
    revoke_rules_on_delete="true",
    ingress=[{
       'cidr_blocks' : ["0.0.0.0/0"],
       'from_port' : '80',
       'to_port' : '80',
       'protocol' : 'tcp',
    }]
)

sg_rule = aws.ec2.SecurityGroupRule("eks-cluster-security-group-egress-rule",
    type="egress",
    from_port=0,
    to_port=0,
    protocol="-1",
    cidr_blocks=["0.0.0.0/0"],
    security_group_id=sg.id
)
