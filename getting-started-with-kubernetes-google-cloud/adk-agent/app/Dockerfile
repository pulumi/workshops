# ADK + Vertex AI agent for the GKE workshop.
# Source taken from Google's official ADK on GKE tutorial:
# https://docs.cloud.google.com/kubernetes-engine/docs/tutorials/agentic-adk-vertex
# https://github.com/GoogleCloudPlatform/kubernetes-engine-samples/tree/main/ai-ml/adk-vertex

FROM python:3.13-alpine
WORKDIR /app

# Numeric `-u 1000` so the image declares USER as a UID, not a name.
# PSA `restricted` with `runAsNonRoot: true` requires kubelet to verify
# the user isn't root from the image config alone; a string username
# (`USER myuser`) forces every consumer to set `runAsUser` in the pod
# spec or hit CreateContainerConfigError at startup.
RUN adduser -D -u 1000 myuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    # ADK's web UI writes runtime-config.json into site-packages at
    # startup. pip install runs as root, but the container runs as
    # myuser, so that write fails (non-fatal but log noise). Hand the
    # config dir to myuser to keep startup logs clean.
    chown -R myuser:myuser \
      /usr/local/lib/python3.13/site-packages/google/adk/cli/browser/assets/config

COPY --chown=myuser:myuser . .

ENV PATH="/home/myuser/.local/bin:$PATH"
USER 1000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port $PORT"]
