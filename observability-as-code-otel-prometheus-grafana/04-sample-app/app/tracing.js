// Loaded with `node --require ./tracing.js` before index.js, so every HTTP
// call the auto-instrumentation sees is already inside a span.
// OTEL_EXPORTER_OTLP_ENDPOINT (set by the Pulumi Deployment below, from step
// 3's Collector Service) is read automatically by both exporters; no code
// here needs to know the Collector's address.
"use strict";

const { NodeSDK } = require("@opentelemetry/sdk-node");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-grpc");
const { OTLPMetricExporter } = require("@opentelemetry/exporter-metrics-otlp-grpc");
const { PeriodicExportingMetricReader } = require("@opentelemetry/sdk-node").metrics;

const sdk = new NodeSDK({
    serviceName: process.env.OTEL_SERVICE_NAME || "observability-sample-app",
    traceExporter: new OTLPTraceExporter(),
    metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter(),
        exportIntervalMillis: 5000,
    }),
    instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

process.on("SIGTERM", () => {
    sdk.shutdown().finally(() => process.exit(0));
});
