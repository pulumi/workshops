import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { readdirSync } from "fs";
import { join } from "path";

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket("my-bucket", {
    versioning: {
        enabled: true,
    }
});

const folder = "./files";
const files = readdirSync(folder);
for (const file of files) {
    const fileSource = new pulumi.asset.FileAsset(join(folder, file));
    new aws.s3.BucketObject(file, {
        bucket: bucket,
        key: file,
        source: fileSource,
    });
}

// Export the name of the bucket
export const bucketName = bucket.id;
