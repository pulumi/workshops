import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

// The stop. One function for the whole stack: when a team's output-token alarm goes to
// ALARM it calls this function, and the function puts a Deny on bedrock:InvokeModel* on
// that team's role. The team's next call fails with AccessDenied. The cutoff stays until
// a human lifts it (scripts/restore.sh); the alarm going back to OK does not lift it.
//
// Each alarm names the role it guards in a CutoffRole tag, so the function never guesses
// from names. Its own permissions reach only the team roles and the team alarms.

export interface TokenCutoffArgs {
    /** AWS account id. */
    accountId: pulumi.Input<string>;
    /** Region of the alarms. */
    region: string;
    /** Prefix of the team role names the function may change, for example "bedrock-meter-". */
    roleNamePrefix: string;
    /** Name pattern of the alarms allowed to call the function, for example "bedrock-*-output-tokens". */
    alarmNamePattern: string;
}

export class TokenCutoff extends pulumi.ComponentResource {
    public readonly function: aws.lambda.Function;
    /** Name of the inline policy the function attaches to a team role. */
    public static readonly policyName = "token-cutoff";

    constructor(name: string, args: TokenCutoffArgs, opts?: pulumi.ComponentResourceOptions) {
        super("workshop:bedrock:TokenCutoff", name, {}, opts);

        const functionName = "bedrock-token-cutoff";
        const alarmArns = pulumi.interpolate`arn:aws:cloudwatch:${args.region}:${args.accountId}:alarm:${args.alarmNamePattern}`;

        const logGroup = new aws.cloudwatch.LogGroup(`${name}-logs`, {
            name: `/aws/lambda/${functionName}`,
            retentionInDays: 1,
        }, { parent: this });

        const role = new aws.iam.Role(`${name}-role`, {
            name: "bedrock-metering-token-cutoff",
            assumeRolePolicy: pulumi.jsonStringify({
                Version: "2012-10-17",
                Statement: [{
                    Effect: "Allow",
                    Principal: { Service: "lambda.amazonaws.com" },
                    Action: "sts:AssumeRole",
                }],
            }),
        }, { parent: this });

        const policy = new aws.iam.RolePolicy(`${name}-policy`, {
            role: role.id,
            policy: pulumi.jsonStringify({
                Version: "2012-10-17",
                Statement: [
                    {
                        Sid: "DenyInvokeOnTeamRoles",
                        Effect: "Allow",
                        Action: ["iam:PutRolePolicy", "iam:DeleteRolePolicy"],
                        Resource: pulumi.interpolate`arn:aws:iam::${args.accountId}:role/${args.roleNamePrefix}*`,
                    },
                    {
                        Sid: "ReadAlarmTags",
                        Effect: "Allow",
                        Action: ["cloudwatch:ListTagsForResource"],
                        Resource: alarmArns,
                    },
                    {
                        Sid: "WriteLogs",
                        Effect: "Allow",
                        Action: ["logs:CreateLogStream", "logs:PutLogEvents"],
                        Resource: pulumi.interpolate`${logGroup.arn}:*`,
                    },
                ],
            }),
        }, { parent: this });

        this.function = new aws.lambda.Function(`${name}-function`, {
            name: functionName,
            description: "Puts a Deny on Bedrock invocation on a team role when the team's token alarm fires",
            runtime: aws.lambda.Runtime.NodeJS22dX,
            handler: "index.handler",
            role: role.arn,
            code: new pulumi.asset.FileArchive("./cutoff"),
            timeout: 30,
            loggingConfig: { logFormat: "Text", logGroup: logGroup.name },
            environment: { variables: { POLICY_NAME: TokenCutoff.policyName } },
        }, { parent: this, dependsOn: [policy] });

        // CloudWatch alarms call Lambda through this service principal.
        new aws.lambda.Permission(`${name}-alarms-may-call`, {
            action: "lambda:InvokeFunction",
            function: this.function.name,
            principal: "lambda.alarms.cloudwatch.amazonaws.com",
            sourceAccount: args.accountId,
            sourceArn: alarmArns,
        }, { parent: this });

        this.registerOutputs({ functionArn: this.function.arn });
    }
}
