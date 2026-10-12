"""Step 3: the permissions boundary.

The boundary is a ceiling, not a grant. A role that carries it can never do more than
S3 on buckets named agent-sandbox-*: IAM, EC2 and everything else are denied by omission,
whatever the role's own policies say.
"""
import json

import pulumi
import pulumi_aws as aws

boundary = aws.iam.Policy(
    "agent-sandbox-boundary",
    name="agent-sandbox-boundary",
    description="Ceiling for agent sandbox roles: S3 on agent-sandbox-* buckets only.",
    policy=json.dumps({
        "Version": "2012-10-17",
        "Statement": [{
            "Sid": "S3OnSandboxBucketsOnly",
            "Effect": "Allow",
            "Action": "s3:*",
            "Resource": ["arn:aws:s3:::agent-sandbox-*", "arn:aws:s3:::agent-sandbox-*/*"],
        }],
    }),
)

pulumi.export("boundaryArn", boundary.arn)
