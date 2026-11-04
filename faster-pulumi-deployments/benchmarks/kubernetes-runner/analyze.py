"""Summarize the customer-managed Kubernetes runner experiment.

merge: combine the per-run manifests from k8s-matrix.py into one manifest for collect.py, labeling each run with
its condition. summarize: compute median phases and ratios from the runs.csv that collect.py writes. pulls: extract
executor image pull durations from the node's Pod and event watches.
"""

import argparse
import base64
import csv
import json
import re
import statistics
from pathlib import Path

CONDITIONS = {
    "image-cold": "Image, cold node",
    "image-warm-ifnotpresent": "Image on node, IfNotPresent",
    "image-warm-always": "Image on node, Always",
    "image-new-release": "New image release, base layers on node",
    "source-nocache-dependency": "Source, dependency update, no Go cache volume",
    "source-cache-dependency": "Source, dependency update, Go cache volume",
    "source-cache-new-stack": "Source, new stack, Go cache volume",
}
PHASES = ("setup_s", "source_s", "dependency_install_s", "pre_run_s", "pulumi_operation_s")
RATIOS = (
    ("Image deployment: cold node ÷ image on node (IfNotPresent)", "Image, cold node", "Image on node, IfNotPresent", "job_s"),
    ("Image deployment: Always ÷ IfNotPresent, image on node", "Image on node, Always", "Image on node, IfNotPresent", "job_s"),
    ("Image deployment: new release ÷ image on node (IfNotPresent)", "New image release, base layers on node", "Image on node, IfNotPresent", "job_s"),
    ("Dependency update: no cache volume ÷ cache volume", "Source, dependency update, no Go cache volume", "Source, dependency update, Go cache volume", "job_s"),
    ("Dependency update: source without cache volume ÷ new image release", "Source, dependency update, no Go cache volume", "New image release, base layers on node", "job_s"),
    ("Dependency update: source with cache volume ÷ new image release", "Source, dependency update, Go cache volume", "New image release, base layers on node", "job_s"),
    ("New stack: source with cache volume ÷ new image release", "Source, new stack, Go cache volume", "New image release, base layers on node", "job_s"),
)


def condition(name):
    for prefix, label in CONDITIONS.items():
        if name.startswith(prefix + "-") or name == prefix:
            return label
    return None


def merge(args):
    runs = []
    for path in sorted(args.runs.glob("*.json")):
        if path.stem.endswith("-config"):
            continue
        label = condition(path.stem)
        for run in json.loads(path.read_text())["runs"]:
            run["include_in_comparison"] = label is not None
            run["notes"] = label or "Seed or probe"
            runs.append(run)
    args.output.write_text(json.dumps({"runs": runs}, indent=2) + "\n")
    print(f"{len(runs)} runs")


def watch_objects(path):
    text, decoder, index = path.read_text(), json.JSONDecoder(), 0
    while True:
        while index < len(text) and text[index].isspace():
            index += 1
        if index >= len(text):
            return
        item, index = decoder.raw_decode(text, index)
        yield item.get("object", item)


def go_duration(value):
    units = {"h": 3600, "m": 60, "s": 1, "ms": 0.001}
    return round(sum(float(n) * units[u] for n, u in re.findall(r"([0-9.]+)(ms|h|m|s)", value)), 3)


# The raw Pod watch contains job tokens, so only these allowlisted fields leave the host. Each Pod is matched to its
# deployment through the stack and version claims of the Deployments OIDC token it receives.
def deployment_claims(pod):
    for container in pod["spec"]["containers"]:
        for argument in container.get("command", []) + container.get("args", []):
            parts = argument.split(".")
            if len(parts) != 3:
                continue
            try:
                claims = json.loads(base64.urlsafe_b64decode(parts[1] + "=" * (-len(parts[1]) % 4)))
            except ValueError:
                continue
            if "stack" in claims and "deployment" in claims:
                return f"{claims['org']}/{claims['project']}/{claims['stack']}", str(claims["deployment"])
    return None


def pulls(args):
    deployments = {}
    for pod in watch_objects(args.pods):
        claims = deployment_claims(pod)
        if claims:
            deployments[pod["metadata"]["name"]] = claims
    runs = {(r["stack"], r["version"]): r for r in csv.DictReader(args.runs_csv.open())}
    rows, seen = [], set()
    for event in watch_objects(args.events):
        target = event["involvedObject"]
        if event.get("reason") != "Pulled" or not target.get("fieldPath", "").endswith("{pulumi-workflow}"):
            continue
        if event["metadata"]["uid"] in seen:
            continue
        seen.add(event["metadata"]["uid"])
        message = event["message"]
        duration = re.search(r" in (\S+) \(", message)
        image = re.search(r'"([^"]+)"', message)
        if "already present" in message:
            seconds, result = 0.0, "already present"
        elif duration:
            seconds, result = go_duration(duration.group(1)), "pulled"
        else:
            raise SystemExit(f"Unrecognized pull event: {message}")
        run = runs.get(deployments.get(target["name"], ("", "")), {})
        rows.append({"deployment_id": run.get("deployment_id", ""), "stack": run.get("stack", ""),
                     "condition": run.get("notes", ""), "image": image.group(1).split("/")[-1] if image else "",
                     "result": result, "pull_s": seconds})
    with (args.output / "pulls.csv").open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    for row in rows:
        print(row)


def summarize(args):
    rows = [r for r in csv.DictReader(args.runs_csv.open()) if r["include_in_comparison"] == "True"]
    groups = {}
    for row in rows:
        groups.setdefault(row["notes"], []).append(row)
    medians = {}
    for label in CONDITIONS.values():
        selected = groups.get(label, [])
        if len(selected) != 3:
            raise SystemExit(f"Expected three samples for {label}, found {len(selected)}")
        medians[label] = {m: round(statistics.median(float(r[m] or 0) for r in selected), 3) for m in ("job_s", *PHASES)}
        medians[label]["job_range_s"] = [round(min(float(r["job_s"]) for r in selected), 3),
                                         round(max(float(r["job_s"]) for r in selected), 3)]
    ratios = [{"comparison": title, "numerator": a, "denominator": b, "metric": metric,
               "ratio": round(medians[a][metric] / medians[b][metric], 2)} for title, a, b, metric in RATIOS]
    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / "ratios.json").write_text(json.dumps({"medians_s": medians, "ratios": ratios}, indent=2) + "\n")
    lines = ["| Comparison | Metric | Ratio |", "| --- | --- | ---: |"]
    lines += [f"| {r['comparison']} | {'setup' if r['metric'] == 'setup_s' else 'job'} | {r['ratio']:.2f} |" for r in ratios]
    lines += ["", "| Condition | Job | Setup | Source | Dependency installation | Pre-run | Pulumi operation |",
              "| --- | ---: | ---: | ---: | ---: | ---: | ---: |"]
    lines += [f"| {label} | " + " | ".join(f"{m[k]:.1f}" for k in ("job_s", *PHASES)) + " |" for label, m in medians.items()]
    (args.output / "ratios.md").write_text("\n".join(lines) + "\n")
    print("\n".join(lines))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    m = commands.add_parser("merge")
    m.add_argument("--runs", type=Path, required=True)
    m.add_argument("--output", type=Path, required=True)
    s = commands.add_parser("summarize")
    s.add_argument("--runs-csv", type=Path, required=True)
    s.add_argument("--output", type=Path, required=True)
    p = commands.add_parser("pulls")
    p.add_argument("--events", type=Path, required=True)
    p.add_argument("--pods", type=Path, required=True)
    p.add_argument("--runs-csv", type=Path, required=True)
    p.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    {"merge": merge, "summarize": summarize, "pulls": pulls}[args.command](args)


if __name__ == "__main__":
    main()
