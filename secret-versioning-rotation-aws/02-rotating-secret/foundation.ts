import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export interface FoundationArgs {
    // The Pulumi Cloud organization. ESC presents the audience `aws:<org>` to AWS.
    escOrg: string;
    // Reuse an OIDC provider for https://api.pulumi.com/oidc if the account already has one
    // (IAM allows one provider per URL per account).
    existingOidcProviderArn?: string;
}

// Step 2: the trust Pulumi ESC needs to reach AWS without a static key, the role it assumes,
// the execution role for the rotation Lambda, and an IAM user for the aws-iam rotator in step 8.
export class Foundation extends pulumi.ComponentResource {
    public readonly oidcProviderArn: pulumi.Output<string>;
    public readonly escRoleArn: pulumi.Output<string>;
    public readonly lambdaRoleArn: pulumi.Output<string>;
    public readonly demoUserArn: pulumi.Output<string>;
    public readonly demoUserName: pulumi.Output<string>;

    constructor(name: string, args: FoundationArgs, opts?: pulumi.ComponentResourceOptions) {
        super("workshop:index:Foundation", name, {}, opts);

        const provider = args.existingOidcProviderArn
            ? undefined
            : new aws.iam.OpenIdConnectProvider(`${name}-pulumi-oidc`, {
                url: "https://api.pulumi.com/oidc",
                clientIdLists: [`aws:${args.escOrg}`],
            }, { parent: this });
        const providerArn = provider ? provider.arn : pulumi.output(args.existingOidcProviderArn!);

        const demoUser = new aws.iam.User(`${name}-rotated-user`, {
            name: `${name}-rotated-user`,
            forceDestroy: true,
        }, { parent: this });

        const escRole = new aws.iam.Role(`${name}-esc-role`, {
            assumeRolePolicy: providerArn.apply(arn => JSON.stringify({
                Version: "2012-10-17",
                Statement: [{
                    Effect: "Allow",
                    Principal: { Federated: arn },
                    Action: "sts:AssumeRoleWithWebIdentity",
                    Condition: {
                        StringEquals: { "api.pulumi.com/oidc:aud": `aws:${args.escOrg}` },
                        StringLike: { "api.pulumi.com/oidc:sub": `pulumi:environments:org:${args.escOrg}:env:*` },
                    },
                }],
            })),
        }, { parent: this });

        new aws.iam.RolePolicy(`${name}-esc-policy`, {
            role: escRole.id,
            policy: demoUser.arn.apply(userArn => JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                    {
                        Sid: "ReadDemoSecrets",
                        Effect: "Allow",
                        Action: ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"],
                        Resource: "arn:aws:secretsmanager:*:*:secret:workshop/*",
                    },
                    {
                        Sid: "RotateDemoUserKeys",
                        Effect: "Allow",
                        Action: ["iam:CreateAccessKey", "iam:DeleteAccessKey", "iam:ListAccessKeys", "iam:UpdateAccessKey"],
                        Resource: userArn,
                    },
                ],
            })),
        }, { parent: this });

        const lambdaRole = new aws.iam.Role(`${name}-lambda-role`, {
            assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({ Service: "lambda.amazonaws.com" }),
            managedPolicyArns: [aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole],
        }, { parent: this });

        new aws.iam.RolePolicy(`${name}-lambda-policy`, {
            role: lambdaRole.id,
            policy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                    {
                        Sid: "RotateDemoSecrets",
                        Effect: "Allow",
                        Action: [
                            "secretsmanager:DescribeSecret",
                            "secretsmanager:GetSecretValue",
                            "secretsmanager:PutSecretValue",
                            "secretsmanager:UpdateSecretVersionStage",
                        ],
                        Resource: "arn:aws:secretsmanager:*:*:secret:workshop/*",
                    },
                    { Sid: "GeneratePassword", Effect: "Allow", Action: "secretsmanager:GetRandomPassword", Resource: "*" },
                ],
            }),
        }, { parent: this });

        this.oidcProviderArn = providerArn;
        this.escRoleArn = escRole.arn;
        this.lambdaRoleArn = lambdaRole.arn;
        this.demoUserArn = demoUser.arn;
        this.demoUserName = demoUser.name;
        this.registerOutputs({
            oidcProviderArn: this.oidcProviderArn,
            escRoleArn: this.escRoleArn,
            lambdaRoleArn: this.lambdaRoleArn,
            demoUserArn: this.demoUserArn,
            demoUserName: this.demoUserName,
        });
    }
}
