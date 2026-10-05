import * as kubernetes from "@pulumi/kubernetes";
import { PolicyPack, validateResourceOfType } from "@pulumi/policy";
import { missingResourceLimits } from "./rules";

// Policy as code for the workshop demo. Same rule as 03-cluster-policy's
// require-resource-limits ClusterPolicy: every container must set
// resources.limits.cpu and resources.limits.memory. Here it runs against
// Pulumi-declared resources during `pulumi preview`/`pulumi up`, before
// anything reaches the cluster.
//
// Run it against a preview from ../workload:
//   pulumi preview --policy-pack ../policy-pack

new PolicyPack("require-resource-limits", {
    policies: [
        {
            name: "containers-must-set-resource-limits",
            description:
                "Every container in a Pod must set resources.limits.cpu and " +
                "resources.limits.memory.",
            enforcementLevel: "mandatory",
            validateResource: validateResourceOfType(kubernetes.core.v1.Pod, (pod, _args, reportViolation) => {
                const containers = pod.spec?.containers ?? [];
                const offenders = missingResourceLimits(containers);
                for (const name of offenders) {
                    reportViolation(
                        `Container "${name}" in Pod "${pod.metadata?.name ?? "(unnamed)"}" ` +
                        "must set resources.limits.cpu and resources.limits.memory.",
                    );
                }
            }),
        },
    ],
});
