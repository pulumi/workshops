// Exercises the policy rules without Pulumi Cloud:
//   npx tsc && node bin/test/rules-test.js
import * as assert from "assert";
import { publicAccessBlockViolation, publicAclViolation, publicBucketPolicyViolation } from "../rules";

let passed = 0;
const check = (name: string, fn: () => void) => { fn(); passed++; console.log(`ok   ${name}`); };

// the baseline stack: a private bucket, nothing else
check("no ACL is fine", () => assert.strictEqual(publicAclViolation(undefined), undefined));
check("private ACL is fine", () => assert.strictEqual(publicAclViolation("private"), undefined));
check("public-read is blocked", () => assert.match(publicAclViolation("public-read")!, /stays private/));
check("public-read-write is blocked", () => assert.ok(publicAclViolation("public-read-write")));
check("authenticated-read is blocked", () => assert.ok(publicAclViolation("authenticated-read")));

// bucket policies
check("no policy is fine", () => assert.strictEqual(publicBucketPolicyViolation(undefined), undefined));
check("scoped policy is fine", () => assert.strictEqual(publicBucketPolicyViolation(
    JSON.stringify({ Statement: [{ Effect: "Allow", Principal: { AWS: "arn:aws:iam::111122223333:role/app" }, Action: "s3:GetObject" }] })), undefined));
check('Principal "*" is blocked', () => assert.match(publicBucketPolicyViolation(
    JSON.stringify({ Statement: [{ Effect: "Allow", Principal: "*", Action: "s3:GetObject" }] }))!, /everyone/));
check('Principal AWS "*" is blocked', () => assert.ok(publicBucketPolicyViolation(
    JSON.stringify({ Statement: [{ Effect: "Allow", Principal: { AWS: "*" }, Action: "s3:GetObject" }] }))));
check("an object policy is blocked too", () => assert.ok(publicBucketPolicyViolation(
    { Statement: [{ Effect: "Allow", Principal: "*", Action: "s3:GetObject" }] })));

// public access block: what Neo adds when it hardens the bucket
check("all four on is fine", () => assert.strictEqual(publicAccessBlockViolation({
    blockPublicAcls: true, blockPublicPolicy: true, ignorePublicAcls: true, restrictPublicBuckets: true }), undefined));
check("one turned off is blocked", () => assert.match(publicAccessBlockViolation({
    blockPublicAcls: true, blockPublicPolicy: false, ignorePublicAcls: true, restrictPublicBuckets: true })!, /blockPublicPolicy/));
check("all four off is blocked", () => assert.ok(publicAccessBlockViolation({
    blockPublicAcls: false, blockPublicPolicy: false, ignorePublicAcls: false, restrictPublicBuckets: false })));

console.log(`\npassed=${passed} failed=0`);
