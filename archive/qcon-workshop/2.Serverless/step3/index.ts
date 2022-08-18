import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { Cluster } from "@pulumi/aws/emr";

const bucket = new aws.s3.Bucket("my-bucket");

const task = new awsx.ecs.FargateTaskDefinition("task", {
    container: {
        image: "lukehoban/ffmpeg-thumb",
        memoryReservation: 512,
    },
});
const cluster = awsx.ecs.Cluster.getDefault();

const handler = new aws.lambda.CallbackFunction<aws.s3.BucketEvent, void>("newObject", {
    callback: async (ev, ctx) => {
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
    },
    policies: [
        aws.iam.AWSLambdaBasicExecutionRole,
        aws.iam.AmazonEC2ContainerServiceFullAccess,
    ],
});

bucket.onObjectCreated("newVideo", handler, { filterSuffix: ".mp4" });

bucket.onObjectCreated("newThumbnail", async (ev, ctx) => {
    console.log("onNewThumbnail called");
    const record = ev.Records![0];
    console.log(`*** New thumbnail: file ${record.s3.object.key} was saved at ${record.eventTime}.`);
}, { filterSuffix: ".jpg" });

export const bucketName = bucket.id;
