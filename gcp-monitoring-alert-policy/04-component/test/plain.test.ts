import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import { installMocks, assertEveryCustomServiceHasAlertPolicy } from "./helpers";

installMocks();

// Step 7, the failing half: a plain CustomService with no AlertPolicy. This
// file is expected to FAIL; `npm run test:plain` is the demo of the guardrail.
describe("plain CustomService (expected to fail)", () => {
    before(async () => {
        const customService = new gcp.monitoring.CustomService("plain", {
            serviceId: "orders-api",
            displayName: "orders-api",
        });
        await new Promise<void>(resolve => customService.serviceId.apply(() => resolve()));
    });

    it("creates an alert policy for every custom service", () => {
        assertEveryCustomServiceHasAlertPolicy();
    });
});
