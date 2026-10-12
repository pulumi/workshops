import * as assert from "node:assert";
import * as pulumi from "@pulumi/pulumi";
import { installMocks, created, ofType, assertEveryCustomServiceHasAlertPolicy, CUSTOM_SERVICE, ALERT_POLICY } from "./helpers";

installMocks();

describe("ServiceMonitoring", () => {
    before(async () => {
        const { ServiceMonitoring } = await import("../monitoring");
        const monitoring = new ServiceMonitoring("test", {
            serviceName: "orders-api",
            goal: 0.99,
            email: "oncall@example.com",
            runbookUrl: "https://example.com/runbooks/orders-api",
        });
        // Awaiting the outputs waits until every child resource is registered.
        await new Promise<void>(resolve =>
            pulumi.all([monitoring.sloName, monitoring.dashboardId, monitoring.errorMetricName, ...monitoring.alertPolicyIds])
                .apply(() => resolve()));
    });

    it("creates an alert policy for every custom service", () => {
        assertEveryCustomServiceHasAlertPolicy();
    });

    it("creates one custom service and two burn-rate policies", () => {
        assert.strictEqual(ofType(CUSTOM_SERVICE).length, 1);
        const policies = ofType(ALERT_POLICY);
        assert.strictEqual(policies.length, 2);
        const lookbacks = policies.map(p => /select_slo_burn_rate\(".*", "(\d+s)"\)/.exec(p.inputs.conditions[0].conditionThreshold.filter)?.[1]);
        assert.deepStrictEqual(lookbacks.sort(), ["21600s", "3600s"]);
    });

    it("attaches the email channel and a runbook link to every policy", () => {
        for (const policy of ofType(ALERT_POLICY)) {
            assert.strictEqual(policy.inputs.notificationChannels.length, 1);
            assert.match(policy.inputs.documentation.content, /example\.com\/runbooks\/orders-api/);
        }
    });

    it("creates the log metric and the dashboard", () => {
        assert.strictEqual(created.filter(r => r.type === "gcp:logging/metric:Metric").length, 1);
        assert.strictEqual(created.filter(r => r.type === "gcp:monitoring/dashboard:Dashboard").length, 1);
    });
});
