"""itops-agent: a minimal agent that calls Azure OpenAI with no static key.

Authenticates with `azure.identity.DefaultAzureCredential`, which on AKS with
workload identity enabled picks up `AZURE_CLIENT_ID`, `AZURE_TENANT_ID` and
`AZURE_FEDERATED_TOKEN_FILE` from the environment the workload identity
webhook injects into the pod (set by the ServiceAccount annotation and pod
label from `05-agent-deployment/__main__.py`) and exchanges the projected
Kubernetes service account token for an Azure AD token behind the scenes.
No API key, connection string, or other static secret is read anywhere in
this file.

Exposes:
  GET  /healthz  -> "ok", for a liveness/readiness probe
  POST /prompt   -> {"prompt": "..."} in, one real model completion out
"""

import os

from azure.identity import DefaultAzureCredential, get_bearer_token_provider
from flask import Flask, jsonify, request
from openai import AzureOpenAI

AZURE_OPENAI_ENDPOINT = os.environ["AZURE_OPENAI_ENDPOINT"]
AZURE_OPENAI_DEPLOYMENT = os.environ["AZURE_OPENAI_DEPLOYMENT"]
# Pinned API version current for the Azure OpenAI chat completions surface
# as of 2026-09-22; see the root README's Sources section.
AZURE_OPENAI_API_VERSION = "2024-10-21"

token_provider = get_bearer_token_provider(
    DefaultAzureCredential(),
    "https://cognitiveservices.azure.com/.default",
)

client = AzureOpenAI(
    azure_endpoint=AZURE_OPENAI_ENDPOINT,
    azure_ad_token_provider=token_provider,
    api_version=AZURE_OPENAI_API_VERSION,
)

app = Flask(__name__)


@app.get("/healthz")
def healthz():
    return "ok"


@app.post("/prompt")
def prompt():
    body = request.get_json(force=True)
    user_prompt = body.get("prompt", "Say hello from an AKS-hosted agent.")
    response = client.chat.completions.create(
        model=AZURE_OPENAI_DEPLOYMENT,
        messages=[{"role": "user", "content": user_prompt}],
    )
    return jsonify({"response": response.choices[0].message.content})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
