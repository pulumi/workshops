"""Step 4: an IAM role that can read one bucket's objects and nothing else."""
import json

import pulumi
import pulumi_aws as aws

config = pulumi.Config()
trusted_account_id = config.require("trustedAccountId")
bucket_name = config.require("bucketName")

role = aws.iam.Role(
    "report-reader",
    assume_role_policy=json.dumps({
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Principal": {"AWS": f"arn:aws:iam::{trusted_account_id}:root"},
            "Action": "sts:AssumeRole",
        }],
    }),
)

policy = aws.iam.RolePolicy(
    "report-reader-policy",
    role=role.id,
    policy=json.dumps({
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": ["s3:ListBucket"],
                "Resource": f"arn:aws:s3:::{bucket_name}",
            },
            {
                "Effect": "Allow",
                "Action": ["s3:GetObject"],
                "Resource": f"arn:aws:s3:::{bucket_name}/*",
            },
        ],
    }),
)

pulumi.export("roleArn", role.arn)
pulumi.export("roleName", role.name)
pulumi.export("policyName", policy.name)
