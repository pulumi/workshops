import { PolicyPack } from "@pulumi/policy";
import { secretsWithoutRotation } from "./rules";

// Policy as code for the workshop demo. The baseline stack passes: its secret has a rotation.
// A second secret without one (config `extraSecret: unrotated`) fails the preview.
//
// Run it locally from 02-rotating-secret:
//   pulumi preview --policy-pack ../09-require-rotation
new PolicyPack("require-secret-rotation", {
    enforcementLevel: "mandatory",
    policies: [{
        name: "secret-must-rotate",
        description: "Every Secrets Manager secret needs a SecretRotation.",
        enforcementLevel: "mandatory",
        validateStack: (args, reportViolation) => {
            for (const message of secretsWithoutRotation(args.resources as any)) {
                reportViolation(message);
            }
        },
    }],
});
