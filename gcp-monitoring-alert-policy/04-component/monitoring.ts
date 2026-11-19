import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import { dashboardJson } from "./dashboard";

export interface ServiceMonitoringArgs {
    /** Name of the Cloud Run service to watch. */
    serviceName: pulumi.Input<string>;
    /** Availability goal as a ratio, for example 0.99. */
    goal: pulumi.Input<number>;
    /** Address that receives the alert emails. */
    email: pulumi.Input<string>;
    /** Link to the runbook, shown in the alert documentation. */
    runbookUrl: pulumi.Input<string>;
    /** Rolling SLO period in days. Defaults to 7. */
    rollingPeriodDays?: pulumi.Input<number>;
    /** Burn rate that pages on the one-hour window. Defaults to 10. */
    fastBurnThreshold?: pulumi.Input<number>;
    /** Burn rate that notifies on the six-hour window. Defaults to 2. */
    slowBurnThreshold?: pulumi.Input<number>;
    /**
     * Set to true when the stack already has these resources from 03-inline.
     * The children then carry aliases to the inline names, so moving them into
     * the component updates the state instead of replacing the resources.
     */
    adoptInlineResources?: boolean;
}

/**
 * Everything Cloud Monitoring needs around a Cloud Run service: a custom
 * service with a request-based SLO, an email channel, fast and slow burn-rate
 * alert policies, a log-based error metric and a dashboard.
 */
export class ServiceMonitoring extends pulumi.ComponentResource {
    public readonly sloName: pulumi.Output<string>;
    public readonly alertPolicyIds: pulumi.Output<string>[];
    public readonly errorMetricName: pulumi.Output<string>;
    public readonly dashboardId: pulumi.Output<string>;

    constructor(name: string, args: ServiceMonitoringArgs, opts?: pulumi.ComponentResourceOptions) {
        super("gcpworkshop:index:ServiceMonitoring", name, {}, opts);

        const rollingPeriodDays = args.rollingPeriodDays ?? 7;
        const fastBurn = args.fastBurnThreshold ?? 10;
        const slowBurn = args.slowBurnThreshold ?? 2;
        const alias = (inlineName: string): pulumi.Alias[] =>
            args.adoptInlineResources ? [{ name: inlineName, parent: pulumi.rootStackResource }] : [];

        const runRequests = pulumi.interpolate`metric.type="run.googleapis.com/request_count" resource.type="cloud_run_revision" resource.labels.service_name="${args.serviceName}"`;

        const customService = new gcp.monitoring.CustomService(`${name}-custom-service`, {
            serviceId: args.serviceName,
            displayName: args.serviceName,
            userLabels: { workshop: "gcp-monitoring" },
        }, { parent: this, aliases: alias("custom-service") });

        const slo = new gcp.monitoring.Slo(`${name}-slo`, {
            service: customService.serviceId,
            sloId: "availability",
            displayName: pulumi.interpolate`${args.goal} of requests succeed over ${rollingPeriodDays} days`,
            goal: args.goal,
            rollingPeriodDays,
            requestBasedSli: {
                goodTotalRatio: {
                    totalServiceFilter: runRequests,
                    goodServiceFilter: pulumi.interpolate`${runRequests} metric.labels.response_code_class="2xx"`,
                },
            },
        }, { parent: this, aliases: alias("slo") });

        const channel = new gcp.monitoring.NotificationChannel(`${name}-email-channel`, {
            displayName: pulumi.interpolate`${args.serviceName} on-call`,
            type: "email",
            labels: { email_address: args.email },
        }, { parent: this, aliases: alias("email-channel") });

        const burnRatePolicy = (
            id: string,
            inlineName: string,
            label: string,
            lookback: string,
            threshold: pulumi.Input<number>,
        ): gcp.monitoring.AlertPolicy => {
            const displayName = pulumi.interpolate`${args.serviceName} ${label}`;
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
                    content: pulumi.interpolate`The ${args.serviceName} error budget is burning faster than ${threshold}x over ${lookback}. Runbook: ${args.runbookUrl}`,
                },
            }, { parent: this, aliases: alias(inlineName) });
        };

        const fast = burnRatePolicy(`${name}-alert-fast`, "alert-fast", "fast burn", "3600s", fastBurn);
        const slow = burnRatePolicy(`${name}-alert-slow`, "alert-slow", "slow burn", "21600s", slowBurn);

        const errorMetric = new gcp.logging.Metric(`${name}-error-metric`, {
            name: pulumi.interpolate`${args.serviceName}-errors`,
            description: pulumi.interpolate`ERROR-severity logs of ${args.serviceName}`,
            filter: pulumi.interpolate`resource.type="cloud_run_revision" AND resource.labels.service_name="${args.serviceName}" AND severity>=ERROR`,
            metricDescriptor: {
                metricKind: "DELTA",
                valueType: "INT64",
                unit: "1",
            },
        }, { parent: this, aliases: alias("error-metric") });

        const dashboard = new gcp.monitoring.Dashboard(`${name}-dashboard`, {
            dashboardJson: dashboardJson(
                pulumi.interpolate`${args.serviceName} reliability`,
                slo.name,
                errorMetric.name,
            ),
        }, { parent: this, aliases: alias("dashboard") });

        this.sloName = slo.name;
        this.alertPolicyIds = [fast.id, slow.id];
        this.errorMetricName = errorMetric.name;
        this.dashboardId = dashboard.id;

        this.registerOutputs({
            sloName: this.sloName,
            alertPolicyIds: this.alertPolicyIds,
            errorMetricName: this.errorMetricName,
            dashboardId: this.dashboardId,
        });
    }
}
