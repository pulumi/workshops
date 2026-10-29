#!/usr/bin/env python3
"""Smoke test: write a feedback entry through the function URL, read it back.
 
    pulumi env run <org>/infra-agents/read-only -- python scripts/smoke_test.py --stack dev
 
Exits 0 on success, 1 on any failure. Retries briefly, because a freshly
deployed function can take a few seconds to answer.
"""
 
from __future__ import annotations
 
import argparse
import json
import ssl
import subprocess
import sys
import time
import urllib.error
import urllib.request
import uuid
 
 
def _ssl_context() -> ssl.SSLContext:
    """Use certifi's CA bundle when available. python.org builds of Python on
    macOS ship without system certificates until "Install Certificates.command"
    has been run, which makes every HTTPS call fail verification."""
    try:
        import certifi
 
        return ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        return ssl.create_default_context()
 
 
SSL_CONTEXT = _ssl_context()
 
 
def stack_outputs(stack: str) -> dict:
    out = subprocess.run(
        ["pulumi", "stack", "output", "--stack", stack, "--json"],
        check=True, capture_output=True, text=True,
    )
    return json.loads(out.stdout)
 
 
def request(method: str, url: str, auth_type: str, body: dict | None = None) -> tuple[int, dict]:
    data = json.dumps(body).encode() if body is not None else None
    headers = {"content-type": "application/json"}
 
    if auth_type == "AWS_IAM":
        # Sign with whatever AWS credentials the ESC environment provided.
        import boto3
        from botocore.auth import SigV4Auth
        from botocore.awsrequest import AWSRequest
 
        session = boto3.Session()
        aws_req = AWSRequest(method=method, url=url, data=data, headers=headers)
        SigV4Auth(session.get_credentials(), "lambda", session.region_name).add_auth(aws_req)
        headers = dict(aws_req.headers)
 
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15, context=SSL_CONTEXT) as resp:
            return resp.status, json.loads(resp.read() or b"{}")
    except urllib.error.HTTPError as err:
        return err.code, json.loads(err.read() or b"{}")
 
 
def with_retries(fn, attempts: int = 5, delay: float = 3.0):
    for i in range(attempts):
        try:
            return fn()
        except (urllib.error.URLError, TimeoutError) as err:
            if isinstance(getattr(err, "reason", None), ssl.SSLCertVerificationError):
                raise SystemExit(
                    f"FAIL: TLS certificate verification failed ({err.reason}).\n"
                    "This is the local Python's certificate store, not the service. Fix with\n"
                    "  pip install certifi\n"
                    "or, for python.org installs on macOS, run 'Install Certificates.command'\n"
                    "in /Applications/Python 3.x/."
                ) from err
            if i == attempts - 1:
                raise
            print(f"  not reachable yet ({err}); retrying in {delay:.0f}s")
            time.sleep(delay)
 
 
def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--stack", required=True)
    args = parser.parse_args()
 
    outputs = stack_outputs(args.stack)
    url, auth_type = outputs["url"], outputs.get("auth_type", "NONE")
    marker = f"smoke-test {uuid.uuid4().hex[:8]}"
    print(f"stack={args.stack} url={url} auth={auth_type}")
 
    status, info = with_retries(lambda: request("GET", url, auth_type))
    print(f"GET /            -> {status} {info}")
    if status != 200:
        return fail("service info request failed")
 
    status, created = with_retries(lambda: request("POST", url, auth_type, {"message": marker}))
    print(f"POST /           -> {status} {created}")
    if status != 201 or "id" not in created:
        return fail("could not create an entry")
 
    status, item = request("GET", f"{url}?id={created['id']}", auth_type)
    print(f"GET /?id=<id>    -> {status} {item}")
    if status != 200 or item.get("message") != marker:
        return fail("entry did not read back correctly")
 
    print(f"PASS: wrote and read back entry {created['id']} (version {info.get('version')})")
    return 0
 
 
def fail(reason: str) -> int:
    print(f"FAIL: {reason}", file=sys.stderr)
    return 1
 
 
if __name__ == "__main__":
    sys.exit(main())