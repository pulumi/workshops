// The checks behind the policy pack, as plain functions so they can be tested
// without Pulumi Cloud (see test/rules-test.ts). Each returns the violation
// message, or undefined when the resource is fine.

const PUBLIC_ACLS = ["public-read", "public-read-write", "authenticated-read"];

export function publicAclViolation(acl: string | undefined): string | undefined {
    if (acl && PUBLIC_ACLS.includes(acl)) {
        return `ACL '${acl}' exposes the bucket. The workshop bucket stays private.`;
    }
    return undefined;
}

export function publicBucketPolicyViolation(policy: unknown): string | undefined {
    const document = typeof policy === "string" ? policy : JSON.stringify(policy ?? "");
    if (/"Principal"\s*:\s*"\*"/.test(document) || /"AWS"\s*:\s*"\*"/.test(document)) {
        return 'The bucket policy grants access to everyone (Principal "*"). Scope it to a principal.';
    }
    return undefined;
}

export interface PublicAccessBlockSettings {
    blockPublicAcls?: boolean;
    blockPublicPolicy?: boolean;
    ignorePublicAcls?: boolean;
    restrictPublicBuckets?: boolean;
}

export function publicAccessBlockViolation(block: PublicAccessBlockSettings): string | undefined {
    const turnedOff = Object.entries(block)
        .filter(([, value]) => value === false)
        .map(([name]) => name);
    if (turnedOff.length > 0) {
        return `The public access block turns off: ${turnedOff.join(", ")}.`;
    }
    return undefined;
}
