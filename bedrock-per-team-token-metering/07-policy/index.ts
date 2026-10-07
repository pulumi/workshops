import * as aws from "@pulumi/aws";
import { PolicyPack, UnknownValueError, validateResourceOfType } from "@pulumi/policy";
import { missingTagsViolation, wildcardInvokeViolation } from "./rules";

// Policy as code for the workshop demo. The baseline stack passes: every inference
// profile has Team and CostCenter, and every invoke grant names a profile ARN.
//
// Run it locally, no publish needed:
//   pulumi preview --policy-pack ../07-policy
// Or publish and enable it for the organization:
//   pulumi policy publish <org>
//   pulumi policy enable <org>/bedrock-metering-guardrails latest

// A policy document that embeds a resource that does not exist yet (a profile ARN) is
// unknown during preview. Skip it there; the engine validates it again with the real
// value when `pulumi up` registers the resource.
function skipUnknown(check: () => void): void {
    try {
        check();
    } catch (error) {
        if (!(error instanceof UnknownValueError)) {
            throw error;
        }
    }
}

new PolicyPack("bedrock-metering-guardrails", {
    policies: [
        {
            name: "bedrock-profile-required-tags",
            description: "Bedrock inference profiles must carry the Team and CostCenter tags.",
            enforcementLevel: "mandatory",
            validateResource: validateResourceOfType(aws.bedrock.InferenceProfile, (profile, _args, reportViolation) => {
                const violation = missingTagsViolation(profile.tags);
                if (violation) {
                    reportViolation(violation);
                }
            }),
        },
        {
            name: "bedrock-no-wildcard-invoke",
            description: "IAM policies must not allow bedrock:InvokeModel on every resource.",
            enforcementLevel: "mandatory",
            validateResource: [
                validateResourceOfType(aws.iam.RolePolicy, (rolePolicy, _args, reportViolation) => {
                    skipUnknown(() => {
                        const violation = wildcardInvokeViolation(rolePolicy.policy);
                        if (violation) {
                            reportViolation(violation);
                        }
                    });
                }),
                validateResourceOfType(aws.iam.Policy, (policy, _args, reportViolation) => {
                    skipUnknown(() => {
                        const violation = wildcardInvokeViolation(policy.policy);
                        if (violation) {
                            reportViolation(violation);
                        }
                    });
                }),
            ],
        },
    ],
});
