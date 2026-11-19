import * as aws from "@pulumi/aws";
import { SecureBucket } from "./secureBucket";

const logs = new SecureBucket("logs", {
    tags: { team: "platform", purpose: "workshop-demo" },
});

// Someone adds a bucket by hand and skips the component.
const legacy = new aws.s3.Bucket("legacy", { forceDestroy: true });

export const bucketName = logs.bucketName;
export const legacyBucketName = legacy.id;
