import * as aws from "@pulumi/aws";
import { PolicyPack, validateResourceOfType } from "@pulumi/policy";

new PolicyPack("eventbridge-guardrails", {
    policies: [
        {
            name: "eventbridge-target-has-dlq",
            description: "Every EventBridge target must have a dead-letter queue, so a failed delivery is never dropped.",
            enforcementLevel: "mandatory",
            validateResource: validateResourceOfType(aws.cloudwatch.EventTarget, (target, _args, reportViolation) => {
                if (!target.deadLetterConfig) {
                    reportViolation("EventBridge target has no deadLetterConfig. Set deadLetterConfig.arn to an SQS queue, or use the EventRouter component.");
                }
            }),
        },
    ],
});
