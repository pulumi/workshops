import * as assert from "node:assert";
import { ALERT_POLICY_TYPE, CUSTOM_SERVICE_TYPE, missingAlertPolicyViolation } from "../rules";

describe("missingAlertPolicyViolation", () => {
    it("reports a custom service without an alert policy", () => {
        assert.ok(missingAlertPolicyViolation([CUSTOM_SERVICE_TYPE, "gcp:monitoring/slo:Slo"]));
    });
    it("passes a custom service with an alert policy", () => {
        assert.strictEqual(missingAlertPolicyViolation([CUSTOM_SERVICE_TYPE, ALERT_POLICY_TYPE, ALERT_POLICY_TYPE]), undefined);
    });
    it("passes a stack without a custom service", () => {
        assert.strictEqual(missingAlertPolicyViolation(["gcp:cloudrunv2/service:Service"]), undefined);
    });
});
