+++
title = "Creating an API Gateway"
chapter = false
weight = 30
+++

Now create an API Gateway powered by Lambda for its sole REST API handler for `GET` requests at the `/` route.

The first step is to create the code for the Lambda itself — this is the code that will run in response to an API call at runtime. Place this code into a new `handler/index.js` file.

Create a new `handler` directory and create a new file `index.js`
Paste the below code in the the javascript file:

```javascript
const AWS = require("aws-sdk");

exports.handler = async function(event, context, callback) {
    console.log("Received event: ", event);
    const dc = new AWS.DynamoDB.DocumentClient();
    const result = await dc.update({
        TableName: process.env["HITS_TABLE"],
        Key: { "Site": "ACMECorp" },
        UpdateExpression: "SET Hits = if_not_exists(Hits, :zero) + :incr",
        ExpressionAttributeValues: { ":zero": 0, ":incr": 1 },
        ReturnValues: "UPDATED_NEW",
    }).promise();
    return {
        statusCode: 200,
        headers: { "Content-Type": "text/html" },
        body: "<h1>Welcome to ACMECorp!</h1>\n"+
            `<p>${result.Attributes.Hits} hits.</p>\n`,
    };
};
```

Next, create the API Gateway and Lambda-based handler to `index.ts`:

```typescript
const site = new awsx.apigateway.API("site", {
    routes: [{
        path: "/",
        method: "GET",
        eventHandler: new aws.lambda.Function("get-handler", {
            runtime: aws.lambda.NodeJS10dXRuntime,
            code: new pulumi.asset.AssetArchive({
                ".": new pulumi.asset.FileArchive("handler"),
            }),
            handler: "index.handler",
            role: handlerRole.arn,
            environment: {
                variables: {
                    "HITS_TABLE": hits.name,
                },
            },
        }, { dependsOn: handlerPolicy }),
    }],
});
export const url = site.url;
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

const site = new awsx.apigateway.API("site", {
    routes: [{
        path: "/",
        method: "GET",
        eventHandler: new aws.lambda.Function("get-handler", {
            runtime: aws.lambda.NodeJS10dXRuntime,
            code: new pulumi.asset.AssetArchive({
                ".": new pulumi.asset.FileArchive("handler"),
            }),
            handler: "index.handler",
            role: handlerRole.arn,
            environment: {
                variables: {
                    "HITS_TABLE": hits.name,
                },
            },
        }, { dependsOn: handlerPolicy }),
    }],
});
export const url = site.url;
```

Notice this definition references the code stored in `handler/index.js` file through the use of an "asset" — a mechanism
for packaging up files and directories for use by your infrastructure. At the end, your API's base URL will be printed out.
