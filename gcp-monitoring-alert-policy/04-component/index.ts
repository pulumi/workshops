import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import { ServiceMonitoring } from "./monitoring";

// Step 6: the same stack as 03-inline, with steps 3 to 5 moved into the
// ServiceMonitoring component. The service is unchanged; the monitoring is
// the five lines at the bottom.
const config = new pulumi.Config();
const serviceName = config.get("serviceName") ?? "hello-api";
const region = new pulumi.Config("gcp").require("region");

const service = new gcp.cloudrunv2.Service("service", {
    name: serviceName,
    location: region,
    ingress: "INGRESS_TRAFFIC_ALL",
    invokerIamDisabled: true,
    deletionProtection: false,
    template: {
        scaling: { maxInstanceCount: 2 },
        containers: [{
            image: "docker.io/mendhak/http-https-echo:42",
            ports: { containerPort: 8080 },
        }],
    },
});

const monitoring = new ServiceMonitoring("monitoring", {
    serviceName: service.name,
    goal: 0.99,
    email: config.require("alertEmail"),
    runbookUrl: config.require("runbookUrl"),
    // Only needed when this stack was first deployed from 03-inline.
    adoptInlineResources: config.getBoolean("adoptInline") ?? false,
});

export const url = service.uri;
export const name = service.name;
export const sloName = monitoring.sloName;
