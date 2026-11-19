import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export interface SecureBucketArgs {
    /** Bucket name. Leave it out to let Pulumi add a random suffix to the resource name. */
    name?: pulumi.Input<string>;
    /** Customer-managed KMS key. Leave it out for SSE-S3 (AES256). */
    kmsKeyArn?: pulumi.Input<string>;
    tags?: pulumi.Input<Record<string, pulumi.Input<string>>>;
}

/**
 * One S3 bucket plus the six companion resources of the security baseline:
 * public access block, owner-enforced ownership, default encryption,
 * versioning, lifecycle rules and a TLS-only bucket policy.
 */
export class SecureBucket extends pulumi.ComponentResource {
    public readonly bucketName: pulumi.Output<string>;
    public readonly bucketArn: pulumi.Output<string>;

    constructor(name: string, args: SecureBucketArgs = {}, opts?: pulumi.ComponentResourceOptions) {
        super("s3-baseline:index:SecureBucket", name, {}, opts);

        const bucket = new aws.s3.Bucket(`${name}-bucket`, {
            bucket: args.name,
            forceDestroy: true,
            tags: args.tags,
        }, { parent: this });

        // 1. Block every form of public access. Everything else waits for this.
        const publicAccessBlock = new aws.s3.BucketPublicAccessBlock(`${name}-public-access-block`, {
            bucket: bucket.id,
            blockPublicAcls: true,
            blockPublicPolicy: true,
            ignorePublicAcls: true,
            restrictPublicBuckets: true,
        }, { parent: this });

        // 2. ACLs off: the bucket owner owns every object.
        new aws.s3.BucketOwnershipControls(`${name}-ownership`, {
            bucket: bucket.id,
            rule: { objectOwnership: "BucketOwnerEnforced" },
        }, { parent: this, dependsOn: [publicAccessBlock] });

        // 3. Default encryption: SSE-S3, or SSE-KMS when a key is passed in.
        new aws.s3.BucketServerSideEncryptionConfiguration(`${name}-encryption`, {
            bucket: bucket.id,
            rules: [{
                applyServerSideEncryptionByDefault: args.kmsKeyArn
                    ? { sseAlgorithm: "aws:kms", kmsMasterKeyId: args.kmsKeyArn }
                    : { sseAlgorithm: "AES256" },
                bucketKeyEnabled: true,
            }],
        }, { parent: this, dependsOn: [publicAccessBlock] });

        // 4. Versioning.
        const versioning = new aws.s3.BucketVersioning(`${name}-versioning`, {
            bucket: bucket.id,
            versioningConfiguration: { status: "Enabled" },
        }, { parent: this, dependsOn: [publicAccessBlock] });

        // 5. Lifecycle: clean up failed uploads and old versions. Needs versioning first.
        new aws.s3.BucketLifecycleConfiguration(`${name}-lifecycle`, {
            bucket: bucket.id,
            rules: [{
                id: "baseline-cleanup",
                status: "Enabled",
                filter: {},
                abortIncompleteMultipartUpload: { daysAfterInitiation: 7 },
                noncurrentVersionExpiration: { noncurrentDays: 30 },
            }],
        }, { parent: this, dependsOn: [versioning] });

        // 6. Deny every request that does not use TLS.
        const tlsOnly = aws.iam.getPolicyDocumentOutput({
            statements: [{
                sid: "DenyInsecureTransport",
                effect: "Deny",
                principals: [{ type: "*", identifiers: ["*"] }],
                actions: ["s3:*"],
                resources: [bucket.arn, pulumi.interpolate`${bucket.arn}/*`],
                conditions: [{ test: "Bool", variable: "aws:SecureTransport", values: ["false"] }],
            }],
        });
        new aws.s3.BucketPolicy(`${name}-tls-only`, {
            bucket: bucket.id,
            policy: tlsOnly.json,
        }, { parent: this, dependsOn: [publicAccessBlock] });

        this.bucketName = bucket.id;
        this.bucketArn = bucket.arn;
        this.registerOutputs({ bucketName: this.bucketName, bucketArn: this.bucketArn });
    }
}
