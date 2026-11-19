/**
 * Pulumi Policies pack for step 6 (06-policy) of "Provisioning real
 * infrastructure from a Backstage catalog with Pulumi".
 *
 * One mandatory rule: every `aws.s3.Bucket` must carry a non-empty `team`
 * tag, so cost can be attributed back to whichever team submitted the
 * catalog request. This is the same bucket the scaffolder action
 * (03-scaffolder-action) creates through the Automation API, so this pack
 * is what turns "the update is blocked" into something the presenter can
 * actually show: submit a catalog request with no team tag and the
 * Automation API's `up()` call fails with this policy's message.
 *
 * API confirmed 2026-09-30 at
 * https://www.pulumi.com/docs/discovery-governance/concepts/policy-as-code/ :
 * Pulumi's policy-as-code product is named "Pulumi Policies" (never
 * "CrossGuard" -- that name still appears in some older blog posts, but the
 * current docs use "Pulumi Policies" throughout). A policy pack is a
 * `PolicyPack` containing one or more `ResourceValidationPolicy` /
 * `StackValidationPolicy` entries; `validateResourceOfType` is the
 * `@pulumi/policy` helper for scoping a resource validation to one
 * resource type, confirmed from the same package's own reference example:
 * https://github.com/pulumi/docs/blob/master/static/programs/unit-test-policy-typescript/index.ts
 * (read 2026-09-30).
 *
 * The `aws:s3/bucket:Bucket` type token below is confirmed, not guessed:
 * it is the literal `static __pulumiType` constant in the compiled
 * `@pulumi/aws` package installed locally for this workshop
 * (`node_modules/@pulumi/aws/s3/bucket.js`), read 2026-09-30. Passing the
 * `aws.s3.Bucket` class itself to `validateResourceOfType` means this file
 * never needs to spell the token out for the real policy check; it only
 * shows up here as documentation and in the test file, where a plain args
 * object has to set `type` by hand.
 */

import * as aws from "@pulumi/aws";
import { PolicyPack, ResourceValidationPolicy, validateResourceOfType } from "@pulumi/policy";

export const requireTeamTagPolicy: ResourceValidationPolicy = {
    name: "s3-bucket-require-team-tag",
    description: "S3 buckets must have a 'team' tag for cost attribution.",
    enforcementLevel: "mandatory",
    validateResource: validateResourceOfType(aws.s3.Bucket, (bucket, args, reportViolation) => {
        const team = bucket.tags?.team;
        if (typeof team !== "string" || team.trim().length === 0) {
            reportViolation(
                "S3 buckets must have a 'team' tag for cost attribution. " +
                `Add tags: { team: "<your-team-name>" } to bucket '${args.name}' ` +
                "and resubmit the catalog request.",
            );
        }
    }),
};

new PolicyPack("backstage-demo-guardrails", {
    policies: [requireTeamTagPolicy],
});
