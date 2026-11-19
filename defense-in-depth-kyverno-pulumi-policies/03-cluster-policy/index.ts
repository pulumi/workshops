import * as k8s from "@pulumi/kubernetes";

// Step 4: the ClusterPolicy that rejects a Pod with no resource limits.
//
// This is a separate Pulumi project from 02-kyverno (each numbered folder is
// its own concern, matching the reference workshop's layout), so it cannot
// depend on 02-kyverno's resources directly. Instead, run
// `wait-for-kyverno.sh` before `pulumi up` here: it blocks until Kyverno's
// admission-webhook pods are Ready, which is the same ordering problem
// `dependsOn` solves within a single Pulumi program (see AGENTS.md).
const provider = new k8s.Provider("kind", {});

// ClusterPolicy is Kyverno's original validation CRD. As of the current
// Kyverno docs (kyverno.io/docs/policy-types/cluster-policy/validate/, read
// 2026-09-25) it is marked deprecated in favor of CEL-based kinds
// (ValidatingPolicy and friends), but it remains fully supported, is what
// the brief specifies, and is still what Kyverno's own sample policy
// library ships. The top-level `spec.validationFailureAction` field is
// deprecated in favor of the per-rule `spec.rules[].validate.failureAction`
// used below, which is the field this policy actually needs to avoid
// teaching a syntax that is already on its way out.
const clusterPolicy = new k8s.apiextensions.CustomResource(
    "require-resource-limits",
    {
        apiVersion: "kyverno.io/v1",
        kind: "ClusterPolicy",
        metadata: {
            name: "require-resource-limits",
        },
        spec: {
            background: true,
            rules: [
                {
                    name: "validate-resources",
                    match: {
                        any: [{ resources: { kinds: ["Pod"] } }],
                    },
                    validate: {
                        failureAction: "Enforce",
                        message:
                            "Every container must set resources.limits.cpu and " +
                            "resources.limits.memory.",
                        pattern: {
                            spec: {
                                containers: [
                                    {
                                        resources: {
                                            limits: {
                                                cpu: "?*",
                                                memory: "?*",
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            ],
        },
    },
    { provider },
);

export const policyName = clusterPolicy.metadata.name;
