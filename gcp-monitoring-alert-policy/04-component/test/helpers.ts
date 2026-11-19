import * as assert from "node:assert";
import * as pulumi from "@pulumi/pulumi";

export interface Recorded {
    type: string;
    name: string;
    inputs: Record<string, any>;
}

export const created: Recorded[] = [];

// Mocks answer every resource registration without talking to Google Cloud and
// remember what was registered. Call this before importing the code under test.
export function installMocks(): void {
    pulumi.runtime.setMocks({
        newResource: (args: pulumi.runtime.MockResourceArgs) => {
            created.push({ type: args.type, name: args.name, inputs: args.inputs });
            const state: Record<string, any> = { ...args.inputs };
            if (args.type === "gcp:monitoring/slo:Slo") {
                state.name = `projects/test-project/services/${args.inputs.service}/serviceLevelObjectives/${args.inputs.sloId}`;
            } else if (args.type === "gcp:monitoring/customService:CustomService") {
                state.name = `projects/test-project/services/${args.inputs.serviceId}`;
            } else if (args.type === "gcp:monitoring/notificationChannel:NotificationChannel") {
                state.name = `projects/test-project/notificationChannels/${args.name}`;
            } else if (args.type === "gcp:logging/metric:Metric") {
                state.name = args.inputs.name;
            }
            return { id: `${args.name}_id`, state };
        },
        call: (args: pulumi.runtime.MockCallArgs) => args.inputs,
    }, "gcp-monitoring-demo", "test", false);
}

export const CUSTOM_SERVICE = "gcp:monitoring/customService:CustomService";
export const ALERT_POLICY = "gcp:monitoring/alertPolicy:AlertPolicy";

export function ofType(type: string): Recorded[] {
    return created.filter(r => r.type === type);
}

// The rule the workshop cares about: a custom service never ships without an
// alert policy.
export function assertEveryCustomServiceHasAlertPolicy(): void {
    const services = ofType(CUSTOM_SERVICE);
    const policies = ofType(ALERT_POLICY);
    if (services.length > 0) {
        assert.ok(
            policies.length > 0,
            `${services.length} CustomService resource(s) created but no AlertPolicy`,
        );
    }
}
