// The checks behind the policy pack, as plain functions so they can be tested
// without Pulumi Cloud or Azure (see test/rules-test.ts). Each returns the
// violation message, or undefined when the cluster is fine.

const ALLOWED_VERSIONS = ["1.35", "1.36"];
const REQUIRED_TAG = { key: "fleet", value: "workshop" };

// AKS accepts "1.35" and reports "1.35.x", so match the minor version.
export function versionViolation(kubernetesVersion: string | undefined): string | undefined {
    const minor = (kubernetesVersion ?? "").split(".").slice(0, 2).join(".");
    if (!ALLOWED_VERSIONS.includes(minor)) {
        return `kubernetesVersion '${kubernetesVersion}' is not part of the fleet baseline. Use one of: ${ALLOWED_VERSIONS.join(", ")}.`;
    }
    return undefined;
}

export function rbacViolation(enableRBAC: boolean | undefined): string | undefined {
    if (enableRBAC !== true) {
        return "enableRBAC must be true on every fleet cluster.";
    }
    return undefined;
}

export function tagViolation(tags: { [key: string]: string } | undefined): string | undefined {
    if (!tags || tags[REQUIRED_TAG.key] !== REQUIRED_TAG.value) {
        return `The tag ${REQUIRED_TAG.key}=${REQUIRED_TAG.value} is required.`;
    }
    return undefined;
}

export interface AgentPool {
    count?: number;
}

// One pool with one node: a cost guard for the workshop.
export function agentPoolViolation(pools: AgentPool[] | undefined): string | undefined {
    if (!pools || pools.length !== 1) {
        return `A fleet cluster has exactly one agent pool, found ${pools?.length ?? 0}.`;
    }
    if (pools[0].count !== 1) {
        return `The agent pool must have count 1, found ${pools[0].count}.`;
    }
    return undefined;
}
