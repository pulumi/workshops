import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

/** A Lambda function the bus invokes. The component creates the invoke permission. */
export interface LambdaTarget {
    kind: "lambda";
    fn: aws.lambda.Function;
}

/** An SQS queue the bus writes to. The component creates the queue policy. One route per queue. */
export interface QueueTarget {
    kind: "sqs";
    queue: aws.sqs.Queue;
    /** Optional input transformer: JSON paths and a template. */
    inputPaths?: Record<string, string>;
    inputTemplate?: string;
}

export interface Route {
    /** Short name, used in resource names: `<router>-<route>-rule`. */
    name: string;
    /** Event pattern as a plain object. */
    pattern: Record<string, unknown>;
    target: LambdaTarget | QueueTarget;
}

export interface EventRouterArgs {
    /** Physical name of the custom bus. */
    busName: string;
    routes: Route[];
    /** Set to create an archive of every event on the bus. */
    archiveRetentionDays?: number;
    tags?: Record<string, string>;
}

/**
 * A custom EventBridge bus with rules, targets and a dead-letter queue.
 * Every target gets the DLQ and a short retry policy; there is no way to create one without them.
 */
export class EventRouter extends pulumi.ComponentResource {
    public readonly busName: pulumi.Output<string>;
    public readonly busArn: pulumi.Output<string>;
    public readonly ruleArns: pulumi.Output<Record<string, string>>;
    public readonly dlqUrl: pulumi.Output<string>;
    public readonly archiveArn: pulumi.Output<string> | undefined;

    constructor(name: string, args: EventRouterArgs, opts?: pulumi.ComponentResourceOptions) {
        super("workshop:index:EventRouter", name, {}, opts);

        // The workshop first builds these resources at the top level of the stack (steps 2 to 4).
        // The alias tells Pulumi they are the same resources, now with this component as parent,
        // so moving them into the component does not replace anything.
        const moved = (logicalName: string): pulumi.CustomResourceOptions => ({
            parent: this,
            aliases: [{ name: logicalName, parent: pulumi.rootStackResource }],
        });

        const bus = new aws.cloudwatch.EventBus(`${name}-bus`, { name: args.busName, tags: args.tags }, moved(`${name}-bus`));

        const rules = args.routes.map((route) => ({
            route,
            rule: new aws.cloudwatch.EventRule(`${name}-${route.name}-rule`, {
                eventBusName: bus.name,
                eventPattern: JSON.stringify(route.pattern),
                tags: args.tags,
            }, moved(`${name}-${route.name}-rule`)),
        }));

        // Standard SQS queue, same region. Only this router's rules may write to it.
        const dlq = new aws.sqs.Queue(`${name}-dlq`, {
            name: `${name}-dlq`,
            messageRetentionSeconds: 345600,
            tags: args.tags,
        }, moved(`${name}-dlq`));

        new aws.sqs.QueuePolicy(`${name}-dlq-policy`, {
            queueUrl: dlq.url,
            policy: pulumi.jsonStringify({
                Version: "2012-10-17",
                Statement: [{
                    Effect: "Allow",
                    Principal: { Service: "events.amazonaws.com" },
                    Action: "sqs:SendMessage",
                    Resource: dlq.arn,
                    Condition: { ArnEquals: { "aws:SourceArn": rules.map((r) => r.rule.arn) } },
                }],
            }),
        }, moved(`${name}-dlq-policy`));

        // 60 seconds is the minimum MaximumEventAgeInSeconds the EventBridge API accepts.
        const retryPolicy = { maximumEventAgeInSeconds: 60, maximumRetryAttempts: 2 };
        const deadLetterConfig = { arn: dlq.arn };

        for (const { route, rule } of rules) {
            const t = route.target;
            if (t.kind === "lambda") {
                new aws.cloudwatch.EventTarget(`${name}-${route.name}-target`, {
                    eventBusName: bus.name,
                    rule: rule.name,
                    arn: t.fn.arn,
                    retryPolicy,
                    deadLetterConfig,
                }, moved(`${name}-${route.name}-target`));
                new aws.lambda.Permission(`${name}-${route.name}-permission`, {
                    action: "lambda:InvokeFunction",
                    function: t.fn.name,
                    principal: "events.amazonaws.com",
                    sourceArn: rule.arn,
                }, moved(`${name}-${route.name}-permission`));
            } else {
                new aws.cloudwatch.EventTarget(`${name}-${route.name}-target`, {
                    eventBusName: bus.name,
                    rule: rule.name,
                    arn: t.queue.arn,
                    retryPolicy,
                    deadLetterConfig,
                    inputTransformer: t.inputPaths && t.inputTemplate
                        ? { inputPaths: t.inputPaths, inputTemplate: t.inputTemplate }
                        : undefined,
                }, moved(`${name}-${route.name}-target`));
                new aws.sqs.QueuePolicy(`${name}-${route.name}-queue-policy`, {
                    queueUrl: t.queue.url,
                    policy: pulumi.jsonStringify({
                        Version: "2012-10-17",
                        Statement: [{
                            Effect: "Allow",
                            Principal: { Service: "events.amazonaws.com" },
                            Action: "sqs:SendMessage",
                            Resource: t.queue.arn,
                            Condition: { ArnEquals: { "aws:SourceArn": rule.arn } },
                        }],
                    }),
                }, moved(`${name}-${route.name}-queue-policy`));
            }
        }

        if (args.archiveRetentionDays !== undefined) {
            const archive = new aws.cloudwatch.EventArchive(`${name}-archive`, {
                name: `${name}-archive`,
                eventSourceArn: bus.arn,
                retentionDays: args.archiveRetentionDays,
            }, { parent: this });
            this.archiveArn = archive.arn;
        }

        this.busName = bus.name;
        this.busArn = bus.arn;
        this.ruleArns = pulumi.all(rules.map((r) => pulumi.all([r.route.name, r.rule.arn]))).apply(
            (pairs) => Object.fromEntries(pairs));
        this.dlqUrl = dlq.url;

        this.registerOutputs({
            busName: this.busName,
            busArn: this.busArn,
            ruleArns: this.ruleArns,
            dlqUrl: this.dlqUrl,
            archiveArn: this.archiveArn,
        });
    }
}
