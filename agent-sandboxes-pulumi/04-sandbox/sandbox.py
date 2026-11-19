"""Step 4: the sandbox, as a function.

One agent task gets: one S3 bucket, one IAM role confined to that bucket, the shared
permissions boundary, and three tags that say who owns it and when it expires.
The orchestrator passes `sandbox_program(...)` to the Automation API as an inline program;
`__main__.py` runs the same function for a plain `pulumi preview`.
"""
import json
import os
from typing import Callable

import pulumi
import pulumi_aws as aws


def sandbox_program(
    task_id: str,
    boundary_arn: str,
    owner: str,
    expires_at: str,
    compliant: bool = True,
) -> Callable[[], None]:
    """Return the Pulumi program for one task. compliant=False builds the bad sandbox of step 7."""

    def program() -> None:
        bucket_name = f"agent-sandbox-{task_id}"
        tags = {"agent-task": task_id, "owner": owner, "expires-at": expires_at}
        if not compliant:
            tags = {"owner": owner}  # no agent-task, no expires-at

        bucket = aws.s3.BucketV2(
            "bucket",
            bucket=bucket_name,
            force_destroy=True,  # the sandbox goes away with its contents
            tags=tags,
        )

        scoped = aws.iam.Policy(
            "scoped",
            name=f"agent-{task_id}-scoped",
            policy=bucket.arn.apply(lambda arn: json.dumps({
                "Version": "2012-10-17",
                "Statement": [{
                    "Effect": "Allow",
                    "Action": ["s3:GetObject", "s3:PutObject", "s3:ListBucket"],
                    "Resource": [arn, f"{arn}/*"],
                }],
            })),
            tags=tags,
        )

        # AGENT_SANDBOX_ACCOUNT_ID lets a preview run without AWS access; live runs ask STS.
        account_id = os.environ.get("AGENT_SANDBOX_ACCOUNT_ID") or aws.get_caller_identity().account_id
        role = aws.iam.Role(
            "role",
            name=f"agent-{task_id}",
            assume_role_policy=json.dumps({
                "Version": "2012-10-17",
                "Statement": [{
                    "Effect": "Allow",
                    "Principal": {"AWS": f"arn:aws:iam::{account_id}:root"},
                    "Action": "sts:AssumeRole",
                }],
            }),
            permissions_boundary=boundary_arn if compliant else None,
            max_session_duration=3600,
            tags=tags,
        )

        aws.iam.RolePolicyAttachment("attach", role=role.name, policy_arn=scoped.arn)

        pulumi.export("bucket", bucket.bucket)
        pulumi.export("roleArn", role.arn)

    return program
