"""An AWS budget with a monthly limit and an alert at 80% of the limit.

Step 1 of the "Cost-aware infrastructure as code" workshop. The limit, the
time window and the alert threshold you would click through in the Billing
console are provisioned as code. Alerts go to an SNS topic and to an email
address, both created here.

Registry: https://www.pulumi.com/registry/packages/aws/api-docs/budgets/budget/
"""

import json

import pulumi
import pulumi_aws as aws

config = pulumi.Config()
limit_amount = config.get("limitAmount") or "50"
alert_email = config.require("alertEmail")

# AWS Budgets publishes to SNS as the budgets.amazonaws.com service principal,
# so the topic needs a policy that allows it.
topic = aws.sns.Topic("budget-alerts", name="cost-aware-iac-budget-alerts")

aws.sns.TopicPolicy(
    "budget-alerts-policy",
    arn=topic.arn,
    policy=topic.arn.apply(
        lambda arn: json.dumps(
            {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": {"Service": "budgets.amazonaws.com"},
                        "Action": "SNS:Publish",
                        "Resource": arn,
                    }
                ],
            }
        )
    ),
)

# The subscriber receives a confirmation email from AWS and must click it
# before SNS delivers anything.
aws.sns.TopicSubscription(
    "budget-alerts-email",
    topic=topic.arn,
    protocol="email",
    endpoint=alert_email,
)

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
            subscriber_sns_topic_arns=[topic.arn],
        ),
    ],
    tags={"CostCenter": "workshop-finops-demo"},
)

pulumi.export("budget_name", budget.name)
pulumi.export("limit_amount", budget.limit_amount)
pulumi.export("alert_topic_arn", topic.arn)
