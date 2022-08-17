import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as path from "path";
import { siteDir } from "./config";
import * as mime from "mime";
import * as nodedir from "node-dir";

const myBucket = new aws.s3.Bucket("my-bucket", {
    website: {
        indexDocument: "index.html",
    },
});

const files = nodedir.files(siteDir, { sync: true });
for (const file of files) {
    const name = file.substring(siteDir.length+1);
    const myObject = new aws.s3.BucketObject(name, {
        acl: "public-read",
        bucket: myBucket,
        contentType: mime.getType(file) || undefined,
        source: file,
    });
}

export const bucketName = myBucket.bucket;
export const bucketEndpoint = pulumi.interpolate`http://${myBucket.websiteEndpoint}`;
