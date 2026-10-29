"""Export one-job Pulumi Deployments timings without exporting credentials or configuration."""

import argparse
import csv
import json
import os
import statistics
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

PHASES = (
    "setup_s", "executor_download_s", "source_s", "cache_restore_s",
    "dependency_install_s", "pre_run_s", "pulumi_operation_s", "cache_save_s",
    "other_steps_s",
)
METRICS = ("queue_dispatch_s", *PHASES, "between_steps_s", "job_s", "total_elapsed_s")
PRE_RUN_PHASES = ("configuration", "artifact_download", "artifact_verification", "artifact_extraction", "plugin_installation")
LABELS = ("variant", "cohort", "cache_expectation", "cache_observation", "resource_result", "sample", "notes", "source_commit", "executor_image")


def timestamp(value):
    if not value:
        return None
    result = datetime.fromisoformat(value.replace("Z", "+00:00"))
    return result if result.tzinfo else result.replace(tzinfo=timezone.utc)


def elapsed(start, end):
    if start is None or end is None:
        return None
    value = (end - start).total_seconds()
    if value < 0:
        raise ValueError("End timestamp precedes start timestamp")
    return value


def phase(name):
    names = {
        "Setup": "setup_s",
        "Download deployment executor": "executor_download_s",
        "Get source": "source_s",
        "Restore cache": "cache_restore_s",
        "Download dependencies": "dependency_install_s",
        "Save cache": "cache_save_s",
    }
    if name.startswith("Pre-run command"):
        return "pre_run_s"
    if name.startswith("pulumi "):
        return "pulumi_operation_s"
    return names.get(name, "other_steps_s")


def extract_record(stack, deployment, annotation=None):
    annotation = annotation or {}
    record = {key: annotation.get(key, "") for key in LABELS}
    record.update({
        "stack": stack,
        "deployment_id": deployment["id"],
        "version": deployment.get("version"),
        "status": deployment["status"],
        "requested_at": deployment.get("created"),
        "started_at": None,
        "finished_at": None,
        "include_in_comparison": bool(annotation.get("include_in_comparison", False)),
        "quality": "complete",
    })
    jobs = deployment.get("jobs") or []
    raw = {key: record[key] for key in ("stack", "deployment_id", "version", "status", "requested_at")}
    raw["jobs"] = []
    if len(jobs) > 1:
        raise ValueError("This collector supports one-job deployments, not parallel job graphs")
    if not jobs:
        record.update({key: None for key in METRICS})
        record["quality"] = "no_execution"
        record["include_in_comparison"] = False
        return record, raw

    job = jobs[0]
    start, finish = timestamp(job.get("started")), timestamp(job.get("lastUpdated"))
    record["started_at"] = job.get("started")
    record["finished_at"] = job.get("lastUpdated")
    record["queue_dispatch_s"] = elapsed(timestamp(deployment.get("created")), start)
    record["job_s"] = elapsed(start, finish)
    record["total_elapsed_s"] = elapsed(timestamp(deployment.get("created")), finish)
    record.update({key: 0.0 for key in PHASES})
    raw_job = {key: job.get(key) for key in ("status", "started", "lastUpdated")}
    raw_job["steps"] = []
    intervals = []
    for step in job.get("steps", []):
        raw_job["steps"].append({key: step.get(key) for key in ("name", "status", "started", "lastUpdated")})
        if step.get("status") in ("not-started", "skipped") and not step.get("started"):
            continue
        step_start, step_end = timestamp(step.get("started")), timestamp(step.get("lastUpdated"))
        duration = elapsed(step_start, step_end)
        if duration is None or step.get("status") not in ("succeeded", "failed", "canceled", "cancelled"):
            record["quality"] = "incomplete_steps"
            continue
        record[phase(step.get("name", ""))] += duration
        intervals.append((step_start, step_end))
    raw["jobs"].append(raw_job)
    intervals.sort()
    for previous, current in zip(intervals, intervals[1:]):
        if current[0] < previous[1]:
            raise ValueError("Overlapping steps cannot be added as an elapsed-time breakdown")
    if start and finish and any(a < start or b > finish for a, b in intervals):
        raise ValueError("Step timestamp falls outside the job interval")
    total_steps = sum(record[key] for key in PHASES)
    record["between_steps_s"] = None if record["job_s"] is None else record["job_s"] - total_steps
    if deployment["status"] != "succeeded" or record["quality"] != "complete":
        record["include_in_comparison"] = False
    return record, raw


def request(api_url, path, method="GET", body=None):
    token = os.environ.get("PULUMI_ACCESS_TOKEN")
    if not token:
        raise SystemExit("Set PULUMI_ACCESS_TOKEN in the process environment")
    req = urllib.request.Request(api_url.rstrip("/") + path, method=method,
                                 data=None if body is None else json.dumps(body).encode(), headers={
        "Authorization": "token " + token,
        "Accept": "application/vnd.pulumi+8",
        "Content-Type": "application/json",
    })
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            data = response.read()
            return json.loads(data) if data else {}
    except urllib.error.HTTPError as error:
        raise SystemExit(f"Pulumi API returned HTTP {error.code} for {path}") from None


def stack_path(stack):
    parts = stack.split("/")
    if len(parts) != 3 or not all(parts):
        raise ValueError("Use a fully qualified organization/project/stack name")
    return "/api/stacks/" + "/".join(urllib.parse.quote(p, safe="") for p in parts) + "/deployments"


def discover(api_url, stack):
    result = []
    page = 1
    while True:
        response = request(api_url, stack_path(stack) + f"?page={page}&pageSize=100&asc=true")
        entries = response.get("deployments", [])
        result.extend({"stack": stack, "deployment_id": item["id"]} for item in entries)
        if not entries or len(result) >= response.get("total", len(result)):
            return result
        page += 1


def summaries(records):
    groups = defaultdict(list)
    for record in records:
        if record["include_in_comparison"]:
            groups[(record["cohort"], record["variant"])].append(record)
    result = []
    for (cohort, variant), runs in sorted(groups.items()):
        for metric in METRICS:
            values = [r[metric] for r in runs if r[metric] is not None]
            if values:
                result.append({
                    "cohort": cohort, "variant": variant, "metric": metric, "n": len(values),
                    "median_s": round(statistics.median(values), 3),
                    "minimum_s": round(min(values), 3), "maximum_s": round(max(values), 3),
                })
    return result


def write_csv(path, rows, fields):
    with path.open("w", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=fields, lineterminator="\n")
        writer.writeheader()
        for row in rows:
            writer.writerow({key: round(value, 3) if isinstance(value, float) else value for key, value in row.items()})


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stack", action="append", default=[])
    parser.add_argument("--manifest", type=Path)
    parser.add_argument("--input", type=Path, help="Recalculate exports from a saved deployments.json without API access")
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--api-url", default="https://api.pulumi.com")
    args = parser.parse_args()
    manifest = json.loads(args.manifest.read_text()) if args.manifest else {}
    runs = list(manifest.get("runs", []))
    snapshots = {}
    if args.input:
        if args.stack:
            parser.error("Do not combine --input and --stack")
        for item in json.loads(args.input.read_text()):
            key = (item["stack"], item["deployment_id"])
            snapshots[key] = {"id": item["deployment_id"], "version": item["version"], "status": item["status"],
                              "created": item["requested_at"], "jobs": item["jobs"]}
        if not runs:
            runs = [{"stack": stack, "deployment_id": deployment_id} for stack, deployment_id in snapshots]
    for stack in args.stack:
        runs.extend(discover(args.api_url, stack))
    if not runs:
        parser.error("Provide --stack or a manifest containing runs")
    records, raw, pre_run, seen = [], [], [], set()
    annotations = manifest.get("annotations", {})
    for run in runs:
        key = (run["stack"], run["deployment_id"])
        if key in seen:
            continue
        seen.add(key)
        deployment = snapshots[key] if args.input else request(args.api_url, stack_path(run["stack"]) + "/" + urllib.parse.quote(run["deployment_id"], safe=""))
        annotation = {**manifest.get("defaults", {}), **annotations.get(f"{run['stack']}#{deployment.get('version')}", {}), **run}
        record, evidence = extract_record(run["stack"], deployment, annotation)
        records.append(record)
        raw.append(evidence)
        for name, seconds in annotation.get("pre_run_measurements_s", {}).items():
            if name not in PRE_RUN_PHASES or not isinstance(seconds, (int, float)) or seconds < 0:
                raise ValueError("Invalid pre-run measurement")
            pre_run.append({"variant": record["variant"], "cohort": record["cohort"], "stack": record["stack"],
                            "deployment_id": record["deployment_id"], "phase": name, "seconds": seconds})
        print(record["stack"], record["version"], record["status"], record["total_elapsed_s"])
    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / "deployments.json").write_text(json.dumps(raw, indent=2) + "\n")
    write_csv(args.output / "runs.csv", records, list(records[0]))
    write_csv(args.output / "summary.csv", summaries(records), ["cohort", "variant", "metric", "n", "median_s", "minimum_s", "maximum_s"])
    write_csv(args.output / "pre-run.csv", pre_run, ["variant", "cohort", "stack", "deployment_id", "phase", "seconds"])


if __name__ == "__main__":
    main()
