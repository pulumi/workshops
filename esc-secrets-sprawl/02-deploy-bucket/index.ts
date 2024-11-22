import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// Assemble resource name from context pieces
const ctx = new pulumi.Config();
const namespace: string = ctx.require("namespace")
const environment: string = ctx.require("environment")
const name: string = ctx.require("name")

const resourceName: string = [
  namespace,
  environment,
  name,
].join("-")

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket( "bucket", {
  bucket: resourceName,
  tags: {
    Namespace: namespace,
    Environment: environment,
    Name: resourceName
  }
});

const ownership = new aws.s3.BucketOwnershipControls("ownership", {
  bucket: bucket.id,
  rule: {
    objectOwnership: "BucketOwnerEnforced",
  },
});

const versioning = new aws.s3.BucketVersioningV2("versioning", {
  bucket: bucket.id,
  versioningConfiguration: {
      status: "Enabled",
  },
});

// Export the name of the bucket
export const bucketName = bucket.id;
