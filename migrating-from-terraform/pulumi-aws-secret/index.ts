import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
const secretValue = config.requireSecret("mySecretValue");

const secret = new aws.secretsmanager.Secret("mySecret", {
    name: "mySecretName",
});

const secretVersion = new aws.secretsmanager.SecretVersion("mySecretVersion", {
    secretId: secret.id,
    secretString: secretValue,
});

export const secretArn = secret.arn;
export const secretName = secret.name;