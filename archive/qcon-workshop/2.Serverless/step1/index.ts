import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const bucket = new aws.s3.Bucket("my-bucket");

bucket.onObjectCreated("newObject", async (ev, ctx) => {
    console.log(JSON.stringify(ev));
});

export const bucketName = bucket.id;
