"""Policy checks as plain functions, so they can be unit-tested without the engine.

The pack is organized around what an agent could get wrong, from most to least
serious: losing data, granting itself access, exposing something publicly,
running up cost, and leaving resources unowned.
"""

TABLE_TYPE = "aws:dynamodb/table:Table"
PERMISSION_TYPE = "aws:lambda/permission:Permission"
TAGGED_TYPES = ("aws:lambda/function:Function", TABLE_TYPE, "aws:cloudwatch/logGroup:LogGroup")
REQUIRED_TAGS = ("app", "environment", "managed-by")
MAX_MEMORY_MB = 512
MAX_TIMEOUT_S = 30
# Stacks whose data must be locked. Dev tables stay disposable so you (or an
# agent) can recreate them freely; prod tables can't be lost.
PROTECTED_STACKS = ("prod",)


def stack_from_urn(urn: str) -> str:
    """urn:pulumi:<stack>::<project>::<type>::<name> -> <stack>"""
    parts = urn.split(":")
    return parts[2] if len(parts) > 2 and parts[0] == "urn" else ""


def is_protected_stack(urn: str) -> bool:
    """Read from the URN, not from stack config, so a config edit can't opt a
    prod stack out of the data rules."""
    return stack_from_urn(urn) in PROTECTED_STACKS


# --- 1. Protect data (prod stacks only) ---------------------------------------
def check_table_protection(props: dict, protected: bool) -> list[str]:
    """A data table keeps three safeguards on: Pulumi protect (the engine refuses
    to delete or replace it), AWS deletion protection (AWS refuses DeleteTable),
    and point-in-time recovery (its data can be restored)."""
    problems = []
    if not protected:
        problems.append(
            "DynamoDB tables must set opts=pulumi.ResourceOptions(protect=True). "
            "Removing protection from a prod data table is a decision for a person."
        )
    if props.get("deletionProtectionEnabled") is not True:
        problems.append("DynamoDB tables must set deletion_protection_enabled=True (set protectData: true in Pulumi.prod.yaml).")
    if (props.get("pointInTimeRecovery") or {}).get("enabled") is not True:
        problems.append("DynamoDB tables must keep point_in_time_recovery enabled.")
    return problems


def check_table_present(resource_types: list[str]) -> list[str]:
    """Resource policies only see resources the program still declares, so a
    table removed from the code would slip past them. This stack-level check
    catches it."""
    if TABLE_TYPE not in resource_types:
        return ["This stack must keep its DynamoDB table. Removing it from the code would delete every stored entry."]
    return []


# --- 2. No new identities --------------------------------------------------------
def check_no_iam(resource_type: str) -> list[str]:
    """App stacks never declare IAM. Roles and policies are created by a person in
    iam/, so a change can't grant itself, or anything else, new access."""
    if resource_type.startswith("aws:iam/"):
        return [
            (
                f"App stacks can't declare IAM resources ({resource_type}). "
                "Access changes go through iam/, which a person owns and deploys."
            )
        ]
    return []


# --- 3. No new exposure ----------------------------------------------------------
def check_public_permission(props: dict) -> list[str]:
    """The only thing anyone on the internet may invoke is the function URL.
    A permission for principal "*" must be scoped to that URL."""
    if props.get("principal") != "*":
        return []
    action = props.get("action")
    if action == "lambda:InvokeFunctionUrl" and props.get("functionUrlAuthType") == "NONE":
        return []
    if action == "lambda:InvokeFunction" and props.get("invokedViaFunctionUrl") is True:
        return []
    return [
        (
            f"A Lambda permission grants {action} to everyone (principal \"*\"). "
            "Public access is allowed only through the function URL."
        )
    ]


# --- 4. Cost ---------------------------------------------------------------------
def check_lambda_cost(props: dict) -> list[str]:
    problems = []
    memory = props.get("memorySize", 128)
    timeout = props.get("timeout", 3)
    if isinstance(memory, (int, float)) and memory > MAX_MEMORY_MB:
        problems.append(
            f"memorySize is {memory:g} MB; the limit is {MAX_MEMORY_MB} MB. "
            "Profile the function first, or ask the platform team for an exception."
        )
    if isinstance(timeout, (int, float)) and timeout > MAX_TIMEOUT_S:
        problems.append(f"timeout is {timeout:g}s; the limit is {MAX_TIMEOUT_S}s.")
    return problems


# --- 5. Ownership ----------------------------------------------------------------
def check_required_tags(props: dict) -> list[str]:
    tags = props.get("tags") or {}
    missing = [t for t in REQUIRED_TAGS if t not in tags]
    return [f"missing required tags: {', '.join(missing)} (use naming.tags())"] if missing else []
