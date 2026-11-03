import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { MeteredModelAccess } from "./meteredModelAccess";
import { TokenCutoff } from "./tokenCutoff";

// Stack config (Pulumi.dev.yaml; teams are edited there, the flags with `pulumi config set`):
//   teams              list of { name, costCenter, alarmOutputTokens?, dailyOutputTokens? };
//                      one MeteredModelAccess per entry; the two optional keys override the defaults below
//   model              "nova-2-lite" (default) or "nova-lite" (In-Region fallback)
//   alarmOutputTokens  default burst limit: output tokens per minute that trip a team's alarm
//   dailyOutputTokens  default daily limit: output tokens per UTC day that trip a team's alarm
//   demoViolations     adds an untagged profile and a wildcard invoke policy
//   enableBudget       adds an AWS Budget filtered by the Team tag
//   budgetEmail        recipient of the budget notification
const config = new pulumi.Config();
const accountId = aws.getCallerIdentityOutput().accountId;
interface Team { name: string; costCenter: string; alarmOutputTokens?: number; dailyOutputTokens?: number }
const teams = config.getObject<Team[]>("teams") ?? [];
const model = config.get("model") ?? "nova-2-lite";
const alarmOutputTokens = config.getNumber("alarmOutputTokens") ?? 3000;
const dailyOutputTokens = config.getNumber("dailyOutputTokens") ?? 100000;
const demoViolations = config.getBoolean("demoViolations") ?? false;
const enableBudget = config.getBoolean("enableBudget") ?? false;
const budgetEmail = config.get("budgetEmail");

const region = aws.config.region ?? "us-east-1";
const namespace = "Workshop/Bedrock";

// Nova 2 Lite is reached through its US geographic system-defined profile, which routes
// to several Regions, so the invoke policy must name the foundation model in each of them.
// Nova Lite is the In-Region fallback: one Region, copy straight from the model.
const models = {
    "nova-2-lite": {
        modelId: "amazon.nova-2-lite-v1:0",
        copyFrom: pulumi.interpolate`arn:aws:bedrock:${region}:${accountId}:inference-profile/us.amazon.nova-2-lite-v1:0`,
        // The system-defined profile knows which Regions it routes to; read the list
        // from it rather than hard-coding Regions that AWS may add to later.
        routedModelArns: aws.bedrock.getInferenceProfileOutput({ inferenceProfileId: "us.amazon.nova-2-lite-v1:0" })
            .models.apply(ms => ms.map(m => m.modelArn)),
    },
    "nova-lite": {
        modelId: "amazon.nova-lite-v1:0",
        copyFrom: pulumi.output(`arn:aws:bedrock:${region}::foundation-model/amazon.nova-lite-v1:0`),
        routedModelArns: pulumi.output([`arn:aws:bedrock:${region}::foundation-model/amazon.nova-lite-v1:0`]),
    },
};
if (!(model in models)) {
    throw new Error(`config "model" must be one of ${Object.keys(models).join(", ")}; got "${model}"`);
}
const selected = models[model as keyof typeof models];
const routedModelArns = selected.routedModelArns;

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
                ArnLike: { "aws:SourceArn": pulumi.interpolate`arn:aws:bedrock:${region}:${accountId}:*` },
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

// The stop: one function that every team alarm calls. It puts a Deny on Bedrock
// invocation on the team role named in the alarm's CutoffRole tag.
const cutoff = new TokenCutoff("cutoff", {
    accountId,
    region,
    roleNamePrefix: "bedrock-meter-",
    alarmNamePattern: "bedrock-*-output-tokens",
});

// Teams: one component each. A team's own limits win over the stack defaults.
const access = teams.map(team => new MeteredModelAccess(team.name, {
    team: team.name,
    costCenter: team.costCenter,
    copyFromArn: selected.copyFrom,
    routedModelArns,
    accountId,
    logGroupName: logGroup.name,
    metricNamespace: namespace,
    alarmOutputTokens: team.alarmOutputTokens ?? alarmOutputTokens,
    dailyOutputTokens: team.dailyOutputTokens ?? dailyOutputTokens,
    cutoff: cutoff.function,
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
            ? [{ type: "text", width: 24, height: 3, properties: { markdown: "No teams yet. Add one to teams in Pulumi.dev.yaml." } }]
            : [widget("Input tokens per team", a => a.inputMetric), widget("Output tokens per team", a => a.outputMetric)],
    }),
});

// The two mistakes the policy pack in policy/ exists to stop (`pulumi config set demoViolations true`).
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

// Optional (`pulumi config set enableBudget true`): spend per Team tag. The tag must be activated as a cost allocation
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
export const teamLimits = Object.fromEntries(teams.map(t => [t.name, {
    perMinute: t.alarmOutputTokens ?? alarmOutputTokens,
    perDay: t.dailyOutputTokens ?? dailyOutputTokens,
}]));
// One stop: everything a team is handed, plus its effective limits.
export const teamsOut = Object.fromEntries(access.map((a, i) => [teams[i].name, {
    role: a.roleArn,
    profile: a.profileArn,
    perMinute: teamLimits[teams[i].name].perMinute,
    perDay: teamLimits[teams[i].name].perDay,
}]));
export const modelId = selected.modelId;
export const cutoffFunction = cutoff.function.name;
