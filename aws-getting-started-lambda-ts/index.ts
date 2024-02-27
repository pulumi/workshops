import * as aws from "@pulumi/aws";
import * as docker from "@pulumi/docker";
import * as pulumi from "@pulumi/pulumi";

const repository = new aws.ecr.Repository("myrepository", {
    name: "my-first-pulumi-lambda",
    forceDelete: true,
});

const registryInfo = repository.registryId.apply(async id => {
    const credentials = await aws.ecr.getCredentials({registryId: id});
    const decodedCredentials = Buffer.from(credentials.authorizationToken, "base64").toString();
    const [username, password] = decodedCredentials.split(":");
    if (!password || !username) {
        throw new Error("Invalid credentials");
    }
    return {
        server: credentials.proxyEndpoint,
        username: username,
        password: password,
    };
});

const image = new docker.Image("my-image", {
    build: {
        context: "app",
        platform: "linux/arm64",
    },
    imageName: repository.repositoryUrl,
    registry: registryInfo,
});

export const repoDigest = image.repoDigest;

const lambda = new aws.lambda.Function("mylambda", {
    name: "my-first-pulumi-lambda",
    imageUri: image.repoDigest,
    packageType: "Image",
    role: new aws.iam.Role("mylambda-role", {
        assumeRolePolicy: JSON.stringify({
            Version: "2012-10-17",
            Statement: [{
                Action: "sts:AssumeRole",
                Effect: "Allow",
                Principal: {
                    Service: "lambda.amazonaws.com",
                },
            }],
        }),
    }).arn,
    timeout: 300,
    memorySize: 128,
    architectures: ["arm64"],
});

const lambdaPermission = new aws.lambda.Permission("mylambda-permission", {
    action: "lambda:InvokeFunction",
    statementId: "AllowAPIGatewayInvoke",
    function: lambda,
    principal: "apigateway.amazonaws.com",
});

const apiGatewayRestApi = new aws.apigateway.RestApi("myapi", {
    name: "my-first-pulumi-api",
})

const apiGatewayResource = new aws.apigateway.Resource("myapiresource", {
    parentId: apiGatewayRestApi.rootResourceId,
    pathPart: "dad-joke",
    restApi: apiGatewayRestApi.id,
});

const apiGatewayMethod = new aws.apigateway.Method("myapimethod", {
    restApi: apiGatewayRestApi.id,
    resourceId: apiGatewayResource.id,
    httpMethod: "GET",
    authorization: "NONE",
});

const apiGatewayIntegration = new aws.apigateway.Integration("myapiintegration", {
    restApi: apiGatewayRestApi.id,
    resourceId: apiGatewayResource.id,
    httpMethod: apiGatewayMethod.httpMethod,
    integrationHttpMethod: "POST",
    type: "AWS_PROXY",
    uri: lambda.invokeArn,
});

const apiGatewayDeployment = new aws.apigateway.Deployment("myapideployment", {
    restApi: apiGatewayRestApi.id,
    stageName: "v1",
    triggers: {
        "repoDigest": image.repoDigest,
    }
}, {
    dependsOn: [
        apiGatewayIntegration
    ]
});

export const url = pulumi.interpolate`${apiGatewayDeployment.invokeUrl}/${apiGatewayResource.pathPart}`;
