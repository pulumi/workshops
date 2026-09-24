"""An AWS budget with a monthly limit and an 80%-of-limit alert threshold.

Step 1 of the "Cost-aware infrastructure as code" workshop. Everything an
attendee would otherwise click through in the AWS Billing console — the
limit, the time window, and the alert threshold — is provisioned here as
code instead.

Registry: https://www.pulumi.com/registry/packages/aws/api-docs/budgets/budget/
"""

import pulumi
import pulumi_aws as aws

config = pulumi.Config()
limit_amount = config.get("limitAmount") or "50"
alert_email = config.get("alertEmail") or "TODO(presenter)@example.com"

# budget_type and time_unit are the only fields the schema itself requires;
# limit_amount and a notification are set here because a budget with no
# limit and no alert would not demonstrate anything in this workshop.
budget = aws.budgets.Budget(
    "workshop-monthly-budget",
    name="cost-aware-iac-workshop",
    budget_type="COST",
    time_unit="MONTHLY",
    limit_amount=limit_amount,
    limit_unit="USD",
    notifications=[
        aws.budgets.BudgetNotificationArgs(
            comparison_operator="GREATER_THAN",
            notification_type="ACTUAL",
            threshold=80,
            threshold_type="PERCENTAGE",
            subscriber_email_addresses=[alert_email],
        ),
    ],
    tags={
        "CostCenter": "workshop-finops-demo",
    },
)

pulumi.export("budget_name", budget.name)
pulumi.export("limit_amount", budget.limit_amount)
