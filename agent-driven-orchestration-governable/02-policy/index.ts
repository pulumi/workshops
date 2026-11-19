import * as random from "@pulumi/random";
import { PolicyPack, validateResourceOfType } from "@pulumi/policy";
import { requireApprovalViolation } from "./rules";

// Policy as code for the workshop demo. Every WorkerFleet apply creates a
// change-marker resource (see 01-fleet/workerFleet.ts); this rule inspects
// it and blocks the update if the approval flag it carries is not "true".

new PolicyPack("agent-orchestration-approval-gate", {
    policies: [
        {
            name: "require-approval-flag",
            description: "A worker fleet change must carry an explicit approval flag.",
            enforcementLevel: "mandatory",
            validateResource: validateResourceOfType(random.RandomId, (id, _args, reportViolation) => {
                const violation = requireApprovalViolation(id.keepers);
                if (violation) {
                    reportViolation(violation);
                }
            }),
        },
    ],
});
