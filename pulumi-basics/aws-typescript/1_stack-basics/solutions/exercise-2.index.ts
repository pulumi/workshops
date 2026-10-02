import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Exercise 2 //
const config = new pulumi.Config()
const baseName = config.require("baseName")
// Exercise 2 //

// Exercise 2 //
// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.BucketV2(`${baseName}-bucket`);
// Exercise 2 //

// Exercise 1 //
// Export the name of the bucket
export const bucketName = bucket.id;
// Exercise 1 //
