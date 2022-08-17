# Using AWS Lambda for Serverless Application Patterns

In this lab, you will create a serverless web application that uses API Gateway and Lambda, along with a dynamic DynamoDB-based hit counter.

> This lab assumes you have a project set up and configured to use AWS. If you don't yet, please complete parts [1](../lab-01/01-creating-a-new-project.md) 
>and [2](../lab-01/02-configuring-aws.md) of lab-01.

## Step 1 &mdash; Install Dependencies

To start, install the AWS SDK package. This will allow you to query your DynamoDB table from your Lambda:

```bash
npm install aws-sdk
```

Now import the necessary packages in the top of an empty `index.ts` file:

```typescript
import * as AWS from "aws-sdk";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";
```

> :white_check_mark: After this change, your `index.ts` should [look like this](./code/step1.ts).

## Step 2 &mdash; Create a DynamoDB Table

Now define your DynamoDB table. This provisions a serverless NoSQL database table where you only pay for what you use:

```typescript
...
const hits = new aws.dynamodb.Table("hits", {
    attributes: [{ name: "Site", type: "S" }],
    hashKey: "Site",
    billingMode: "PAY_PER_REQUEST",
});
```

The schema for this table is quite simple because this instance will only store a single global counter for the entire website.

> :white_check_mark: After this change, your `index.ts` should [look like this](./code/step2.ts).

## Step 3 &mdash; Create IAM Policies

Before creating your website, the Lambda will need a certain IAM role and permission. This permits the Lambda's function
to assume the right identity at runtime, log into CloudWatch to aid with debugging, and to use the DynamoDB table defined above:

```typescript
...
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

> :white_check_mark: After this change, your `index.ts` should [look like this](./code/step3.ts).

## Step 4 &mdash; Create a Lambda-Based API Gateway

Now create an API Gateway powered by Lambda for its sole REST API handler for `GET` requests at the `/` route.

The first step is to create the code for the Lambda itself &mdash; this is the code that will run in response to an API
call at runtime. Place this code into a new `handler/index.js` file:

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
...
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

> :white_check_mark: After these changes, your `index.ts` should [look like this](./code/step4.ts).

Notice this definition references the code stored in `handler/index.js` file through the use of an "asset" &mdash; a mechanism
for packaging up files and directories for use by your infrastructure. At the end, your API's base URL will be printed out.

## Step 5 &mdash; Deploy Everything

To provision everything, run:

```bash
pulumi up
```

After confirming, you will see output like the following:

```
Updating (dev):

     Type                             Name              Status
 +   pulumi:pulumi:Stack              iac-workshop-dev  created
 +   ├─ aws:apigateway:x:API          site              created
 +   │  ├─ aws:apigateway:RestApi     site              created
 +   │  ├─ aws:apigateway:Deployment  site              created
 +   │  ├─ aws:lambda:Permission      site-fa520765     created
 +   │  └─ aws:apigateway:Stage       site              created
 +   ├─ aws:dynamodb:Table            hits              created
 +   ├─ aws:iam:Role                  handler-role      created
 +   ├─ aws:iam:RolePolicy            handler-policy    created
 +   └─ aws:lambda:Function           get-handler       created

Outputs:
    url: "https://nnr5b2m5h5.execute-api.eu-central-1.amazonaws.com/stage/"

Resources:
    + 10 created

Duration: 25s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop/dev/updates/1
```

After provisioning, you can access your new site at the resulting URL. For fun, curl it a few times:

```bash
for i in {1..5}; do curl $(pulumi stack output url); done
```

Notice that the counter increases:

```
<h1>Welcome to ACMECorp!</h1>
<p>1 hits.</p>
<h1>Welcome to ACMECorp!</h1>
<p>2 hits.</p>
<h1>Welcome to ACMECorp!</h1>
<p>3 hits.</p>
<h1>Welcome to ACMECorp!</h1>
<p>4 hits.</p>
<h1>Welcome to ACMECorp!</h1>
<p>5 hits.</p>
```

## Step 6 &mdash; Replace the App with Inline Code

It's possible to simplify this serverless application by moving the runtime code into the infrastructure definition. This
isn't always the right way to design your infrastructure as code, but for "fully serverless" applications like this one,
where the boundary between application and infrastructure is intentionally blurred, this can be a great way to go.

First, delete the IAM `handlerRole` and `handlerPolicy` definitions altogether.

Next, replace your API Gateway `site` with the following code:

```typescript
...
const site = new awsx.apigateway.API("site", {
    routes: [{
        path: "/",
        method: "GET",
        eventHandler: async () => {
            const dc = new AWS.DynamoDB.DocumentClient();
            const result = await dc.update({
                TableName: hits.name.get(),
                Key: { "Site": "ACMECorp" },
                UpdateExpression: "SET Hits = if_not_exists(Hits, :zero) + :incr",
                ExpressionAttributeValues: { ":zero": 0, ":incr": 1 },
                ReturnValues: "UPDATED_NEW",
            }).promise();
            return {
                statusCode: 200,
                headers: { "Content-Type": "text/html" },
                body: "<h1>Welcome to ACMECorp!</h1>\n"+
                    `<p>${result.Attributes!.Hits} hits.</p>\n`,
            };
        },
    }],
});
...
```

Remember to keep the line at the end to export the `url`. It is safe to also delete the `handler/index.js` file altogether now.

> :white_check_mark: After this change, your `index.ts` should [look like this](./code/step6.ts).

Next, run an update:

```bash
pulumi up
```

The output will look something like this:

```
Updating (dev):

     Type                                Name                   Status       Info
     pulumi:pulumi:Stack                 iac-workshop-dev
     ├─ aws:apigateway:x:API             site
 +   │  ├─ aws:iam:Role                  site4c238266           created
 +   │  ├─ aws:iam:RolePolicyAttachment  site4c238266-32be53a2  created
 +   │  ├─ aws:lambda:Function           site4c238266           created
 ~   │  ├─ aws:apigateway:RestApi        site                   updated      [diff: ~body]
 +-  │  ├─ aws:apigateway:Deployment     site                   replaced     [diff: ~variables]
 +-  │  ├─ aws:lambda:Permission         site-fa520765          replaced     [diff: ~function]
 ~   │  └─ aws:apigateway:Stage          site                   updated      [diff: ~deployment]
 -   ├─ aws:lambda:Function              get-handler            deleted
 -   ├─ aws:iam:RolePolicy               handler-policy         deleted
 -   └─ aws:iam:Role                     handler-role           deleted

Outputs:
    url: "https://nnr5b2m5h5.execute-api.eu-central-1.amazonaws.com/stage/"

Resources:
    + 3 created
    ~ 2 updated
    - 3 deleted
    +-2 replaced
    10 changes. 3 unchanged

Duration: 25s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop/dev/updates/2
```

Now, curl the endpoint a few more times:

```bash
for i in {1..5}; do curl $(pulumi stack output url); done
```

Notice that the counter increases:

```
<h1>Welcome to ACMECorp!</h1>
<p>6 hits.</p>
<h1>Welcome to ACMECorp!</h1>
<p>7 hits.</p>
<h1>Welcome to ACMECorp!</h1>
<p>8 hits.</p>
<h1>Welcome to ACMECorp!</h1>
<p>9 hits.</p>
<h1>Welcome to ACMECorp!</h1>
<p>10 hits.</p>
```

Because we reused the same table from the prior update, the counter has continued where the prior commands left off.

> :white_check_mark: After completing this step, your `index.ts` file should [look like this](./code/step6.ts).

## Step 7 &mdash; Destroy Everything

Finally, destroy the resources and the stack itself:

```
pulumi destroy
pulumi stack rm
```

## Next Steps

Congratulations! :tada: You have successfully created a modern serverless application that uses API Gateway and Lambda
for compute &mdash; resulting in dynamic pay-per-use infrastructure &mdash; with DynamoDB NoSQL storage on the backend to track of hit counts.

Next, choose amongst these labs:

* [Deploying Containers to Elastic Container Service (ECS) "Fargate"](../lab-03/README.md)
* [Deploying Containers to a Kubernetes Cluster](../lab-04/README.md)
* [Using AWS Lambda for Serverless Application Patterns](../lab-05/README.md)

Or view the [suggested next steps](../../../../README.md#next-steps) after completing all labs.
