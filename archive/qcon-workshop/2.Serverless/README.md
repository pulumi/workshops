# 1. Intro

## Setup

1. Ensure you have completed the [Workshop setup directions](../README.md)
1. Complete the [previous section](../1.Intro) or grab the code from the [`step1`](../1.Intro/step1) folder as a starting point. 

## Steps

### Step 1

1. Start with the same code as the previous section in `step1` (or remove some code from what you added in `step3`):

    ```typescript
    import * as pulumi from "@pulumi/pulumi";
    import * as aws from "@pulumi/aws";

    const bucket = new aws.s3.Bucket("my-bucket");

    // Add new code here

    export const bucketName = bucket.id;
    ```

1. Add an event handler:

    ```typescript
    bucket.onObjectCreated("newObject", async (ev, ctx) => {
        console.log(JSON.stringify(ev);
    });
    ```

1. Update the deployment:

    ```
    $ pulumi up
    ```

1. Put a file in the S3 bucket:

    ```
    $ aws s3 cp ./package.json s3://$(pulumi stack output bucketName)
    ```

1. View the logs and wait for the logged message to appear:

    ```
    $ pulumi logs --follow
    ```

1. The end result of the steps so far is available in the [step1](./step1) folder.

### Step 2

1. Add the `@pulumi/awsx` package:

    ```
    $ npm install --save @pulumi/awsx
    ```
    
1. Add a Fargate TaskDefinition

    ```typescript
    const task = new awsx.ecs.FargateTaskDefinition("task", {
        container: {
            image: "hello-world",
            memoryReservation: 512,
        },
    });
    const cluster = awsx.ecs.Cluster.getDefault();
    ```

1. Update the deployment:

    ```
    $ pulumi up
    ```

1. Replace the `bucket.onObjectCreated` section with the following:

    ```typescript
    bucket.onObjectCreated("newObject", async (ev, ctx) => {
        console.log("starting...")
        const res = await task.run({
            cluster: cluster,
        });
        console.log("done!");
        console.log(JSON.stringify(res));
    });
    ```

1. Update the deployment:

    ```
    $ pulumi up
    ```

1. Put a file in the S3 bucket:

    ```
    $ aws s3 cp ./package.json s3://$(pulumi stack output bucketName)
    ```

1. View the logs and wait for the logged message to appear:

    ```
    $ pulumi logs --follow
    ```

1. You will see an error like the following in the logs:

    ```
    User: arn:aws:sts::153052954103:assumed-role/newObject-6696aa9/newObject-32c56b6 is not authorized to perform: ecs:RunTask on resource: arn:aws:ecs:eu-west-1:153052954103:task-definition/task-9a5ad092:1
    ```

1. Replace the `bucket.onObjectCreated` with the following:

    ```typescript
    const handler = new aws.lambda.CallbackFunction<aws.s3.BucketEvent, void>("newObject", {
        callback: async (ev, ctx) => {
            console.log("starting...")
            const res = await task.run({
                cluster: cluster,
            });
            console.log("done!");
            console.log(JSON.stringify(res));
        },
        policies: [
            aws.iam.AWSLambdaBasicExecutionRole,
            aws.iam.AmazonEC2ContainerServiceFullAccess,
        ],
    });

    bucket.onObjectCreated("newObject", handler);
    ```

1. Update the deployment:

    ```
    $ pulumi up
    ```

1. Put a file in the S3 bucket:

    ```
    $ aws s3 cp ./package.json s3://$(pulumi stack output bucketName)
    ```

1. View the logs and wait for the logged message to appear:

    ```
    $ pulumi logs --follow
    ```

1. This time, you will see output that includes this message from the `hello-world` container:

    ```
    Hello from Docker!
    ```

1. The end result of the steps so far is available in the [step2](./step2) folder.

### Step 3

1. Update the fargate task to use `lukehoban/ffmpeg-thumb`:

    ```typescript
    const task = new awsx.ecs.FargateTaskDefinition("task", {
        container: {
            image: "lukehoban/ffmpeg-thumb",
            memoryReservation: 512,
        },
    });
    ```

1. Replace the body of the handler with:

    ```typescript
    console.log("onNewThumbnail called");
    const record = ev.Records![0];
    console.log(`*** New video: file ${record.s3.object.key} was uploaded at ${record.eventTime}.`);
    const file = record.s3.object.key;

    const thumbnailFile = file.substring(0, file.indexOf('_')) + '.jpg';
    const framePos = file.substring(file.indexOf('_') + 1, file.indexOf('.')).replace('-', ':');

    await task.run({
        cluster,
        overrides: {
            containerOverrides: [{
                name: "container",
                environment: [
                    { name: "S3_BUCKET", value: bucketName.get() },
                    { name: "INPUT_VIDEO", value: file },
                    { name: "TIME_OFFSET", value: framePos },
                    { name: "OUTPUT_FILE", value: thumbnailFile },
                ],
            }],
        },
    });
    console.log(`Running thumbnailer task.`);
    ```

1. Add a filter to the `onObjectCreated` event:

    ```typescript
    bucket.onObjectCreated("newVideo", handler, { filterSuffix: ".mp4" });
    ```

1. Update the deployment:

    ```
    $ pulumi up
    ```

1. Put an `.mp4` file in the S3 bucket:

    ```
    $ aws s3 cp ./sample/cat.mp4 s3://$(pulumi stack output bucketName)
    ```

1. View the logs and wait for the logged message to appear:

    ```
    $ pulumi logs --follow
    ```

1. Add one final handler to indicate when done:

    ```typescript
    bucket.onObjectCreated("onNewThumbnail", async (ev, ctx) => {
        console.log("onNewThumbnail called");
        const record = ev.Records![0];
        console.log(`*** New thumbnail: file ${record.s3.object.key} was saved at ${record.eventTime}.`);
    }, { filterSuffix: ".jpg" });
    ```

1. Update the deployment:

    ```
    $ pulumi up
    ```

1. Put an `.mp4` file in the S3 bucket:

    ```
    $ aws s3 cp ./sample/cat.mp4 s3://$(pulumi stack output bucketName)/cat_00-01.mp4
    ```

1. View the logs and wait for the logged message to appear:

    ```
    $ pulumi logs --follow --since 30s
    ```

1. You will see output from three sources:

    ```
    newVideo
    task-b2ac63d
    newThumbnail
    ```

1. The end result of the steps so far is available in the [step3](./step3) folder.