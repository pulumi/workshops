import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Exercise 2 //
const config = new pulumi.Config()
const baseName = config.require("baseName")
// Exercise 2 //

// Exercise 2 //
// Create an AWS resource (S3 Bucket)
const myBucketName = `${baseName}-bucket`;
const bucket = new aws.s3.BucketV2(myBucketName, {
  // Exercise 3 //
  bucket: myBucketName,
  // Exercise 3 //
});
// Exercise 2 //

// Exercise 1 //
// Export the name of the bucket
export const bucketName = bucket.id;
// Exercise 1 //
