// The check behind require-approval-flag, as a plain function so it can be
// tested without Pulumi Cloud (see test/rules-test.ts).
//
// What this actually inspects: the brief describes the rule as inspecting
// stack configuration (`demo:approved = true`) directly. Pulumi Policies
// validate resources (validateResource) or a stack's resource list
// (validateStack) — there is no documented mechanism for a policy to read
// `pulumi.Config` values directly. So the target program (01-fleet) carries
// the approval flag onto a marker resource's `keepers` (a plain string map
// on a `random.RandomId`), and this rule reads it from there. That marker is
// a workshop stand-in for wherever a real approval would actually live (a
// change-management system, a ChatOps gate) — see workerFleet.ts.

export interface ChangeMarkerKeepers {
    approved?: string;
    action?: string;
    replicaCount?: string;
}

export function requireApprovalViolation(keepers: ChangeMarkerKeepers | undefined): string | undefined {
    if (!keepers || keepers.approved === undefined) {
        // Not the change marker (e.g. a per-worker identity resource, which
        // carries no `approved` keeper) — nothing to check.
        return undefined;
    }
    if (keepers.approved !== "true") {
        const action = keepers.action ?? "this change";
        return (
            `Blocked: '${action}' has no approval. Set demo:approved via the orchestrator's ` +
            "Automation API config call before retrying."
        );
    }
    return undefined;
}
