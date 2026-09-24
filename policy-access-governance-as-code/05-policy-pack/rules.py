"""The checks behind the policy pack, as plain functions so they can be tested
without Pulumi Cloud (see tests/test_rules.py). Each returns a violation
message, or None when the resource is fine.

Resource type tokens below were confirmed by installing pulumi-gcp==9.36.1
and pulumi-aws==7.48.0 into a scratch virtualenv and grepping the generated
SDK for each resource's registered type token (2026-09-24) - not guessed
from the type name, since the module segment does not always match the
API-docs URL casing (`serviceAccount`, not `serviceaccount`, in the token).
"""

from __future__ import annotations

# Project-scoped IAM resources: granting a role here reaches every resource
# in the project, which is the opposite of the pattern this workshop
# teaches (steps 1-4 each scope a binding to one dataset, one secret, one
# service account, one role). Any of these three resource types appearing
# in the demo's stacks is itself worth flagging, regardless of role.
PROJECT_SCOPED_IAM_TYPES = {
    "gcp:projects/iAMMember:IAMMember",
    "gcp:projects/iAMBinding:IAMBinding",
    "gcp:projects/iAMPolicy:IAMPolicy",
}

# The resource-scoped binding types this workshop's steps 1-3 use. A broad
# primitive role on one of these is still wrong even though the binding is
# nominally scoped to one resource, because roles/owner and roles/editor
# grant far more than the one narrow permission the step is teaching.
RESOURCE_SCOPED_IAM_TYPES = {
    "gcp:bigquery/datasetIamMember:DatasetIamMember",
    "gcp:secretmanager/secretIamMember:SecretIamMember",
    "gcp:serviceAccount/iAMMember:IAMMember",
}

# Primitive roles broad enough to be a red flag on any binding in this demo.
# `roles/owner` and `roles/editor` grant access to (almost) everything in
# the project; a wildcard segment (`roles/*`) is not a real GCP role but is
# included so a hand-typed placeholder never slips through unnoticed.
BROAD_ROLES = {"roles/owner", "roles/editor"}


def gcp_binding_violation(resource_type: str, role: str | None) -> str | None:
    """Flag a GCP IAM binding that reaches beyond the one resource it names.

    Two independent reasons to flag, checked in order:
    1. The resource type itself grants at project scope
       (`gcp.projects.IAMMember`/`IAMBinding`/`IAMPolicy`).
    2. The role is a broad primitive role (`roles/owner`, `roles/editor`)
       or a wildcard, even on a resource-scoped binding type.
    """
    if resource_type in PROJECT_SCOPED_IAM_TYPES:
        return (
            f"{resource_type} grants '{role}' at project scope. "
            "This workshop's bindings must be scoped to one resource "
            "(a dataset, a secret, or a service account), not the whole "
            "project."
        )
    if resource_type in RESOURCE_SCOPED_IAM_TYPES:
        if role in BROAD_ROLES or (role and role.endswith("*")):
            return (
                f"{resource_type} grants the broad role '{role}'. "
                "Bind a narrow, purpose-specific role instead (e.g. "
                "roles/bigquery.dataViewer, roles/secretmanager.secretAccessor, "
                "roles/iam.serviceAccountUser)."
            )
    return None


def aws_role_policy_violation(policy_document: dict) -> str | None:
    """Flag an AWS inline role policy with a wildcard action or resource.

    `policy_document` is the already-parsed JSON policy (a dict), matching
    what `aws.iam.RolePolicy`'s `policy` argument serializes from in
    `04-aws-role/__main__.py`. A statement with `Action: "*"` or
    `Resource: "*"` (string or list containing `"*"`) grants far more than
    the single scoped action set this workshop's step 4 is meant to
    demonstrate.
    """
    statements = policy_document.get("Statement", [])
    if isinstance(statements, dict):
        statements = [statements]

    for statement in statements:
        if statement.get("Effect") != "Allow":
            continue
        for field in ("Action", "Resource"):
            value = statement.get(field)
            values = value if isinstance(value, list) else [value]
            if "*" in values:
                return (
                    f"Inline role policy statement grants '{field}: \"*\"'. "
                    "Scope the action set and the resource ARN instead of "
                    "using a wildcard."
                )
    return None
