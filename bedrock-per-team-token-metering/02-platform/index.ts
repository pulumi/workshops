import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { MeteredModelAccess } from "./meteredModelAccess";

// Stack config (all set by the scripts in 03-first-team .. 10-budget):
//   accountId          AWS account id (the scripts read it from `aws sts get-caller-identity`)
//   teams              list of { name, costCenter }; one MeteredModelAccess per entry
//   model              "nova-2-lite" (default) or "nova-lite" (In-Region fallback)
//   alarmOutputTokens  per-team output tokens per minute that trips the alarm
//   demoViolations     step 8: adds an untagged profile and a wildcard invoke policy
//   enableBudget       step 10: adds an AWS Budget filtered by the Team tag
//   budgetEmail        recipient of the budget notification
const config = new pulumi.Config();
const accountId = config.require("accountId");
const teams = config.getObject<{ name: string; costCenter: string }[]>("teams") ?? [];
const model = config.get("model") ?? "nova-2-lite";
const alarmOutputTokens = config.getNumber("alarmOutputTokens") ?? 2000;
const demoViolations = config.getBoolean("demoViolations") ?? false;
const enableBudget = config.getBoolean("enableBudget") ?? false;
const budgetEmail = config.get("budgetEmail");

const region = aws.config.region ?? "us-east-1";
const namespace = "Workshop/Bedrock";

// Nova 2 Lite is reached through its US geographic system-defined profile, which routes
// to three Regions, so the invoke policy must name the foundation model in all three.
// Nova Lite is the In-Region fallback: one Region, copy straight from the model.
const models = {
    "nova-2-lite": {
        modelId: "amazon.nova-2-lite-v1:0",
        copyFrom: `arn:aws:bedrock:${region}:${accountId}:inference-profile/us.amazon.nova-2-lite-v1:0`,
        regions: ["us-east-1", "us-east-2", "us-west-2"],
    },
    "nova-lite": {
        modelId: "amazon.nova-lite-v1:0",
        copyFrom: `arn:aws:bedrock:${region}::foundation-model/amazon.nova-lite-v1:0`,
        regions: [region],
    },
} as const;
if (!(model in models)) {
    throw new Error(`config "model" must be one of ${Object.keys(models).join(", ")}; got "${model}"`);
}
const selected = models[model as keyof typeof models];
const routedModelArns = selected.regions.map(r => `arn:aws:bedrock:${r}::foundation-model/${selected.modelId}`);

// Foundation: the invocation log. Bedrock invocation logging is one setting per account
// and Region, which is why this project is a single stack.
const logGroup = new aws.cloudwatch.LogGroup("invocations", {
    name: "/workshop/bedrock-invocations",
    retentionInDays: 1,
});

const logWriter = new aws.iam.Role("log-writer", {
    name: "bedrock-metering-log-writer",
    assumeRolePolicy: pulumi.jsonStringify({
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Principal: { Service: "bedrock.amazonaws.com" },
            Action: "sts:AssumeRole",
            Condition: {
                StringEquals: { "aws:SourceAccount": accountId },
                ArnLike: { "aws:SourceArn": `arn:aws:bedrock:${region}:${accountId}:*` },
            },
        }],
    }),
});

const logWriterPolicy = new aws.iam.RolePolicy("log-writer-policy", {
    role: logWriter.id,
    policy: pulumi.jsonStringify({
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Action: ["logs:CreateLogStream", "logs:PutLogEvents"],
            Resource: pulumi.interpolate`${logGroup.arn}:log-stream:*`,
        }],
    }),
});

new aws.bedrockmodel.InvocationLoggingConfiguration("logging", {
    loggingConfig: {
        textDataDeliveryEnabled: true,
        cloudwatchConfig: { logGroupName: logGroup.name, roleArn: logWriter.arn },
    },
}, { dependsOn: [logWriterPolicy] });

// Teams: one component each.
const access = teams.map(team => new MeteredModelAccess(team.name, {
    team: team.name,
    costCenter: team.costCenter,
    copyFromArn: selected.copyFrom,
    routedModelArns,
    accountId,
    logGroupName: logGroup.name,
    metricNamespace: namespace,
    alarmOutputTokens,
}));

// Dashboard: one line per team for input and for output tokens.
const widget = (title: string, metric: (a: MeteredModelAccess) => string) => ({
    type: "metric", width: 12, height: 6,
    properties: {
        title, region, view: "timeSeries", stat: "Sum", period: 60,
        metrics: access.map(a => [namespace, metric(a), { label: a.roleName.replace("bedrock-meter-", "") }]),
    },
});
new aws.cloudwatch.Dashboard("tokens", {
    dashboardName: "bedrock-tokens-per-team",
    dashboardBody: JSON.stringify({
        widgets: access.length === 0
            ? [{ type: "text", width: 24, height: 3, properties: { markdown: "No teams yet. Add one with 03-first-team/up.sh." } }]
            : [widget("Input tokens per team", a => a.inputMetric), widget("Output tokens per team", a => a.outputMetric)],
    }),
});

// Step 8: the two mistakes the policy pack in 07-policy exists to stop.
if (demoViolations) {
    // No Team or CostCenter tag, so nobody can be billed for it.
    new aws.bedrock.InferenceProfile("unowned-profile", {
        name: "unowned-nova",
        description: "Profile without cost allocation tags",
        modelSource: { copyFrom: selected.copyFrom },
    });
    // Invoke on every model and profile, bypassing the per-team scoping.
    new aws.iam.RolePolicy("invoke-anything", {
        role: logWriter.id,
        policy: pulumi.jsonStringify({
            Version: "2012-10-17",
            Statement: [{ Effect: "Allow", Action: ["bedrock:InvokeModel*"], Resource: "*" }],
        }),
    });
}

// Step 10 (optional): spend per Team tag. The tag must be activated as a cost allocation
// tag in the Billing console first; AWS needs up to 24 hours for that, and the data
// follows up to 24 hours later, so this is shown pre-baked in the talk.
if (enableBudget) {
    new aws.budgets.Budget("bedrock-per-team", {
        name: "bedrock-per-team",
        budgetType: "COST",
        limitAmount: "5",
        limitUnit: "USD",
        timeUnit: "MONTHLY",
        costFilters: [{ name: "TagKeyValue", values: teams.map(t => `user:Team$${t.name}`) }],
        notifications: budgetEmail ? [{
            comparisonOperator: "GREATER_THAN",
            threshold: 80,
            thresholdType: "PERCENTAGE",
            notificationType: "ACTUAL",
            subscriberEmailAddresses: [budgetEmail],
        }] : [],
    });
}

export const logGroupName = logGroup.name;
export const teamProfiles = Object.fromEntries(access.map(a => [a.roleName.replace("bedrock-meter-", ""), a.profileArn]));
export const teamRoles = Object.fromEntries(access.map(a => [a.roleName.replace("bedrock-meter-", ""), a.roleArn]));
export const modelId = selected.modelId;
