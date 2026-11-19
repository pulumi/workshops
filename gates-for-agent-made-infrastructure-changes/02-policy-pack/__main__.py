from pulumi_policy import (
    EnforcementLevel,
    PolicyPack,
    ResourceValidationPolicy,
    StackValidationPolicy,
)

import rules


def required_tags(args, report_violation):
    if args.resource_type != rules.BUCKET:
        return
    message = rules.tag_message(args.props)
    if message:
        report_violation(message)


def _companion_check(companion_type: str, message: str):
    def validate(args, report_violation):
        resources = [
            rules.Res(
                type=r.resource_type,
                urn=r.urn,
                props=r.props,
                dependency_urns=[d.urn for d in r.dependencies],
            )
            for r in args.resources
        ]
        for urn in rules.buckets_without(resources, companion_type):
            report_violation(f"{message}: {urn}")

    return validate


PolicyPack(
    name="agent-gates-s3",
    enforcement_level=EnforcementLevel.MANDATORY,
    policies=[
        ResourceValidationPolicy(
            name="s3-required-tags",
            description="S3 buckets must carry the tags owner and change-ref.",
            validate=required_tags,
        ),
        StackValidationPolicy(
            name="s3-public-access-block",
            description="Every S3 bucket must have a public access block.",
            validate=_companion_check(
                rules.PUBLIC_ACCESS_BLOCK, "S3 bucket has no public access block"
            ),
        ),
        StackValidationPolicy(
            name="s3-server-side-encryption",
            description="Every S3 bucket must have server-side encryption configured.",
            validate=_companion_check(
                rules.SSE_CONFIG, "S3 bucket has no server-side encryption"
            ),
        ),
    ],
)
