import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { EventRouter } from "./eventRouter";

const config = new pulumi.Config();

const tags = { workshop: "aws-eventbridge-patterns" };

const handlerCode = `
exports.handler = async (event) => {
    console.log(JSON.stringify({ received: event["detail-type"], source: event.source, replay: event["replay-name"] ?? null, detail: event.detail }));
    return { ok: true };
};
`;

// Lambda target: inline Node.js 22 code, log group created up front so it is destroyed with the stack.
const logGroup = new aws.cloudwatch.LogGroup("orders-handler-logs", {
    name: "/aws/lambda/orders-handler",
    retentionInDays: 1,
    tags,
});

const lambdaRole = new aws.iam.Role("orders-handler-role", {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{ Effect: "Allow", Action: "sts:AssumeRole", Principal: { Service: "lambda.amazonaws.com" } }],
    }),
    tags,
});
new aws.iam.RolePolicyAttachment("orders-handler-logging", {
    role: lambdaRole.name,
    policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
});

const handler = new aws.lambda.Function("orders-handler", {
    name: "orders-handler",
    runtime: aws.lambda.Runtime.NodeJS22dX,
    handler: "index.handler",
    role: lambdaRole.arn,
    code: new pulumi.asset.AssetArchive({ "index.js": new pulumi.asset.StringAsset(handlerCode) }),
    loggingConfig: { logFormat: "Text", logGroup: logGroup.name },
    tags,
});

const cancelledQueue = new aws.sqs.Queue("orders-cancelled-queue", { name: "orders-cancelled", tags });

// The whole bus, both rules, both targets, the DLQ and its policy:
const orders = new EventRouter("orders", {
    busName: "orders",
    tags,
    // Archive every event on the bus for one day (step 8).
    archiveRetentionDays: 1,
    routes: [
        { name: "created", pattern: { "detail-type": ["order.created"] }, target: { kind: "lambda", fn: handler } },
        {
            name: "cancelled",
            pattern: { "detail-type": ["order.cancelled"] },
            target: {
                kind: "sqs",
                queue: cancelledQueue,
                inputPaths: { orderId: "$.detail.orderId", reason: "$.detail.reason" },
                inputTemplate: `{"orderId": <orderId>, "reason": <reason>, "kind": "cancellation"}`,
            },
        },
    ],
});

// Step 7: with addPlainTarget the stack also gets a plain EventTarget without a DLQ.
// The unit test and the policy pack both exist to catch exactly this.
if (config.getBoolean("addPlainTarget")) {
    const plainRule = new aws.cloudwatch.EventRule("plain-rule", {
        eventBusName: orders.busName,
        eventPattern: JSON.stringify({ "detail-type": ["order.plain"] }),
        tags,
    });
    new aws.cloudwatch.EventTarget("plain-target", {
        eventBusName: orders.busName,
        rule: plainRule.name,
        arn: handler.arn,
    });
}

export const busName = orders.busName;
export const busArn = orders.busArn;
export const createdRuleArn = orders.ruleArns.apply((r) => r["created"]);
export const cancelledRuleArn = orders.ruleArns.apply((r) => r["cancelled"]);
export const functionName = handler.name;
export const logGroupName = logGroup.name;
export const cancelledQueueUrl = cancelledQueue.url;
export const dlqUrl = orders.dlqUrl;
export const archiveArn = orders.archiveArn;
