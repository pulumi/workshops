"""Pulumi Policies pack for feedback-api: what any change, by anyone, must not do.

Publish it (`pulumi policy publish`) and add it to a *preventative* policy group
covering feedback-api/dev and feedback-api/prod. It runs server-side on every
preview and update. Deploy credentials can only run `pulumi up` (see the hook and
iam/), so every write to AWS passes through these rules.

The checks live in rules.py so test_rules.py can unit-test them.
"""

from pulumi_policy import (
    EnforcementLevel,
    PolicyPack,
    ResourceValidationPolicy,
    StackValidationPolicy,
)
from rules import (
    MAX_MEMORY_MB,
    MAX_TIMEOUT_S,
    PERMISSION_TYPE,
    PROTECTED_STACKS,
    TABLE_TYPE,
    TAGGED_TYPES,
    check_lambda_cost,
    check_no_iam,
    check_public_permission,
    check_required_tags,
    check_table_present,
    check_table_protection,
    is_protected_stack,
)


def _report(problems, report_violation):
    for problem in problems:
        report_violation(problem, None)


def _protect_data(args, report_violation):
    if args.resource_type == TABLE_TYPE and is_protected_stack(args.urn):
        _report(check_table_protection(args.props, bool(args.opts and args.opts.protect)), report_violation)


def _table_present(args, report_violation):
    if not args.resources or not is_protected_stack(args.resources[0].urn):
        return
    _report(check_table_present([r.resource_type for r in args.resources]), report_violation)


def _no_new_identities(args, report_violation):
    _report(check_no_iam(args.resource_type), report_violation)


def _no_public_access(args, report_violation):
    if args.resource_type == PERMISSION_TYPE:
        _report(check_public_permission(args.props), report_violation)


def _lambda_cost_cap(args, report_violation):
    if args.resource_type == "aws:lambda/function:Function":
        _report(check_lambda_cost(args.props), report_violation)


def _required_tags(args, report_violation):
    if args.resource_type in TAGGED_TYPES:
        _report(check_required_tags(args.props), report_violation)


PolicyPack(
    name="feedback-api-guardrails",
    enforcement_level=EnforcementLevel.MANDATORY,
    policies=[
        ResourceValidationPolicy(
            name="protect-data",
            description=f"In {', '.join(PROTECTED_STACKS)} stacks, data tables keep Pulumi protect, AWS deletion protection, and point-in-time recovery on.",
            validate=_protect_data,
        ),
        StackValidationPolicy(
            name="table-present",
            description=f"{', '.join(PROTECTED_STACKS)} stacks keep their DynamoDB table; removing it from the code would delete the data.",
            validate=_table_present,
        ),
        ResourceValidationPolicy(
            name="no-new-identities",
            description="App stacks declare no IAM roles, policies, or users; access is granted only in iam/.",
            validate=_no_new_identities,
        ),
        ResourceValidationPolicy(
            name="no-public-access",
            description="Nothing is invokable by everyone except through the function URL.",
            validate=_no_public_access,
        ),
        ResourceValidationPolicy(
            name="lambda-cost-cap",
            description=f"Lambda functions use at most {MAX_MEMORY_MB} MB of memory and a {MAX_TIMEOUT_S}s timeout.",
            validate=_lambda_cost_cap,
        ),
        ResourceValidationPolicy(
            name="required-tags",
            description="Functions, tables, and log groups carry the app, environment, and managed-by tags.",
            validate=_required_tags,
        ),
    ],
)
