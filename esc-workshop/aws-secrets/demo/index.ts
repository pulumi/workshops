import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as path from "path";

const config = new pulumi.Config();
const githubToken = config.requireSecret("githubToken");

const role = new aws.iam.Role("lambda-role", {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({ Service: "lambda.amazonaws.com" }),
});

new aws.iam.RolePolicyAttachment("lambda-role-policy", {
  role: role,
  policyArn: aws.iam.ManagedPolicies.AWSLambdaBasicExecutionRole,
});


const lambdaCodePath = path.join(__dirname, "lambda");
const lambdaFunction = new aws.lambda.Function("get-github-user", {
  runtime: aws.lambda.Runtime.NodeJS20dX,
  code: new pulumi.asset.AssetArchive({
    ".": new pulumi.asset.FileArchive(lambdaCodePath),
  }),
  handler: "index.handler",
  role: role.arn,
  environment: {
    variables: {
      GITHUB_API_KEY: githubToken,
    },
  },
});

const functionUrl = new aws.lambda.FunctionUrl("function-url", {
  functionName: lambdaFunction.name,
  authorizationType: "NONE",
});

export const functionUrlEndpoint = functionUrl.functionUrl;
