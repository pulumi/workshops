import * as azurenative from "@pulumi/azure-native";
import { PolicyPack, validateResourceOfType } from "@pulumi/policy";
import { agentPoolViolation, rbacViolation, tagViolation, versionViolation } from "./rules";

// Step 4. The fleet baseline as a policy pack. Every rule is mandatory, so a
// cluster that breaks it stops at `pulumi preview`, before anything reaches Azure.
//
// Run it against a stack without publishing it:
//   pulumi preview --policy-pack ../04-fleet-policies
// Publish and enable it for the whole organization with:
//   pulumi policy publish <org>
//   pulumi policy enable <org>/fleet-baseline latest

new PolicyPack("fleet-baseline", {
    policies: [
        {
            name: "aks-supported-version",
            description: "AKS clusters run Kubernetes 1.35 or 1.36.",
            enforcementLevel: "mandatory",
            validateResource: validateResourceOfType(azurenative.containerservice.ManagedCluster, (cluster, _args, reportViolation) => {
                const violation = versionViolation(cluster.kubernetesVersion);
                if (violation) {
                    reportViolation(violation);
                }
            }),
        },
        {
            name: "aks-rbac-enabled",
            description: "Kubernetes RBAC is on.",
            enforcementLevel: "mandatory",
            validateResource: validateResourceOfType(azurenative.containerservice.ManagedCluster, (cluster, _args, reportViolation) => {
                const violation = rbacViolation(cluster.enableRBAC);
                if (violation) {
                    reportViolation(violation);
                }
            }),
        },
        {
            name: "aks-fleet-tag",
            description: "Every cluster carries the tag fleet=workshop.",
            enforcementLevel: "mandatory",
            validateResource: validateResourceOfType(azurenative.containerservice.ManagedCluster, (cluster, _args, reportViolation) => {
                const violation = tagViolation(cluster.tags);
                if (violation) {
                    reportViolation(violation);
                }
            }),
        },
        {
            name: "aks-one-small-pool",
            description: "One agent pool with one node (cost guard).",
            enforcementLevel: "mandatory",
            validateResource: validateResourceOfType(azurenative.containerservice.ManagedCluster, (cluster, _args, reportViolation) => {
                const violation = agentPoolViolation(cluster.agentPoolProfiles);
                if (violation) {
                    reportViolation(violation);
                }
            }),
        },
    ],
});
