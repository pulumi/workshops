// Pure rule functions, kept apart from the PolicyPack so they can be unit tested
// without Pulumi Cloud (see test/rules-test.ts). Each returns the violation
// message, or undefined when the resource is fine.

export const REQUIRED_TAGS = ["Team", "CostCenter"];

export function missingTagsViolation(tags: Record<string, string> | undefined): string | undefined {
    const missing = REQUIRED_TAGS.filter(key => !tags || !tags[key] || tags[key].trim() === "");
    if (missing.length > 0) {
        return `Inference profile is missing the tag(s) ${missing.join(", ")}. Without them its spend cannot be attributed to a team.`;
    }
    return undefined;
}

interface Statement {
    Effect?: string;
    Action?: string | string[];
    Resource?: string | string[];
}

const asList = (value: string | string[] | undefined): string[] =>
    value === undefined ? [] : Array.isArray(value) ? value : [value];

// bedrock:InvokeModel, bedrock:InvokeModel*, bedrock:* and * all allow invocation.
const grantsInvoke = (action: string): boolean => {
    const escaped = action.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
    return new RegExp(`^${escaped}$`, "i").test("bedrock:InvokeModel");
};

export function wildcardInvokeViolation(policy: unknown): string | undefined {
    let document: { Statement?: Statement | Statement[] } | undefined;
    try {
        document = typeof policy === "string" ? JSON.parse(policy) : (policy as typeof document);
    } catch {
        return undefined;
    }
    const statements = asList(document?.Statement as unknown as string | string[]) as unknown as Statement[];
    for (const statement of statements) {
        if (statement.Effect !== "Allow") {
            continue;
        }
        if (asList(statement.Action).some(grantsInvoke) && asList(statement.Resource).includes("*")) {
            return "Policy allows bedrock:InvokeModel on Resource \"*\". Name the team's inference profile ARN instead.";
        }
    }
    return undefined;
}
