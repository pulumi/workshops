"""Step 7: the sandbox policy pack. Both rules are mandatory: a violation stops the preview."""
from pulumi_policy import (EnforcementLevel, PolicyPack, ReportViolation, ResourceValidationArgs,
                           ResourceValidationPolicy)

REQUIRED_TAGS = ("agent-task", "expires-at")


def role_has_boundary(args: ResourceValidationArgs, report_violation: ReportViolation) -> None:
    if args.resource_type == "aws:iam/role:Role" and not args.props.get("permissionsBoundary"):
        report_violation("An agent sandbox role must carry the agent-sandbox-boundary permissions boundary.")


def resources_are_tagged(args: ResourceValidationArgs, report_violation: ReportViolation) -> None:
    if args.resource_type not in ("aws:s3/bucketV2:BucketV2", "aws:iam/role:Role"):
        return
    tags = args.props.get("tags") or {}
    missing = [t for t in REQUIRED_TAGS if t not in tags]
    if missing:
        report_violation(f"Sandbox resources must carry the tags {', '.join(REQUIRED_TAGS)}; missing: {', '.join(missing)}.")


PolicyPack(
    name="agent-sandbox-policies",
    enforcement_level=EnforcementLevel.MANDATORY,
    policies=[
        ResourceValidationPolicy(
            name="sandbox-role-has-boundary",
            description="Roles in a sandbox stack must have the permissions boundary.",
            validate=role_has_boundary,
        ),
        ResourceValidationPolicy(
            name="sandbox-resources-are-tagged",
            description="Buckets and roles must carry agent-task and expires-at tags.",
            validate=resources_are_tagged,
        ),
    ],
)
