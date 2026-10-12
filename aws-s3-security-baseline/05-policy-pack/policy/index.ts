import * as aws from "@pulumi/aws";
import { PolicyPack, ReportViolation, StackValidationArgs, validateResourceOfType } from "@pulumi/policy";

// The S3 security baseline as policy. Publish it from this folder with
// `pulumi policy publish <org>`; 11-policy-group/publish-policy.sh does the rest.

const BUCKET = "aws:s3/bucket:Bucket";

// The six companion types a baseline bucket carries.
const COMPANIONS: { type: string; label: string }[] = [
    { type: "aws:s3/bucketPublicAccessBlock:BucketPublicAccessBlock", label: "public access block" },
    { type: "aws:s3/bucketOwnershipControls:BucketOwnershipControls", label: "ownership controls" },
    { type: "aws:s3/bucketServerSideEncryptionConfiguration:BucketServerSideEncryptionConfiguration", label: "server-side encryption configuration" },
    { type: "aws:s3/bucketVersioning:BucketVersioning", label: "versioning" },
    { type: "aws:s3/bucketLifecycleConfiguration:BucketLifecycleConfiguration", label: "lifecycle configuration" },
    { type: "aws:s3/bucketPolicy:BucketPolicy", label: "bucket policy" },
];

type Res = StackValidationArgs["resources"][number];

// A companion belongs to a bucket when it takes that bucket as its `bucket`
// input. The dependency is visible to the stack policy at preview time.
function belongsTo(companion: Res, bucket: Res): boolean {
    const viaInput = (companion.propertyDependencies?.["bucket"] ?? []).some(r => r.urn === bucket.urn);
    const viaDeps = (companion.dependencies ?? []).some(r => r.urn === bucket.urn);
    return viaInput || viaDeps;
}

function checkBaseline(resources: Res[], reportViolation: ReportViolation) {
    for (const bucket of resources.filter(r => r.type === BUCKET)) {
        for (const c of COMPANIONS) {
            const found = resources.some(r => r.type === c.type && belongsTo(r, bucket));
            if (!found) {
                reportViolation(
                    `Bucket ${bucket.name} has no ${c.label}. Create the bucket with the SecureBucket component, ` +
                    `or add the missing ${c.type.split(":").pop()}.`,
                );
            }
        }
    }
}

new PolicyPack("s3-baseline-policies", {
    policies: [
        {
            name: "s3-bucket-has-baseline",
            description: "Every S3 bucket needs the six companion resources of the security baseline.",
            enforcementLevel: "mandatory",
            validateStack: (args, reportViolation) => checkBaseline(args.resources, reportViolation),
        },
        {
            name: "s3-public-access-block-all-on",
            description: "A public access block must keep all four settings on.",
            enforcementLevel: "mandatory",
            validateResource: validateResourceOfType(aws.s3.BucketPublicAccessBlock, (pab, _args, reportViolation) => {
                if (!(pab.blockPublicAcls && pab.blockPublicPolicy && pab.ignorePublicAcls && pab.restrictPublicBuckets)) {
                    reportViolation("All four public access block settings must be true.");
                }
            }),
        },
        {
            name: "s3-versioning-enabled",
            description: "Bucket versioning must be Enabled.",
            enforcementLevel: "mandatory",
            validateResource: validateResourceOfType(aws.s3.BucketVersioning, (versioning, _args, reportViolation) => {
                if (versioning.versioningConfiguration.status !== "Enabled") {
                    reportViolation("Versioning status must be Enabled.");
                }
            }),
        },
    ],
});
