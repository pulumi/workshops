import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
// Step 4: set breakLambdaPermission to true to make the Lambda target fail on purpose.
const breakLambdaPermission = config.getBoolean("breakLambdaPermission") ?? false;

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

const bus = new aws.cloudwatch.EventBus("orders-bus", { name: "orders", tags });

const createdRule = new aws.cloudwatch.EventRule("orders-created-rule", {
    eventBusName: bus.name,
    eventPattern: JSON.stringify({ "detail-type": ["order.created"] }),
    tags,
});

const cancelledQueue = new aws.sqs.Queue("orders-cancelled-queue", { name: "orders-cancelled", tags });

const cancelledRule = new aws.cloudwatch.EventRule("orders-cancelled-rule", {
    eventBusName: bus.name,
    eventPattern: JSON.stringify({ "detail-type": ["order.cancelled"] }),
    tags,
});

// Dead-letter queue: standard SQS, same region. Only these two rules may write to it.
const dlq = new aws.sqs.Queue("orders-dlq", { name: "orders-dlq", messageRetentionSeconds: 345600, tags });
new aws.sqs.QueuePolicy("orders-dlq-policy", {
    queueUrl: dlq.url,
    policy: pulumi.jsonStringify({
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Principal: { Service: "events.amazonaws.com" },
            Action: "sqs:SendMessage",
            Resource: dlq.arn,
            Condition: { ArnEquals: { "aws:SourceArn": [createdRule.arn, cancelledRule.arn] } },
        }],
    }),
});

// Short retries so a failure reaches the DLQ within about a minute (default: 24 hours, 185 attempts).
// 60 seconds is the minimum MaximumEventAgeInSeconds the EventBridge API accepts.
const retryPolicy = { maximumEventAgeInSeconds: 60, maximumRetryAttempts: 2 };
const deadLetterConfig = { arn: dlq.arn };

new aws.cloudwatch.EventTarget("orders-created-target", {
    eventBusName: bus.name,
    rule: createdRule.name,
    arn: handler.arn,
    retryPolicy,
    deadLetterConfig,
});

// EventBridge needs permission to invoke the function. Wait about 30 seconds after the first deploy for IAM to settle.
// With breakLambdaPermission the permission is not created, so every delivery fails and ends up in the DLQ.
if (!breakLambdaPermission) {
    new aws.lambda.Permission("orders-created-permission", {
        action: "lambda:InvokeFunction",
        function: handler.name,
        principal: "events.amazonaws.com",
        sourceArn: createdRule.arn,
    });
}

new aws.cloudwatch.EventTarget("orders-cancelled-target", {
    eventBusName: bus.name,
    rule: cancelledRule.name,
    arn: cancelledQueue.arn,
    retryPolicy,
    deadLetterConfig,
    inputTransformer: {
        inputPaths: { orderId: "$.detail.orderId", reason: "$.detail.reason" },
        inputTemplate: `{"orderId": <orderId>, "reason": <reason>, "kind": "cancellation"}`,
    },
});

new aws.sqs.QueuePolicy("orders-cancelled-queue-policy", {
    queueUrl: cancelledQueue.url,
    policy: pulumi.jsonStringify({
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Principal: { Service: "events.amazonaws.com" },
            Action: "sqs:SendMessage",
            Resource: cancelledQueue.arn,
            Condition: { ArnEquals: { "aws:SourceArn": cancelledRule.arn } },
        }],
    }),
});

export const busName = bus.name;
export const busArn = bus.arn;
export const createdRuleArn = createdRule.arn;
export const cancelledRuleArn = cancelledRule.arn;
export const functionName = handler.name;
export const logGroupName = logGroup.name;
export const cancelledQueueUrl = cancelledQueue.url;
export const dlqUrl = dlq.url;
