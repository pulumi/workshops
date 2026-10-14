// Exercises the policy rule without Pulumi Cloud:
//   npx tsc && node bin/test/rules-test.js
import * as assert from "assert";
import { requireApprovalViolation } from "../rules";

let passed = 0;
const check = (name: string, fn: () => void) => {
    fn();
    passed++;
    console.log(`ok   ${name}`);
};

check("a resource with no keepers is not the marker: fine", () => {
    assert.strictEqual(requireApprovalViolation(undefined), undefined);
});
check("a worker identity resource (no approved keeper) is fine", () => {
    assert.strictEqual(requireApprovalViolation({ replicaCount: "4" }), undefined);
});
check("marker with approved=true is fine", () => {
    assert.strictEqual(requireApprovalViolation({ approved: "true", action: "scale-up" }), undefined);
});
check("marker with approved=false is blocked", () => {
    assert.match(requireApprovalViolation({ approved: "false", action: "scale-up" })!, /Blocked: 'scale-up'/);
});
check("marker with approved missing entirely (empty string) is blocked", () => {
    assert.ok(requireApprovalViolation({ approved: "", action: "rotate" }));
});
check("blocked message names the action", () => {
    assert.match(requireApprovalViolation({ approved: "false", action: "scale-down" })!, /scale-down/);
});
check("blocked message defaults the action name when absent", () => {
    assert.match(requireApprovalViolation({ approved: "false" })!, /this change/);
});

console.log(`\npassed=${passed} failed=0`);
