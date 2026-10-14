import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Base stack for the workshop demo: a small VPC and an S3 bucket for build
// artifacts. This is the infrastructure an AI agent will later be asked to
// change (04-propose-change) over a scoped, read-plus-propose MCP connection
// (03-scoped-access). Nothing in this file is agent-authored; it is the
// human-authored baseline the agent's diff gets compared against.

const config = new pulumi.Config();
const namePrefix = config.get("namePrefix") ?? "agent-keys-safely-";

const tags = {
    workshop: "give-your-ai-agent-the-keys-safely",
    "managed-by": "pulumi",
};

const vpc = new aws.ec2.Vpc("main", {
    cidrBlock: "10.42.0.0/16",
    enableDnsHostnames: true,
    enableDnsSupport: true,
    tags,
});

const subnet = new aws.ec2.Subnet("main", {
    vpcId: vpc.id,
    cidrBlock: "10.42.1.0/24",
    mapPublicIpOnLaunch: true,
    tags,
});

const artifacts = new aws.s3.Bucket("artifacts", {
    bucketPrefix: namePrefix,
    tags: {
        ...tags,
        purpose: "build-artifacts",
    },
});

export const vpcId = vpc.id;
export const subnetId = subnet.id;
export const artifactsBucketName = artifacts.bucket;
export const artifactsBucketArn = artifacts.arn;
export const region = aws.getRegionOutput().apply((r) => r.region);
