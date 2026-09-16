import * as aws from "@pulumi/aws";
import { PolicyPack, validateResourceOfType } from "@pulumi/policy";
import { publicAccessBlockViolation, publicAclViolation, publicBucketPolicyViolation } from "./rules";

// Policy as code for the workshop demo. The baseline stack passes: a private
// bucket with no ACL, no bucket policy and no public access block. The rules
// only fire when someone (a human or an agent) tries to open the bucket up.
//
// Publish and enable it from this folder:
//   pulumi policy publish <org>
//   pulumi policy enable <org>/neo-workshop-guardrails latest
// `pulumi policy disable <org>/neo-workshop-guardrails` takes it off again.

new PolicyPack("neo-workshop-guardrails", {
    policies: [
        {
            name: "s3-no-public-acl",
            description: "S3 buckets must not carry a public ACL.",
            enforcementLevel: "mandatory",
            validateResource: validateResourceOfType(aws.s3.BucketAcl, (bucketAcl, _args, reportViolation) => {
                const violation = publicAclViolation(bucketAcl.acl);
                if (violation) {
                    reportViolation(violation);
                }
            }),
        },
        {
            name: "s3-no-public-bucket-policy",
            description: "Bucket policies must not grant access to everyone.",
            enforcementLevel: "mandatory",
            validateResource: validateResourceOfType(aws.s3.BucketPolicy, (bucketPolicy, _args, reportViolation) => {
                const violation = publicBucketPolicyViolation(bucketPolicy.policy);
                if (violation) {
                    reportViolation(violation);
                }
            }),
        },
        {
            name: "s3-keep-public-access-blocked",
            description: "A public access block must keep all four settings on.",
            enforcementLevel: "mandatory",
            validateResource: validateResourceOfType(aws.s3.BucketPublicAccessBlock, (block, _args, reportViolation) => {
                const violation = publicAccessBlockViolation(block);
                if (violation) {
                    reportViolation(violation);
                }
            }),
        },
    ],
});
