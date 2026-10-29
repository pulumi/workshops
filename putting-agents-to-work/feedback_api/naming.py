"""Naming and tagging conventions for feedback-api (see AGENTS.md).

Every resource name starts with `feedback-<stack>-`. The IAM deploy roles only
allow writes to resources with that prefix, so this convention is enforced by
AWS, not just by review.
"""

import pulumi

APP = "feedback"


def stack() -> str:
    return pulumi.get_stack()


def name(thing: str) -> str:
    """`name("table")` -> `feedback-dev-table` on the dev stack."""
    return f"{APP}-{stack()}-{thing}"


def tags() -> dict[str, str]:
    return {
        "app": "feedback-api",
        "environment": stack(),
        "managed-by": "pulumi",
    }