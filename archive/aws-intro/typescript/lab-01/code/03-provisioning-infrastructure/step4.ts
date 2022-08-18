import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const myBucket = new aws.s3.Bucket("my-bucket");

export const bucketName = myBucket.bucket;
