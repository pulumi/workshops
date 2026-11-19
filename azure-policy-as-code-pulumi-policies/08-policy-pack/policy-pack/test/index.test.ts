import { strict as assert } from "node:assert";
import { test } from "node:test";
import { checkNoPublicBlob } from "../rule";

function run(allowBlobPublicAccess: boolean | undefined): string[] {
    const violations: string[] = [];
    checkNoPublicBlob(
        { resourceGroupName: "rg", kind: "StorageV2", sku: { name: "Standard_LRS" }, allowBlobPublicAccess },
        {} as never,
        (message) => { violations.push(String(message)); },
    );
    return violations;
}

test("reports a violation when public blob access is on", () => {
    assert.equal(run(true).length, 1);
});

test("reports a violation when the property is left unset", () => {
    assert.equal(run(undefined).length, 1);
});

test("passes when public blob access is off", () => {
    assert.equal(run(false).length, 0);
});
