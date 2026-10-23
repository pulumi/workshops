"""Baseline for the gates workshop.

Always creates one compliant bucket (four resources). The config value
`agentChange` simulates what an agent adds later:
  none          nothing more (step 1)
  noncompliant  a second bucket with no tags, no public access block, no
                encryption (step 3, blocked by the policy pack)
  fixed         the same bucket, tagged and encrypted (steps 4 and 5)
"""
import pulumi
import pulumi_aws as aws

config = pulumi.Config()
agent_change = config.get("agentChange") or "none"
if agent_change not in ("none", "noncompliant", "fixed"):
    raise Exception("agentChange must be none, noncompliant or fixed")

TAGS = {"owner": "platform-team", "change-ref": "baseline"}


def compliant_bucket(name: str, tags: dict) -> aws.s3.BucketV2:
    bucket = aws.s3.BucketV2(name, tags=tags)
    aws.s3.BucketPublicAccessBlock(
        f"{name}-pab",
        bucket=bucket.id,
        block_public_acls=True,
        block_public_policy=True,
        ignore_public_acls=True,
        restrict_public_buckets=True,
    )
    aws.s3.BucketServerSideEncryptionConfigurationV2(
        f"{name}-sse",
        bucket=bucket.id,
        rules=[
            aws.s3.BucketServerSideEncryptionConfigurationV2RuleArgs(
                apply_server_side_encryption_by_default=aws.s3.BucketServerSideEncryptionConfigurationV2RuleApplyServerSideEncryptionByDefaultArgs(
                    sse_algorithm="AES256",
                )
            )
        ],
    )
    return bucket


# Baseline: bucket + public access block + encryption + versioning.
baseline = compliant_bucket("baseline", TAGS)
aws.s3.BucketVersioningV2(
    "baseline-versioning",
    bucket=baseline.id,
    versioning_configuration=aws.s3.BucketVersioningV2VersioningConfigurationArgs(
        status="Enabled",
    ),
)
pulumi.export("baselineBucket", baseline.bucket)

if agent_change == "noncompliant":
    # What the agent proposes: no tags, no public access block, no encryption.
    agent_bucket = aws.s3.BucketV2("agent-bucket")
    pulumi.export("agentBucket", agent_bucket.bucket)
elif agent_change == "fixed":
    agent_bucket = compliant_bucket(
        "agent-bucket", {"owner": "platform-team", "change-ref": "agent-change-1"}
    )
    pulumi.export("agentBucket", agent_bucket.bucket)
