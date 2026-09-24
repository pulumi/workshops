"""Uploads a real IT-ops runbook into the container step 3 created.

Not a Pulumi program - a plain data-plane script, run once after `pulumi up`
in this folder, using the same `az login` credential as everything else in
this workshop (no storage key involved: the upload uses the *presenter's*
AAD identity via Azure RBAC on the storage account, e.g. "Storage Blob Data
Contributor", separately from the project's read-only "Storage Blob Data
Reader" grant in __main__.py).

Usage:
    python upload_runbook.py
"""

import sys

from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient

STORAGE_ACCOUNT_NAME = "itopsagentrunbooks"
CONTAINER_NAME = "runbooks"
BLOB_NAME = "restart-web-tier.md"

RUNBOOK_CONTENT = """# Runbook: web tier is returning 5xx errors

## Symptom
The `web-frontend` service returns HTTP 502/503 for more than 2 minutes.

## First checks
1. Confirm the AKS deployment's pod count matches its replica target:
   `kubectl get deployment web-frontend -n prod`.
2. Check for recent restarts: `kubectl get pods -n prod -l app=web-frontend`.

## Fix
1. If pods are `CrashLoopBackOff`, roll back the last deployment:
   `kubectl rollout undo deployment/web-frontend -n prod`.
2. If pods are healthy but the service still 5xxs, restart the deployment:
   `kubectl rollout restart deployment/web-frontend -n prod`.
3. Escalate to the on-call platform engineer if the error persists after
   step 2 for more than 5 minutes.

## Owner
Platform engineering on-call rotation.
"""


def main() -> None:
    credential = DefaultAzureCredential()
    account_url = f"https://{STORAGE_ACCOUNT_NAME}.blob.core.windows.net"
    client = BlobServiceClient(account_url=account_url, credential=credential)
    container_client = client.get_container_client(CONTAINER_NAME)
    container_client.upload_blob(
        name=BLOB_NAME, data=RUNBOOK_CONTENT.encode("utf-8"), overwrite=True
    )
    print(f"Uploaded {BLOB_NAME} to {STORAGE_ACCOUNT_NAME}/{CONTAINER_NAME}")


if __name__ == "__main__":
    sys.exit(main() or 0)
