import assert from "node:assert/strict";
import { test } from "node:test";
import { missingTagsViolation, wildcardInvokeViolation } from "../rules";

test("profile with Team and CostCenter passes", () => {
    assert.equal(missingTagsViolation({ Team: "search", CostCenter: "cc-100" }), undefined);
});

test("profile without tags fails and names both tags", () => {
    const message = missingTagsViolation(undefined);
    assert.match(message ?? "", /Team, CostCenter/);
});

test("profile with only Team fails on CostCenter", () => {
    assert.match(missingTagsViolation({ Team: "search" }) ?? "", /CostCenter/);
});

const doc = (action: string | string[], resource: string | string[], effect = "Allow") =>
    JSON.stringify({ Version: "2012-10-17", Statement: [{ Effect: effect, Action: action, Resource: resource }] });

test("InvokeModel* on * fails", () => {
    assert.ok(wildcardInvokeViolation(doc("bedrock:InvokeModel*", "*")));
});

test("bedrock:* on * fails", () => {
    assert.ok(wildcardInvokeViolation(doc(["bedrock:*"], ["*"])));
});

test("InvokeModel on a profile ARN passes", () => {
    const arn = "arn:aws:bedrock:us-east-1:123456789012:application-inference-profile/abc";
    assert.equal(wildcardInvokeViolation(doc("bedrock:InvokeModel", arn)), undefined);
});

test("logs actions on * pass", () => {
    assert.equal(wildcardInvokeViolation(doc("logs:PutLogEvents", "*")), undefined);
});

test("Deny on * passes", () => {
    assert.equal(wildcardInvokeViolation(doc("bedrock:InvokeModel*", "*", "Deny")), undefined);
});
