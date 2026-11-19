import * as aws from "@pulumi/aws";

// Step 1: an empty project. It only reads the region from stack config, so
// `pulumi preview` needs no AWS credentials yet.
export const region = aws.config.region;
