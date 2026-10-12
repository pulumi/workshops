import * as assert from "assert";
import * as pulumi from "@pulumi/pulumi";

// Records every resource the program registers, so the test can inspect inputs.
type Recorded = { type: string; name: string; inputs: any };
const resources: Recorded[] = [];

pulumi.runtime.setMocks({
    newResource: (args: pulumi.runtime.MockResourceArgs) => {
        resources.push({ type: args.type, name: args.name, inputs: args.inputs });
        return {
            id: `${args.name}_id`,
            state: {
                ...args.inputs,
                arn: `arn:aws:mock:eu-central-1:000000000000:${args.name}`,
                url: `https://sqs.eu-central-1.amazonaws.com/000000000000/${args.name}`,
                name: args.inputs.name ?? args.name,
            },
        };
    },
    call: (args: pulumi.runtime.MockCallArgs) => args.inputs,
}, "aws-eventbridge-patterns", "test", false);

describe("EventRouter", () => {
    before(async () => {
        const aws = await import("@pulumi/aws");
        const { EventRouter } = await import("../eventRouter");
        const fn = new aws.lambda.Function("fn", {
            runtime: aws.lambda.Runtime.NodeJS22dX,
            handler: "index.handler",
            role: "arn:aws:iam::000000000000:role/mock",
            code: new pulumi.asset.AssetArchive({ "index.js": new pulumi.asset.StringAsset("exports.handler = async () => ({});") }),
        });
        const queue = new aws.sqs.Queue("queue");
        new EventRouter("orders", {
            busName: "orders",
            routes: [
                { name: "created", pattern: { "detail-type": ["order.created"] }, target: { kind: "lambda", fn } },
                { name: "cancelled", pattern: { "detail-type": ["order.cancelled"] }, target: { kind: "sqs", queue } },
            ],
        });
        // PLAIN_TARGET=1 simulates a team that skips the component and writes a bare EventTarget.
        if (process.env.PLAIN_TARGET === "1") {
            new aws.cloudwatch.EventTarget("plain-target", { rule: "plain", arn: "arn:aws:sqs:eu-central-1:000000000000:plain" });
        }
        // Let the mock engine finish registering everything.
        await new Promise((resolve) => setTimeout(resolve, 200));
    });

    it("creates at least one event target", () => {
        assert.ok(resources.filter((r) => r.type === "aws:cloudwatch/eventTarget:EventTarget").length >= 2);
    });

    it("gives every event target a dead-letter queue", () => {
        const targets = resources.filter((r) => r.type === "aws:cloudwatch/eventTarget:EventTarget");
        const missing = targets.filter((t) => !t.inputs.deadLetterConfig).map((t) => t.name);
        assert.deepStrictEqual(missing, [], `event targets without deadLetterConfig: ${missing.join(", ")}`);
    });
});
