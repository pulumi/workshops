from pulumi_policy import (
    EnforcementLevel,
    PolicyPack,
    ReportViolation,
    ResourceValidationArgs,
    ResourceValidationPolicy,
)

from rules import ALL_RULES


def _make(name, description, fn):
    def validate(args: ResourceValidationArgs, report_violation: ReportViolation):
        for message in fn(args.resource_type, args.props):
            report_violation(message)

    return ResourceValidationPolicy(name=name, description=description, validate=validate)


PolicyPack(
    name="least-privilege-iam",
    enforcement_level=EnforcementLevel.MANDATORY,
    policies=[_make(n, d, f) for n, (d, f) in ALL_RULES.items()],
)
