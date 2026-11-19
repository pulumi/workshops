import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as random from "@pulumi/random";

export interface RotatingSecretArgs {
    // Execution role for the rotation Lambda (from the foundation).
    lambdaRoleArn: pulumi.Input<string>;
    // Step 3 creates the secret only. Step 4 turns the rotation on.
    rotate: boolean;
    automaticallyAfterDays?: number;
}

// A Secrets Manager secret with its first version and, when `rotate` is set, the Lambda that
// rotates it and the SecretRotation that schedules the Lambda.
export class RotatingSecret extends pulumi.ComponentResource {
    public readonly secretArn: pulumi.Output<string>;
    public readonly secretName: pulumi.Output<string>;

    constructor(name: string, args: RotatingSecretArgs, opts?: pulumi.ComponentResourceOptions) {
        super("workshop:index:RotatingSecret", name, {}, opts);

        // recoveryWindowInDays 0 deletes the secret at once on destroy, so the demo can be re-run.
        const secret = new aws.secretsmanager.Secret(`${name}-secret`, {
            name: `workshop/${pulumi.getStack()}/${name}`,
            description: "Workshop demo: app signing token",
            recoveryWindowInDays: 0,
        }, { parent: this });

        // The first version is a random token. It gets the AWSCURRENT label.
        const initial = new random.RandomPassword(`${name}-initial`, {
            length: 32,
            special: false,
        }, { parent: this });

        const version = new aws.secretsmanager.SecretVersion(`${name}-v1`, {
            secretId: secret.id,
            secretString: initial.result,
        }, { parent: this });

        if (args.rotate) {
            const fn = new aws.lambda.Function(`${name}-rotation`, {
                runtime: aws.lambda.Runtime.Python3d14,
                handler: "lambda_function.lambda_handler",
                role: args.lambdaRoleArn,
                timeout: 30,
                code: new pulumi.asset.AssetArchive({
                    "lambda_function.py": new pulumi.asset.FileAsset("./lambda/rotation.py"),
                }),
            }, { parent: this });

            // Secrets Manager invokes the function, so it needs a resource-based permission.
            const permission = new aws.lambda.Permission(`${name}-allow-secretsmanager`, {
                action: "lambda:InvokeFunction",
                function: fn.name,
                principal: "secretsmanager.amazonaws.com",
                sourceArn: secret.arn,
            }, { parent: this });

            // rotateImmediately is off: the presenter triggers the first rotation in step 5.
            new aws.secretsmanager.SecretRotation(`${name}-rotation`, {
                secretId: secret.id,
                rotationLambdaArn: fn.arn,
                rotateImmediately: false,
                rotationRules: { automaticallyAfterDays: args.automaticallyAfterDays ?? 1 },
            }, { parent: this, dependsOn: [permission, version] });
        }

        this.secretArn = secret.arn;
        this.secretName = secret.name;
        this.registerOutputs({ secretArn: this.secretArn, secretName: this.secretName });
    }
}
