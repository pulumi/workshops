import { PolicyPack } from "@pulumi/policy";
import { missingAlertPolicyViolation } from "./rules";

// Step 8: a stack validation policy. It sees every resource of the planned
// stack at once, which is what "a custom service and no alert policy" needs.
//
// Run it locally, from 03-inline or 04-component:
//   pulumi preview --policy-pack ../05-policy
// Local runs need no Pulumi Cloud policy group.

new PolicyPack("gcp-monitoring-guardrails", {
    policies: [
        {
            name: "custom-service-needs-alert-policy",
            description: "A stack with a Cloud Monitoring custom service must also have an alert policy.",
            enforcementLevel: "mandatory",
            validateStack: (args, reportViolation) => {
                const violation = missingAlertPolicyViolation(args.resources.map(r => r.type));
                if (violation) {
                    reportViolation(violation);
                }
            },
        },
    ],
});
