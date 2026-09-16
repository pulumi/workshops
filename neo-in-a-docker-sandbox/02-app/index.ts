import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Baseline for the workshop demo: a plain S3 bucket. During the demo, Pulumi Neo
// (running inside a Docker Sandbox) is asked to harden it: versioning, default
// server-side encryption, public-access block, tags. Compare the git diff after
// the session to see exactly what the agent changed.
//
// `protect: true` is a Pulumi engine guardrail: `pulumi destroy` refuses to
// delete the bucket until a human unprotects it. That is the second layer on
// top of the sandbox itself: the microVM, the egress allow-list and the
// credential proxy all sit outside, where the agent cannot reach them.

const config = new pulumi.Config();
const bucketPrefix = config.get("bucketPrefix") ?? "neo-workshop-";

const bucket = new aws.s3.Bucket(
    "demo",
    {
        bucketPrefix,
        tags: {
            workshop: "neo-in-a-docker-sandbox",
            "managed-by": "pulumi",
            owner: "neo",
        },
    },
    { protect: true },
);

export const bucketName = bucket.bucket;
export const bucketArn = bucket.arn;
export const region = aws.getRegionOutput().apply((r) => r.region);
