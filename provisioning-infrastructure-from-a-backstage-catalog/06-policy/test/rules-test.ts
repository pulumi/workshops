/**
 * Exercises `requireTeamTagPolicy` end to end: builds a `ResourceValidationArgs`
 * and runs it through the policy's own `validateResource` function, the same
 * way the Pulumi engine would during `pulumi preview` / `pulumi up`.
 *
 * The `getEmptyArgs` / `runResourcePolicy` shape below mirrors `@pulumi/policy`'s
 * own testing guide and its official example's `test-helpers.ts`, rather than
 * hand-rolling a mock of `ResourceValidationArgs` from scratch:
 *   - guide: https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/#testing-your-policies
 *   - helper source: https://github.com/pulumi/docs/blob/master/static/programs/unit-test-policy-typescript/test/test-helpers.ts
 * both read 2026-09-30. That example wraps the same helpers in Mocha's
 * describe/it; this file skips the extra Mocha dependency and drives them
 * with a plain assert + counter runner instead, consistent with how other
 * folders in this workshop repo self-check without a test framework.
 *
 * Run: npx tsc && node bin/test/rules-test.js
 */

import * as assert from "assert";
import * as policy from "@pulumi/policy";
import { requireTeamTagPolicy } from "../index";

function getEmptyOptions(): policy.PolicyResourceOptions {
    return {
        protect: false,
        ignoreChanges: [],
        aliases: [],
        customTimeouts: { createSeconds: 0, updateSeconds: 0, deleteSeconds: 0 },
        additionalSecretOutputs: [],
    };
}

function getEmptyArgs(): policy.ResourceValidationArgs {
    return {
        type: "",
        props: {},
        urn: "unknown",
        name: "unknown",
        opts: getEmptyOptions(),
        isType: () => true,
        asType: () => undefined,
        getConfig: <T>() => <T>{},
        stackTags: new Map<string, string>(),
        notApplicable: (reason?: string): never => {
            throw new Error(reason || "Not applicable");
        },
    };
}

function runResourcePolicy(
    resourcePolicy: policy.ResourceValidationPolicy,
    args: policy.ResourceValidationArgs,
): string[] {
    const validations = Array.isArray(resourcePolicy.validateResource)
        ? resourcePolicy.validateResource
        : [resourcePolicy.validateResource];
    const violations: string[] = [];
    for (const validation of validations) {
        if (validation) {
            validation(args, (message: string) => {
                violations.push(message);
            });
        }
    }
    return violations;
}

let passCount = 0;

function check(name: string, fn: () => void): void {
    fn();
    passCount++;
    console.log(`ok   ${name}`);
}

// This is the exact case the workshop demo triggers: a catalog request
// submitted with no team tag at all.
check("bucket with no tags is blocked", () => {
    const args = getEmptyArgs();
    args.type = "aws:s3/bucket:Bucket";
    args.name = "scaffolded-bucket";
    args.props.tags = undefined;
    const violations = runResourcePolicy(requireTeamTagPolicy, args);
    assert.strictEqual(violations.length, 1, "expected exactly one violation");
    assert.match(violations[0], /team.*tag/i);
});

check("bucket with tags but no team key is blocked", () => {
    const args = getEmptyArgs();
    args.type = "aws:s3/bucket:Bucket";
    args.name = "scaffolded-bucket";
    args.props.tags = { workshop: "provisioning-infrastructure-from-a-backstage-catalog" };
    const violations = runResourcePolicy(requireTeamTagPolicy, args);
    assert.strictEqual(violations.length, 1, "expected exactly one violation");
});

check("bucket with a blank team tag is blocked", () => {
    const args = getEmptyArgs();
    args.type = "aws:s3/bucket:Bucket";
    args.name = "scaffolded-bucket";
    args.props.tags = { team: "   " };
    const violations = runResourcePolicy(requireTeamTagPolicy, args);
    assert.strictEqual(violations.length, 1, "a whitespace-only tag must still violate");
});

check("bucket with a real team tag passes", () => {
    const args = getEmptyArgs();
    args.type = "aws:s3/bucket:Bucket";
    args.name = "scaffolded-bucket";
    args.props.tags = { team: "platform-engineering" };
    const violations = runResourcePolicy(requireTeamTagPolicy, args);
    assert.strictEqual(violations.length, 0, "a populated team tag must not violate");
});

console.log(`\n${passCount} passed`);

// `../index` instantiates a `PolicyPack` at module scope, which -- like any
// analyzer plugin -- opens a gRPC handle waiting for the engine to connect.
// That handle never closes on its own outside a real `pulumi preview`/`up`,
// which is exactly why Pulumi's own official test example runs under
// `mocha ... --exit` (see its package.json, read 2026-09-30:
// https://github.com/pulumi/docs/blob/master/static/programs/unit-test-policy-typescript/package.json).
// This file has no Mocha to do that for it, so it forces the same outcome
// directly once every check above has already thrown on failure.
process.exit(0);
