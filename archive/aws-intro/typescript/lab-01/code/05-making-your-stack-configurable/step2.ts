import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as path from "path";
import { siteDir } from "./config";

const myBucket = new aws.s3.Bucket("my-bucket", {
    website: {
        indexDocument: "index.html",
    },
});

const myObject = new aws.s3.BucketObject("index.html", {
    acl: "public-read",
    bucket: myBucket,
    contentType: "text/html",
    source: path.join(siteDir, "index.html"),
});

export const bucketName = myBucket.bucket;
export const bucketEndpoint = pulumi.interpolate`http://${myBucket.websiteEndpoint}`;
