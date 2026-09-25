// The check behind the policy pack, as a plain function so it can be tested
// without Pulumi Cloud (see test/rules-test.ts). This is the same rule as
// 03-cluster-policy's require-resource-limits ClusterPolicy, enforced here
// against Pulumi-declared resources instead of admission requests.

export interface ContainerLike {
    name?: string;
    resources?: {
        limits?: {
            cpu?: string;
            memory?: string;
        };
    };
}

// Returns the names of containers missing resources.limits.cpu or
// resources.limits.memory; an empty array means the Pod is compliant.
export function missingResourceLimits(containers: ContainerLike[]): string[] {
    return containers
        .filter((c) => {
            const limits = c.resources?.limits;
            return !limits || !limits.cpu || !limits.memory;
        })
        .map((c) => c.name ?? "(unnamed)");
}
