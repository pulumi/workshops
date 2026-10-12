import * as aws from "@pulumi/aws";

// A bucket the way it is often written by hand: no baseline.
const legacy = new aws.s3.Bucket("legacy", { forceDestroy: true });

export const legacyBucketName = legacy.id;
