// Exercises the policy rules without Pulumi Cloud or Azure:
//   npx tsc && node --test bin/test/*.js
import { test } from "node:test";
import * as assert from "node:assert";
import { agentPoolViolation, rbacViolation, tagViolation, versionViolation } from "../rules";

test("1.35 and 1.36 pass, including patch versions", () => {
    assert.strictEqual(versionViolation("1.35"), undefined);
    assert.strictEqual(versionViolation("1.36"), undefined);
    assert.strictEqual(versionViolation("1.35.4"), undefined);
});

test("1.33 and a missing version are blocked", () => {
    assert.match(versionViolation("1.33")!, /not part of the fleet baseline/);
    assert.ok(versionViolation(undefined));
    assert.ok(versionViolation("1.37"));
});

test("RBAC must be true", () => {
    assert.strictEqual(rbacViolation(true), undefined);
    assert.ok(rbacViolation(false));
    assert.ok(rbacViolation(undefined));
});

test("the fleet=workshop tag is required", () => {
    assert.strictEqual(tagViolation({ fleet: "workshop" }), undefined);
    assert.ok(tagViolation({ fleet: "other" }));
    assert.ok(tagViolation({}));
    assert.ok(tagViolation(undefined));
});

test("exactly one pool with count 1", () => {
    assert.strictEqual(agentPoolViolation([{ count: 1 }]), undefined);
    assert.match(agentPoolViolation([{ count: 3 }])!, /count 1/);
    assert.match(agentPoolViolation([{ count: 1 }, { count: 1 }])!, /exactly one/);
    assert.ok(agentPoolViolation(undefined));
});
