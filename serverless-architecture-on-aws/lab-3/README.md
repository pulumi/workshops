# Wiring Lambda Functions up to other resources

Lambda Functions and API Gateways go well together, but there are lots of other services that you can wire up functions to to build complex event driven systems.

In this lab we're going to show how to use Pulumi to connect the following resources to Lambda Functions so they can process the results of certain actions

* [SQS Queue](#sqs-queue)
* [SNS Topic](#sns-topic)
* [S3 Bucket](#s3-bucket)
* [Cloudwatch Schedule](#cloudwatch-schedule)

*Note*: These functions are only available in the Typescript version of the Pulumi AWS provider.

## Let's go

We've got separate Lambda Function code for each resource (so we can view the logs and see what data we've got available), but the code required for each is very similar.

First of all, we're going to create a new folder to add our code to:

`mkdir lab-3-code && cd lab-3-code`

Next create a new Pulumi project:

`pulumi new typescript` (and go through the wizard)

Then finally install the AWS Provider:

`npm install @pulumi/aws`

To make life easier for outselves we're going to also create a folder to store all the function code in. We'll have a file for each AWS service. This is a valid way of doing things if you've made the decision to use a mono-repo pattern, but it does mean that we're uploading everything when we do a deployment.

So:

`mkdir app && cd app && npm init -y && cd ..`

### SQS Queue

Out of all the services we're going to look at, SQS is the anomaly because the Lambda Function pulls messages from the queue and automatically deletes them when they're processed. So we need to add an extra policy to our IAM role to give the function the right permissions (rather than the other way around). Specifically we're adding the `AWSLambdaSQSQueueExecutionRole` managed policy.

Replace your current role resource with this:

```typescript
const role = new aws.iam.Role("role", {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal(aws.iam.Principals.LambdaPrincipal),
    managedPolicyArns: [
        aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
        aws.iam.ManagedPolicy.AWSLambdaSQSQueueExecutionRole
    ]
});
```

Then the Lambda Function resource looks like this:

```typescript
const fn = new aws.lambda.Function("function", {
    role: role.arn,
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("./app")
    }),
    handler: "sqs.handler",
    runtime: aws.lambda.Runtime.NodeJS16dX
});
```

with the code (which we're putting in a file called `sqs.js`) looks like this:

```javascript
exports.handler =  async function(event, context) {
    const sqsEventData = event.Records[0];
    const logJSON = {
        queueArn: sqsEventData.eventSourceARN,
        messageId: sqsEventData.messageId,
        body: sqsEventData.body
    };
    console.log(JSON.stringify(logJSON));
}
```

I'm adding a CloudWatch Log group to my code. If you don't have this, the Lambda Function will automatically create one, but it won't be managed by Pulumi so won't be removed when we destroy everything at the end. So if you want to add it you can, but it's not necessary:

```typescript
const logGroup = new aws.cloudwatch.LogGroup("loggroup", {
    name: pulumi.interpolate`/aws/lambda/${fn.name}`
});
```

Then finally, we want to create the SQS queue:

```typescript
const queue = new aws.sqs.Queue("queue");
```

and export the queue URL so we can access it using the command line later on:

```typescript
export const queueURL = queue.url;
```

To wire the Lambda Function up, we're going to use the `onEvent()` function on the queue resource:

```typescript
queue.onEvent("event", fn);
```

This function allows us to create the resources necessary to use the SQS queue as a trigger for the Lambda Function.

Let's deploy this so we can see what it looks like:

`pulumi up`

To invoke the function, we're going to use the AWS CLI to put a message on the queue and then check the CloudWatch logs to see the results.

Using the AWS CLI:

```zsh
aws sqs send-message --queue-url $(pulumi stack output queueURL) --message-body "Hello World"
```

<details><summary>The complete SQS Pulumi code can be seen here</summary>

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const role = new aws.iam.Role("role", {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal(aws.iam.Principals.LambdaPrincipal),
    managedPolicyArns: [
        aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
        aws.iam.ManagedPolicy.AWSLambdaSQSQueueExecutionRole
    ]
});

const fn = new aws.lambda.Function("function", {
    role: role.arn,
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("./app")
    }),
    handler: "sqs.handler",
    runtime: aws.lambda.Runtime.NodeJS16dX
});

const logGroup = new aws.cloudwatch.LogGroup("loggroup", {
    name: pulumi.interpolate`/aws/lambda/${fn.name}`
});

const queue = new aws.sqs.Queue("queue");
queue.onEvent("event", fn);

export const queueURL = queue.url;
```

</details>

### SNS Topic

We'll leave some of the code in place and make some adjustments. Firstly we can get rid of the extra policy in the IAM role:

```typescript
const role = new aws.iam.Role("role", {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal(aws.iam.Principals.LambdaPrincipal),
    managedPolicyArns: [
        aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
    ]
});
```

Then we'll create a file called `sns.js` and paste the following in:

```typescript
exports.handler =  async function(event, context) {
    const snsData = event.Records[0].Sns
    const logJSON = {
        message: snsData.Message,
        topicArn: snsData.TopicArn,
        messageId: snsData.MessageId
    }
    console.log(JSON.stringify(logJSON));
}
```

and change the Lambda Function resource so the handler is this one:

```typescript
const fn = new aws.lambda.Function("function", {
    role: role.arn,
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("./app")
    }),
    handler: "sns.handler", // change from "sqs.handler"
    runtime: aws.lambda.Runtime.NodeJS16dX
});
```

Then we create the SNS Topic resource:

```typescript
const topic = new aws.sns.Topic("topic");
```

export the ARN of the Topic so we can publish to it later:

```typescript
export const topicArn = topic.arn;
```

and then wire up the Topic to the Lambda Function:

```typescript
topic.onEvent("event", fn);
```

As before we're going to run an update, so let's do that and see what's changed:

```zsh
pulumi up
```

Like before, we're going to invoke the function by using the AWS CLI:

```zsh
aws sns publish --topic-arn $(pulumi stack output topicArn) --message "Hello World"
```

<details><summary>The complete SNS Pulumi code can be seen here</summary>

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const role = new aws.iam.Role("role", {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal(aws.iam.Principals.LambdaPrincipal),
    managedPolicyArns: [
        aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
    ]
});

const fn = new aws.lambda.Function("function", {
    role: role.arn,
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("./app")
    }),
    handler: "sns.handler",
    runtime: aws.lambda.Runtime.NodeJS16dX
});

const logGroup = new aws.cloudwatch.LogGroup("loggroup", {
    name: pulumi.interpolate`/aws/lambda/${fn.name}`
});

const topic = new aws.sns.Topic("topic");
topic.onEvent("event", fn);

export const topicArn = topic.arn;
```

</details>

### S3 Bucket

There are a couple of events that the S3 bucket can use, `onObjectCreated()`, `onObjectRemoved()` and the more generic `onEvent()`. We're going to use `onObjectCreated()` here.

Again, most of the code can remain the same. We'll add the following as `s3.js` to our `app` folder as before:

```javascript
exports.handler =  async function(event, context) {
    const s3EventData = event.Records[0].s3;

    const logJSON = {
        bucket: s3EventData.bucket.name,
        arn: s3EventData.bucket.arn,
        filename: s3EventData.object.key
    };

    console.log(JSON.stringify(logJSON));
}
```

We'll update handler input in the Lambda Function resource:

```typescript
const fn = new aws.lambda.Function("function", {
    role: role.arn,
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("./app")
    }),
    handler: "s3.handler", // change from "sns.handler"
    runtime: aws.lambda.Runtime.NodeJS16dX
});
```

We'll add in an S3 bucket:

```typescript
const bucket = new aws.s3.Bucket("lambdaBucket");
```

We'll export the name of the bucket for use with the AWS CLI:

```typescript
export const bucketName = bucket.bucket;
```

And we'll wire up the function to the bucket so that when an object is uploaded, the function will be triggered:

```typescript
bucket.onObjectCreated("onobjectcreated", fn);
```

Once again, we'll run an update:

```zsh
pulumi up
```

And then we'll create a file to upload:

```zsh
touch file.txt
```

and then upload it using the AWS CLI:

```zsh
aws s3 cp file.txt s3://$(pulumi stack output bucketName)
```

In a break from tradition, we're going to empty the S3 bucket so we don't get errors later:

```zsh
aws s3 rm s3://$(pulumi stack output bucketName) --recursive
```

<details><summary>The complete S3 Pulumi code can be seen here</summary>

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const role = new aws.iam.Role("role", {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal(aws.iam.Principals.LambdaPrincipal),
    managedPolicyArns: [
        aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
    ]
});

const fn = new aws.lambda.Function("function", {
    role: role.arn,
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("./app")
    }),
    handler: "s3.handler",
    runtime: aws.lambda.Runtime.NodeJS16dX
});

const logGroup = new aws.cloudwatch.LogGroup("loggroup", {
    name: pulumi.interpolate`/aws/lambda/${fn.name}`
});

const bucket = new aws.s3.Bucket("lambdaBucket");
bucket.onObjectCreated("onObjectCreated", fn);

export const bucketName = bucket.bucket;
```

</details>

### CloudWatch Schedule

If you've not used this before it's very useful because you can effectively create CRON jobs that run your Lambda Functions.

Same as before, here's the Lambda Function code:

```javascript
exports.handler =  async function(event, context) {
    const cloudwatchEvent = event;
    const logJSON = {
        id: event.id,
        timestamp: event.time,
        eventArn: event.resources[0]
    };
    console.log(logJSON)
}
```

Here's the Lambda Function resource with the handler input changed:

```typescript
const fn = new aws.lambda.Function("function", {
    role: role.arn,
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("./app")
    }),
    handler: "cloudwatch.handler", // changed from "s3.handler"
    runtime: aws.lambda.Runtime.NodeJS16dX
});
```

The code for the CloudWatch Scheduler resource:

```typescript
const scheduler = new aws.cloudwatch.EventRule("scheduler", {
    scheduleExpression: "rate(1 minute)"
});
```

and to wire it up to the Lambda Function:

```typescript
scheduler.onEvent("schedulerevent", fn)
```

As we're not going to use the CLI to run the scheduler, we don't need to export any outputs.

Then an update:

```zsh
pulumi up
```

<details><summary>The complete CloudWatch Scheduler Pulumi code can be seen here</summary>

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const role = new aws.iam.Role("role", {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal(aws.iam.Principals.LambdaPrincipal),
    managedPolicyArns: [
        aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
    ]
});

const fn = new aws.lambda.Function("function", {
    role: role.arn,
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("./app")
    }),
    handler: "cloudwatch.handler",
    runtime: aws.lambda.Runtime.NodeJS16dX
});

const logGroup = new aws.cloudwatch.LogGroup("loggroup", {
    name: pulumi.interpolate`/aws/lambda/${fn.name}`
});

const scheduler = new aws.cloudwatch.EventRule("scheduler", {
    scheduleExpression: "rate(1 minute)"
});

scheduler.onEvent("schedulerevent", fn)
```

</details>

## Tidying up

I think pretty much everything here is covered by the AWS Free Tier, but if you want to keep things neat and tidy, then all that is left is to run:

```zsh
pulumi destroy
```

to delete everything.
