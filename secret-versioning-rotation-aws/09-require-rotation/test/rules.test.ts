import test from "node:test";
import assert from "node:assert/strict";
import { secretsWithoutRotation, ResourceLike } from "../rules";

const secret = (name: string): ResourceLike => ({
    type: "aws:secretsmanager/secret:Secret", urn: `urn:${name}`, name, props: {},
});
const rotation = (secretUrn: string): ResourceLike => ({
    type: "aws:secretsmanager/secretRotation:SecretRotation", urn: `urn:rot-${secretUrn}`, name: "rot", props: {},
    propertyDependencies: { secretId: [{ urn: secretUrn }] },
});

test("a secret with a rotation passes", () => {
    assert.deepEqual(secretsWithoutRotation([secret("a"), rotation("urn:a")]), []);
});

test("a secret without a rotation fails", () => {
    const out = secretsWithoutRotation([secret("a"), rotation("urn:a"), secret("b")]);
    assert.equal(out.length, 1);
    assert.match(out[0], /"b"/);
});
