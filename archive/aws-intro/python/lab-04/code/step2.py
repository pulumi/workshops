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
