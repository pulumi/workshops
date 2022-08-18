import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { Cluster } from "@pulumi/aws/emr";

const bucket = new aws.s3.Bucket("my-bucket");

const task = new awsx.ecs.FargateTaskDefinition("task", {
    container: {
        image: "hello-world",
        memoryReservation: 512,
    },
});
const cluster = awsx.ecs.Cluster.getDefault();

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

export const bucketName = bucket.id;
