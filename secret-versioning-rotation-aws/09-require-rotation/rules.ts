// The part of a stack resource the rule reads. PolicyResource from @pulumi/policy has these fields.
export interface ResourceLike {
    type: string;
    urn: string;
    name: string;
    props: Record<string, any>;
    // The engine hands over resource objects here, not bare URN strings.
    dependencies?: Array<{ urn: string }>;
    propertyDependencies?: Record<string, Array<{ urn: string }>>;
}

const SECRET = "aws:secretsmanager/secret:Secret";
const ROTATION = "aws:secretsmanager/secretRotation:SecretRotation";

// Returns one message per secret that no SecretRotation points at.
// At preview a new secret has no id yet, and reading an unknown value (props.id, props.secretId)
// makes the engine skip the policy with an advisory. So the rule never touches props: it matches
// on propertyDependencies. The rotation's `secretId` input is built from the secret, so the
// engine records the secret in propertyDependencies.secretId.
export function secretsWithoutRotation(resources: ResourceLike[]): string[] {
    const rotations = resources.filter(r => r.type === ROTATION);
    return resources
        .filter(r => r.type === SECRET)
        .filter(secret => !rotations.some(rot =>
            (rot.propertyDependencies?.secretId ?? []).some(dep => dep.urn === secret.urn)))
        .map(secret => `Secret "${secret.name}" has no aws.secretsmanager.SecretRotation. ` +
            "Add a rotation Lambda and a SecretRotation that points at it.");
}
