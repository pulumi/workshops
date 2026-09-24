"""Step 4 - the AWS mirror of the same least-privilege pattern.

Resources, in order:

1. An `aws.iam.Role` whose trust policy (`assume_role_policy`) allows only
   the EC2 service (`ec2.amazonaws.com`) to assume it - a role nothing else
   can pick up.
   Source: pulumi.com/registry/packages/aws/api-docs/iam/role/
   (read 2026-09-24, AWS v7.48.0).
2. An `aws.iam.RolePolicy` (an inline policy attached to exactly this role)
   scoped to a single action set: read-only access to one S3 bucket prefix,
   nothing account-wide and no `s3:*` or `Resource: "*"`. `RolePolicy` is
   the direct analogue of the GCP `*IamMember` resources in steps 1-3: it
   attaches one policy document to one role, rather than a managed policy
   that could be shared (and drift) across many roles.
   Source: pulumi.com/registry/packages/aws/api-docs/iam/rolepolicy/
   (read 2026-09-24, AWS v7.48.0).

No bucket is created here - the policy document names a placeholder bucket
ARN pattern (`arn:aws:s3:::policy-access-governance-demo/*`) purely to show
a scoped `Resource` clause; nothing in this step provisions or reads from S3.

End state (brief step 4): a role that can do exactly what the demo needs,
nothing more - verify in the AWS console that the role's inline policy shows
only `s3:GetObject`/`s3:ListBucket` on the one named prefix, and that no
managed policy (especially not `AdministratorAccess`) is attached.
"""

import json

import pulumi
import pulumi_aws as aws

ROLE_NAME = "policy-access-governance-demo-role"
BUCKET_ARN_PREFIX = "arn:aws:s3:::policy-access-governance-demo"

demo_role = aws.iam.Role(
    "demo-role",
    name=ROLE_NAME,
    assume_role_policy=json.dumps(
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {"Service": "ec2.amazonaws.com"},
                    "Action": "sts:AssumeRole",
                }
            ],
        }
    ),
    tags={"workshop": "policy-access-governance-as-code"},
)

scoped_read_policy = aws.iam.RolePolicy(
    "demo-role-scoped-read",
    name="scoped-s3-read",
    role=demo_role.id,
    policy=json.dumps(
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": ["s3:GetObject", "s3:ListBucket"],
                    "Resource": [
                        BUCKET_ARN_PREFIX,
                        f"{BUCKET_ARN_PREFIX}/*",
                    ],
                }
            ],
        }
    ),
)

pulumi.export("roleArn", demo_role.arn)
pulumi.export("roleName", demo_role.name)
pulumi.export("policyName", scoped_read_policy.name)
