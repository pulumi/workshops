import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import { dashboardJson } from "./dashboard";

// Steps 2 to 5 in one program. `stage` lets the presenter show each step's end
// state, and gives step 8 its "plain stack":
//   slo    step 3: custom service + SLO, no alert policy (the policy blocks this)
//   alerts step 4: adds the email channel and the two burn-rate policies
//   full   step 5: adds the log metric and the dashboard
const config = new pulumi.Config();
const serviceName = config.get("serviceName") ?? "hello-api";
const alertEmail = config.require("alertEmail");
const runbookUrl = config.require("runbookUrl");
const stage = config.get("stage") ?? "full";
if (!["slo", "alerts", "full"].includes(stage)) {
    throw new Error(`stage must be slo, alerts or full, got "${stage}"`);
}
const region = new pulumi.Config("gcp").require("region");

// Step 2: the service to watch (same resource as 02-service).
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

// Step 3: SLO as code. A custom service has no built-in SLI, so the SLO brings
// its own request-based SLI: good requests (2xx) over all requests, taken from
// the Cloud Run request_count metric.
const runRequests = pulumi.interpolate`metric.type="run.googleapis.com/request_count" resource.type="cloud_run_revision" resource.labels.service_name="${service.name}"`;

const customService = new gcp.monitoring.CustomService("custom-service", {
    serviceId: serviceName,
    displayName: serviceName,
    userLabels: { workshop: "gcp-monitoring" },
});

const slo = new gcp.monitoring.Slo("slo", {
    service: customService.serviceId,
    sloId: "availability",
    displayName: "99% of requests succeed over 7 days",
    goal: 0.99,
    rollingPeriodDays: 7,
    requestBasedSli: {
        goodTotalRatio: {
            totalServiceFilter: runRequests,
            goodServiceFilter: pulumi.interpolate`${runRequests} metric.labels.response_code_class="2xx"`,
        },
    },
});

export const sloName = slo.name;

// Step 4: a channel and two burn-rate alert policies. The fast window pages on
// a hard failure within the hour; the slow window catches a smaller, lasting
// error rate. The thresholds (10 and 2) are a design choice for this demo.
function burnRatePolicy(
    id: string,
    displayName: string,
    lookback: string,
    threshold: number,
    channel: gcp.monitoring.NotificationChannel,
): gcp.monitoring.AlertPolicy {
    return new gcp.monitoring.AlertPolicy(id, {
        displayName,
        combiner: "OR",
        conditions: [{
            displayName,
            conditionThreshold: {
                filter: pulumi.interpolate`select_slo_burn_rate("${slo.name}", "${lookback}")`,
                comparison: "COMPARISON_GT",
                thresholdValue: threshold,
                duration: "0s",
            },
        }],
        notificationChannels: [channel.name],
        documentation: {
            mimeType: "text/markdown",
            content: `The ${serviceName} error budget is burning faster than ${threshold}x over ${lookback}. Runbook: ${runbookUrl}`,
        },
    });
}

if (stage !== "slo") {
    const channel = new gcp.monitoring.NotificationChannel("email-channel", {
        displayName: `${serviceName} on-call`,
        type: "email",
        labels: { email_address: alertEmail },
    });
    burnRatePolicy("alert-fast", `${serviceName} fast burn`, "3600s", 10, channel);
    burnRatePolicy("alert-slow", `${serviceName} slow burn`, "21600s", 2, channel);
}

// Step 5: a log-based metric that counts ERROR logs of the service (Cloud Run
// writes a request log entry with severity ERROR for every 5xx response), and
// a dashboard that charts it next to the burn rate.
if (stage === "full") {
    const errorMetric = new gcp.logging.Metric("error-metric", {
        name: `${serviceName}-errors`,
        description: `ERROR-severity logs of ${serviceName}`,
        filter: pulumi.interpolate`resource.type="cloud_run_revision" AND resource.labels.service_name="${service.name}" AND severity>=ERROR`,
        metricDescriptor: {
            metricKind: "DELTA",
            valueType: "INT64",
            unit: "1",
        },
    });

    new gcp.monitoring.Dashboard("dashboard", {
        dashboardJson: dashboardJson(`${serviceName} reliability`, slo.name, errorMetric.name),
    });
}

export const url = service.uri;
export const name = service.name;
