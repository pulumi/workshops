import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Baseline infrastructure for "Give your AI agent the keys, safely": a
// small VPC with one subnet, and an S3 bucket for artifact storage. This is
// the stack an agent proposes changes against in later steps; nothing here
// is agent-authored.

const tags = {
    workshop: "iac-ai-agents-keys-safely",
    "managed-by": "pulumi",
};

const vpc = new aws.ec2.Vpc("workshop-vpc", {
    cidrBlock: "10.20.0.0/16",
    enableDnsSupport: true,
    enableDnsHostnames: true,
    tags: { ...tags, Name: "iac-ai-agents-keys-safely-vpc" },
});

const subnet = new aws.ec2.Subnet("workshop-subnet", {
    vpcId: vpc.id,
    cidrBlock: "10.20.1.0/24",
    availabilityZone: "us-east-1a",
    mapPublicIpOnLaunch: false,
    tags: { ...tags, Name: "iac-ai-agents-keys-safely-subnet" },
});

// The artifact bucket is the resource the agent will be asked to change in
// 04-propose-change (adding an access-logs bucket alongside it). It is
// protected so a demo run cannot delete it by accident; 08-teardown handles
// unprotecting and emptying it before destroy.
const artifactBucket = new aws.s3.Bucket(
    "workshop-artifacts",
    {
        tags: { ...tags, Name: "iac-ai-agents-keys-safely-artifacts" },
    },
    { protect: true },
);

const artifactBucketVersioning = new aws.s3.BucketVersioning("workshop-artifacts-versioning", {
    bucket: artifactBucket.id,
    versioningConfiguration: {
        status: "Enabled",
    },
});

const artifactBucketPublicAccessBlock = new aws.s3.BucketPublicAccessBlock("workshop-artifacts-pab", {
    bucket: artifactBucket.id,
    blockPublicAcls: true,
    blockPublicPolicy: true,
    ignorePublicAcls: true,
    restrictPublicBuckets: true,
});

export const vpcId = vpc.id;
export const subnetId = subnet.id;
export const artifactBucketName = artifactBucket.bucket;
