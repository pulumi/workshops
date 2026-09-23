Source for the container image `05-agent-deployment/__main__.py` deploys.
This is source only — the image is not built during `pulumi up`.

Build and push it once before the session, to a registry the workshop
subscription can pull from (which registry is an open question — see the
root README):

```
docker build -t <registry>/itops-agent:latest agent-app/
docker push <registry>/itops-agent:latest
```

Then set `itops-agent-deployment:agentImage` to that reference before
running `pulumi up` in `05-agent-deployment/`.

Never add an `AZURE_OPENAI_API_KEY`, connection string, or any other static
credential to `app.py`, `Dockerfile`, or the Kubernetes deployment spec.
Authentication is `DefaultAzureCredential` via AKS workload identity only
(see `04-workload-identity/`).
