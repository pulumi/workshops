import os

import uvicorn
from fastapi import FastAPI
from google.adk.cli.fast_api import get_fast_api_app
from prometheus_fastapi_instrumentator import Instrumentator

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
SESSION_SERVICE_URI = ""
ALLOWED_ORIGINS = ["http://localhost", "http://localhost:8080", "*"]
SERVE_WEB_INTERFACE = True

# `otel_to_cloud=True` wires ADK's OpenTelemetry tracer to the Google Cloud
# Trace exporter (the [otel-gcp] extra of google-adk). The GSA bound by
# Workload Identity needs roles/cloudtrace.agent so spans land in Cloud Trace.
app: FastAPI = get_fast_api_app(
    agents_dir=AGENT_DIR,
    session_service_uri=SESSION_SERVICE_URI,
    allow_origins=ALLOWED_ORIGINS,
    web=SERVE_WEB_INTERFACE,
    otel_to_cloud=True,
)

# Prometheus /metrics endpoint scraped by Managed Prometheus via the
# PodMonitoring CR in 01-gitops/. Mirrors the podinfo observability pattern
# the workshop already shows.
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
