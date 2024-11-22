
// Copyright 2024, Pulumi Corporation. All rights reserved.

import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

// Assemble resource name from context pieces
const config = new pulumi.Config();
const namespace: string = config.require("namespace")
const environment: string = config.require("environment")
const name: string = config.require("name")

const baseName: string = [
  namespace,
  environment,
  name,
].join("-")



// // 🚨🚨🚨 UNCOMMENT FOR PULUMI ESC 🚨🚨🚨
// // ‼️‼️‼️ ONLY EXPORTING FOR DEMO PURPOSES
// export const slackWebhookUrl = config.requireSecret("slackWebhookURL");

// 🚨🚨🚨 COMMENT OUT FOR PULUMI ESC -- start here 🚨🚨🚨
const secretName = "slack-webhook-url-plaintext";
// Fetch the secret value from AWS Secrets Manager
const secret = aws.secretsmanager.getSecret({
    name: secretName,
});

// Get the secret value
// ‼️‼️‼️‼️ ONLY EXPORTING FOR DEMO PURPOSES
export const slackWebhookUrl = secret.then(s => aws.secretsmanager.getSecretVersion({
    secretId: s.id,
}).then(version => version.secretString));
// 🚨🚨🚨 COMMENT FOR PULUMI ESC -- end here 🚨🚨🚨



// Create an IAM role for the Lambda function
const roleName: string = [
  baseName,
  'role'
].join('-')

const lambdaRole = new aws.iam.Role("lambdaRole", {
  name: roleName,
  description: `Execution permissions for ${baseName}`,
  assumeRolePolicy: {
    Version: "2012-10-17",
    Statement: [{
      Action: "sts:AssumeRole",
      Principal: {
        Service: "lambda.amazonaws.com",
      },
      Effect: "Allow",
    }],
  },
  tags: {
    Namespace: namespace,
    Environment: environment,
    name: roleName
  }
});

// Attach a policy to the role to allow Lambda to log to CloudWatch
const rpa = new aws.iam.RolePolicyAttachment("lambdaRolePolicy", {
  role: lambdaRole.name,
  policyArn: aws.iam.ManagedPolicies.AWSLambdaBasicExecutionRole,
});



// Create the Lambda function
const lambdaFunction = new aws.lambda.Function("lambda", {
  // https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html#runtimes-supported
  name: baseName,
  runtime: "nodejs20.x",
  role: lambdaRole.arn,
  handler: "index.handler",
  code: new pulumi.asset.AssetArchive({
    ".": new pulumi.asset.FileArchive("./lambda"),
  }),
  environment: {
    variables: {
      "SLACK_WEBHOOK_URL": slackWebhookUrl,
    },
  },
  memorySize: 128,
  timeout: 30,
  tags: {
    Namespace: namespace,
    Environment: environment,
    name: baseName
  }
});

// Export the Lambda function name
export const lambdaFunctionName = lambdaFunction.name;

// Create an API Gateway
const apigwName: string = [
  baseName,
  'gw'
].join('-')

const api = new aws.apigateway.RestApi("apiGateway", {
  name: apigwName,
  description: `API Gateway for Lambda function ${baseName}`,
  tags: {
    Namespace: namespace,
    Environment: environment,
    name: apigwName
  }
});


// Create a root resource
const rootResource = api.rootResourceId;

// Create a method for the root resource
const rootMethod = new aws.apigateway.Method("rootMethod", {
  restApi: api.id,
  resourceId: rootResource,
  httpMethod: "ANY",
  authorization: "NONE",
});

// Integrate the Lambda function with the root method
const rootIntegration = new aws.apigateway.Integration("rootIntegration", {
  restApi: api.id,
  resourceId: rootResource,
  httpMethod: rootMethod.httpMethod,
  integrationHttpMethod: "POST",
  type: "AWS_PROXY",
  uri: lambdaFunction.invokeArn,
});

// Grant API Gateway permission to invoke the Lambda function
const lambdaPermission = new aws.lambda.Permission("apiGatewayPermission", {
  action: "lambda:InvokeFunction",
  function: lambdaFunction.arn,
  principal: "apigateway.amazonaws.com",
  sourceArn: pulumi.interpolate`${api.executionArn}/*/*`,
});

// Deploy the API
const deployment = new aws.apigateway.Deployment("deployment", {
  restApi: api.id,
  stageName: "sbx",
}, { dependsOn: [rootIntegration] });

// Export the URL of the API
export const url = pulumi.interpolate`${deployment.invokeUrl}`;
