+++
title = "Creating IAM Policies"
chapter = false
weight = 20
+++

Before creating your website, the Lambda will need a certain IAM role and permission. This permits the Lambda's function
to assume the right identity at runtime, log into CloudWatch to aid with debugging, and to use the DynamoDB table defined in the previous step:
 

```typescript
const handlerRole = new aws.iam.Role("handler-role", {
    assumeRolePolicy: {
        Version: "2012-10-17",
        Statement: [{
            Action: "sts:AssumeRole",
            Principal: {
                Service: "lambda.amazonaws.com"
            },
            Effect: "Allow",
            Sid: "",
        }],
    },
});

const handlerPolicy = new aws.iam.RolePolicy("handler-policy", {
    role: handlerRole,
    policy: hits.arn.apply(arn => JSON.stringify({
        Version: "2012-10-17",
        Statement: [
            {
                Action: [
                    "dynamodb:UpdateItem",
                    "dynamodb:PutItem",
                    "dynamodb:GetItem",
                    "dynamodb:DescribeTable",
                ],
                Resource: arn,
                Effect: "Allow",
            },
            {
                Action: ["logs:*", "cloudwatch:*"],
                Resource: "*",
                Effect: "Allow",
            },
        ],
    })),
});
```

{{% notice info %}}
The `index.ts` file should now have the following contents:
{{% /notice %}}
```typescript
import * as AWS from "aws-sdk";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";

const hits = new aws.dynamodb.Table("hits", {
    attributes: [{ name: "Site", type: "S" }],
    hashKey: "Site",
    billingMode: "PAY_PER_REQUEST",
});

const handlerRole = new aws.iam.Role("handler-role", {
    assumeRolePolicy: {
        Version: "2012-10-17",
        Statement: [{
            Action: "sts:AssumeRole",
            Principal: {
                Service: "lambda.amazonaws.com"
            },
            Effect: "Allow",
            Sid: "",
        }],
    },
});

const handlerPolicy = new aws.iam.RolePolicy("handler-policy", {
    role: handlerRole,
    policy: hits.arn.apply(arn => JSON.stringify({
        Version: "2012-10-17",
        Statement: [
            {
                Action: [
                    "dynamodb:UpdateItem",
                    "dynamodb:PutItem",
                    "dynamodb:GetItem",
                    "dynamodb:DescribeTable",
                ],
                Resource: arn,
                Effect: "Allow",
            },
            {
                Action: ["logs:*", "cloudwatch:*"],
                Resource: "*",
                Effect: "Allow",
            },
        ],
    })),
});
```
