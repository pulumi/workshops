import * as pulumi from "@pulumi/pulumi";

// Step 5: the dashboard is plain JSON. The two tiles are the SLO burn rate
// (one-hour window) and the count of application errors from the log metric.
export function dashboardJson(
    displayName: pulumi.Input<string>,
    sloName: pulumi.Input<string>,
    errorMetricName: pulumi.Input<string>,
): pulumi.Output<string> {
    return pulumi.jsonStringify({
        displayName,
        mosaicLayout: {
            columns: 12,
            tiles: [
                {
                    xPos: 0, yPos: 0, width: 6, height: 4,
                    widget: {
                        title: "SLO burn rate (1 hour window)",
                        xyChart: {
                            dataSets: [{
                                plotType: "LINE",
                                timeSeriesQuery: {
                                    timeSeriesFilter: {
                                        filter: pulumi.interpolate`select_slo_burn_rate("${sloName}", "3600s")`,
                                    },
                                },
                            }],
                        },
                    },
                },
                {
                    xPos: 6, yPos: 0, width: 6, height: 4,
                    widget: {
                        title: "Application errors (ERROR logs)",
                        xyChart: {
                            dataSets: [{
                                plotType: "LINE",
                                timeSeriesQuery: {
                                    timeSeriesFilter: {
                                        filter: pulumi.interpolate`metric.type="logging.googleapis.com/user/${errorMetricName}" resource.type="cloud_run_revision"`,
                                        aggregation: {
                                            alignmentPeriod: "60s",
                                            perSeriesAligner: "ALIGN_SUM",
                                        },
                                    },
                                },
                            }],
                        },
                    },
                },
            ],
        },
    });
}
