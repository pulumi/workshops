// Exercises the policy rule without Pulumi Cloud:
//   npx tsc && node bin/test/rules-test.js
import * as assert from "assert";
import { missingResourceLimits } from "../rules";

let passed = 0;
const check = (name: string, fn: () => void) => { fn(); passed++; console.log(`ok   ${name}`); };

check("a container with both limits is fine", () => assert.deepStrictEqual(
    missingResourceLimits([{ name: "app", resources: { limits: { cpu: "250m", memory: "256Mi" } } }]), []));

check("a container with no resources block is flagged", () => assert.deepStrictEqual(
    missingResourceLimits([{ name: "app" }]), ["app"]));

check("a container missing only cpu is flagged", () => assert.deepStrictEqual(
    missingResourceLimits([{ name: "app", resources: { limits: { memory: "256Mi" } } }]), ["app"]));

check("a container missing only memory is flagged", () => assert.deepStrictEqual(
    missingResourceLimits([{ name: "app", resources: { limits: { cpu: "250m" } } }]), ["app"]));

check("an unnamed offending container reports as (unnamed)", () => assert.deepStrictEqual(
    missingResourceLimits([{ resources: {} }]), ["(unnamed)"]));

check("multiple containers: only the offenders are named", () => assert.deepStrictEqual(
    missingResourceLimits([
        { name: "sidecar", resources: { limits: { cpu: "100m", memory: "128Mi" } } },
        { name: "app" },
    ]), ["app"]));

check("no containers is vacuously fine", () => assert.deepStrictEqual(missingResourceLimits([]), []));

console.log(`\npassed=${passed} failed=0`);
