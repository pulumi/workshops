import { SecureBucket } from "./secureBucket";

const logs = new SecureBucket("logs", {
    tags: { team: "platform", purpose: "workshop-demo" },
});

export const bucketName = logs.bucketName;
export const bucketArn = logs.bucketArn;
