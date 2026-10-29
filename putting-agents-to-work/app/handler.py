"""Lambda handler for feedback-api (function URL payload format 2.0).
 
    GET  /          browsers (Accept: text/html) get the feedback page;
                    everything else gets service info as JSON
    POST /          {"message": "..."} -> stores an entry, returns {"id": ...}
    GET  /?id=<id>  returns that entry as JSON
"""
 
import base64
import html
import json
import logging
import os
import pathlib
import time
import uuid
 
import boto3
 
log = logging.getLogger()
log.setLevel(logging.INFO)
 
TABLE = boto3.resource("dynamodb").Table(os.environ["TABLE_NAME"])
VERSION = os.environ.get("APP_VERSION", "unknown")
STACK = os.environ.get("STACK", "unknown")
 
# Badge colours for the page: prod is green, anything else amber.
_BADGE = ("#d7f5e3", "#14532d") if STACK == "prod" else ("#fdecc8", "#7a4b00")
_PAGE = (
    pathlib.Path(__file__).with_name("page.html").read_text(encoding="utf-8")
    .replace("__STACK__", html.escape(STACK))
    .replace("__VERSION__", html.escape(VERSION))
    .replace("__BADGE_BG__", _BADGE[0])
    .replace("__BADGE_FG__", _BADGE[1])
)
 
 
def _response(status: int, body: dict) -> dict:
    return {
        "statusCode": status,
        "headers": {"content-type": "application/json"},
        "body": json.dumps(body),
    }
 
 
def _wants_html(event: dict) -> bool:
    return "text/html" in (event.get("headers") or {}).get("accept", "")
 
 
def _body(event: dict) -> dict:
    raw = event.get("body") or "{}"
    if event.get("isBase64Encoded"):
        raw = base64.b64decode(raw).decode()
    return json.loads(raw)
 
 
def handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method", "GET")
    params = event.get("queryStringParameters") or {}
    try:
        if method == "POST":
            message = str(_body(event).get("message", "")).strip()
            if not message:
                return _response(400, {"error": "message is required"})
            item = {"id": str(uuid.uuid4()), "message": message[:500], "createdAt": int(time.time())}
            TABLE.put_item(Item=item)
            log.info("stored entry %s", item["id"])
            return _response(201, {"id": item["id"]})
 
        if method == "GET" and "id" in params:
            item = TABLE.get_item(Key={"id": params["id"]}).get("Item")
            if not item:
                return _response(404, {"error": "not found"})
            item["createdAt"] = int(item["createdAt"])
            return _response(200, item)
 
        if method == "GET" and _wants_html(event):
            return {"statusCode": 200, "headers": {"content-type": "text/html; charset=utf-8"}, "body": _PAGE}
 
        if method == "GET":
            return _response(200, {"service": "feedback-api", "stack": STACK, "version": VERSION})
 
        return _response(405, {"error": f"{method} not allowed"})
    except Exception:
        # The deployer searches the logs for ERROR after every deploy.
        log.exception("ERROR handling %s request", method)
        return _response(500, {"error": "internal error"})
 