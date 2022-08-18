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

// Export the name of the bucket
export const bucketName = bucket.id;
