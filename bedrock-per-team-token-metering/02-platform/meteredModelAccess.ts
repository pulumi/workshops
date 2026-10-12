import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

// One team's slice of Amazon Bedrock: a tagged application inference profile,
// a role that can invoke only through that profile, two metric filters that turn
// the invocation log into per-team token counts, and an alarm on output tokens.

export interface MeteredModelAccessArgs {
    /** Team name, for example "search". Becomes the Team tag and part of every name. */
    team: pulumi.Input<string>;
    /** Value of the CostCenter tag on the inference profile. */
    costCenter: pulumi.Input<string>;
    /** ARN the profile copies from: a system-defined inference profile or a foundation model. */
    copyFromArn: pulumi.Input<string>;
    /** Foundation model ARNs the copied profile routes to (every destination Region). */
    routedModelArns: pulumi.Input<string>[];
    /** AWS account id; the role's trust policy names the account root. */
    accountId: pulumi.Input<string>;
    /** CloudWatch Logs log group that receives the Bedrock invocation log. */
    logGroupName: pulumi.Input<string>;
    /** CloudWatch metric namespace for the token counters. */
    metricNamespace: string;
    /** The alarm fires when a team sums more output tokens than this in one minute. */
    alarmOutputTokens: number;
}

export class MeteredModelAccess extends pulumi.ComponentResource {
    public readonly profileArn: pulumi.Output<string>;
    public readonly roleArn: pulumi.Output<string>;
    public readonly roleName: string;
    public readonly inputMetric: string;
    public readonly outputMetric: string;
    public readonly alarmName: string;

    constructor(name: string, args: MeteredModelAccessArgs, opts?: pulumi.ComponentResourceOptions) {
        super("workshop:bedrock:MeteredModelAccess", name, {}, opts);

        const tags = { Team: args.team, CostCenter: args.costCenter, Workshop: "bedrock-per-team-token-metering" };

        // The profile is the unit of attribution: its ARN is what callers pass as modelId.
        const profile = new aws.bedrock.InferenceProfile(`${name}-profile`, {
            name: pulumi.interpolate`${args.team}-nova`,
            description: pulumi.interpolate`Per-team profile for ${args.team}`,
            modelSource: { copyFrom: args.copyFromArn },
            tags,
        }, { parent: this });

        // The role can invoke through this profile and nothing else. Calls through the
        // profile are authorized on the profile ARN and on each routed model ARN; the
        // bedrock:InferenceProfileArn condition stops direct calls to the model.
        this.roleName = `bedrock-meter-${name}`;
        const role = new aws.iam.Role(`${name}-role`, {
            name: this.roleName,
            assumeRolePolicy: pulumi.jsonStringify({
                Version: "2012-10-17",
                Statement: [{
                    Effect: "Allow",
                    Principal: { AWS: pulumi.interpolate`arn:aws:iam::${args.accountId}:root` },
                    Action: "sts:AssumeRole",
                }],
            }),
            tags,
        }, { parent: this });

        new aws.iam.RolePolicy(`${name}-invoke`, {
            role: role.id,
            policy: pulumi.jsonStringify({
                Version: "2012-10-17",
                Statement: [
                    {
                        Sid: "InvokeThroughOwnProfile",
                        Effect: "Allow",
                        Action: ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"],
                        Resource: [profile.arn],
                    },
                    {
                        Sid: "RoutedModelsOnlyViaOwnProfile",
                        Effect: "Allow",
                        Action: ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"],
                        Resource: args.routedModelArns,
                        Condition: { StringEquals: { "bedrock:InferenceProfileArn": profile.arn } },
                    },
                ],
            }),
        }, { parent: this });

        // The invocation log is JSON. identity.arn is the assumed-role ARN of the caller,
        // so a wildcard on the role name attributes every call to the team.
        const pattern = `{ $.identity.arn = "*:assumed-role/${this.roleName}/*" }`;
        this.inputMetric = `${name}-InputTokens`;
        this.outputMetric = `${name}-OutputTokens`;
        this.alarmName = `bedrock-${name}-output-tokens`;

        new aws.cloudwatch.LogMetricFilter(`${name}-input-tokens`, {
            name: `${name}-input-tokens`,
            logGroupName: args.logGroupName,
            pattern,
            metricTransformation: { namespace: args.metricNamespace, name: this.inputMetric, value: "$.input.inputTokenCount", unit: "Count" },
        }, { parent: this });

        new aws.cloudwatch.LogMetricFilter(`${name}-output-tokens`, {
            name: `${name}-output-tokens`,
            logGroupName: args.logGroupName,
            pattern,
            metricTransformation: { namespace: args.metricNamespace, name: this.outputMetric, value: "$.output.outputTokenCount", unit: "Count" },
        }, { parent: this });

        new aws.cloudwatch.MetricAlarm(`${name}-output-alarm`, {
            name: this.alarmName,
            alarmDescription: pulumi.interpolate`Team ${args.team} produced more than ${args.alarmOutputTokens} output tokens in one minute`,
            namespace: args.metricNamespace,
            metricName: this.outputMetric,
            statistic: "Sum",
            period: 60,
            evaluationPeriods: 1,
            threshold: args.alarmOutputTokens,
            comparisonOperator: "GreaterThanThreshold",
            treatMissingData: "notBreaching",
            tags,
        }, { parent: this });

        this.profileArn = profile.arn;
        this.roleArn = role.arn;
        this.registerOutputs({ profileArn: this.profileArn, roleArn: this.roleArn });
    }
}
