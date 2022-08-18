+++
title = "Replacing with Inline Code"
chapter = false
weight = 50
+++

It's possible to simplify this serverless application by moving the runtime code into the infrastructure definition. This isn't always the right way to design your infrastructure as code, but for "fully serverless" applications like this one, where the boundary between application and infrastructure is intentionally blurred, this can be a great way to go.

First, delete the IAM `handlerRole` and `handlerPolicy` definitions altogether.

Next, replace your API Gateway `site` with the following code:

```typescript
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
```

Remember to keep the line at the end to export the url. It is safe to also delete the `handler/index.js` file altogether now.

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
export const url = site.url;
```

Next, run an update:

```bash
pulumi up
```

The output will look something like this:

```bash
Updating (dev):
     Type                                Name                   Status       Info
     pulumi:pulumi:Stack                 serverless-demo-dev
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
    url: "https://02fpixl9jf.execute-api.us-west-2.amazonaws.com/stage/"

Resources:
    + 3 created
    ~ 2 updated
    - 3 deleted
    +-2 replaced
    10 changes. 3 unchanged

Duration: 50s
```

Now, curl the endpoint a few more times:

```bash
for i in {1..5}; do curl $(pulumi stack output url); done
```

Notice that the counter increases:

```bash
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
