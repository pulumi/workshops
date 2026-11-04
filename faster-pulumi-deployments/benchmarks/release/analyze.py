"""Summarize the November comparison as ratios, combining deployment jobs with one release build per host.

Totals use three times the median job duration, so one slow sample does not dominate a three-stack total.
The raw sums remain in ratios.json.
"""

import argparse
import csv
import json
import statistics
from pathlib import Path

APPROACHES = {
    "cache-population": "source", "source-cache-warm": "source", "source-cache-miss": "source", "source-new-stack": "source",
    "seed": "image", "prebuilt-image": "image",
    "bundle-seed": "bundle", "skip-cache": "bundle",
}
CHANGES = {
    "controlled-code-change": ("Source edit to existing stacks", "code"),
    "controlled-dependency-change": ("Dependency update to existing stacks", "dependency"),
    "controlled-new-stack": ("First deployment to new stacks", "baseline"),
}
BUILD_STAGES = {
    "image": ("dependency_preparation", "compilation", "plugin_download", "image_assembly", "image_publication"),
    "bundle": ("dependency_preparation", "compilation", "plugin_download", "bundle_packaging", "bundle_publication"),
}
PHASES = ("setup_s", "source_s", "cache_restore_s", "dependency_install_s", "pre_run_s", "pulumi_operation_s", "cache_save_s")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--runs", type=Path, required=True, help="runs.csv from benchmarks/collect.py")
    parser.add_argument("--builds", type=Path, required=True, help="Directory containing gha/ and ec2/ release timings")
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    rows = [r for r in csv.DictReader(args.runs.open()) if r["include_in_comparison"] == "True"]
    builds = {host: {label: json.loads((args.builds / host / f"release-{label}.json").read_text())
                     for label in ("baseline", "code", "dependency")} for host in ("gha", "ec2")}

    groups = {}
    for row in rows:
        key = (row["cohort"], APPROACHES[row["variant"]])
        groups.setdefault(key, []).append(row)

    summary = {"changes": []}
    for cohort, (title, label) in CHANGES.items():
        entry = {"change": title, "revision": label, "approaches": {}}
        for approach in ("source", "image", "bundle"):
            selected = groups.get((cohort, approach), [])
            jobs = [float(r["job_s"]) for r in selected]
            if len(jobs) != 3:
                raise SystemExit(f"Expected three samples for {cohort}/{approach}, found {len(jobs)}")
            result = {
                "samples": len(jobs),
                "job_sum_s": round(sum(jobs), 3),
                "job_median_s": round(statistics.median(jobs), 3),
                "job_range_s": [round(min(jobs), 3), round(max(jobs), 3)],
                "phase_medians_s": {p: round(statistics.median(float(r[p] or 0) for r in selected), 3) for p in PHASES},
                "queue_median_s": round(statistics.median(float(r["queue_dispatch_s"]) for r in selected), 3),
            }
            if approach in BUILD_STAGES:
                for host in ("gha", "ec2"):
                    cost = sum(builds[host][label]["steps"][s] for s in BUILD_STAGES[approach])
                    result[f"build_{host}_s"] = round(cost, 3)
                    result[f"total_{host}_s"] = round(3 * statistics.median(jobs) + cost, 3)
            entry["approaches"][approach] = result
        source = entry["approaches"]["source"]
        for approach in ("image", "bundle"):
            other = entry["approaches"][approach]
            other["per_deployment_ratio"] = round(source["job_median_s"] / other["job_median_s"], 2)
            for host in ("gha", "ec2"):
                other[f"source_over_total_{host}"] = round(3 * source["job_median_s"] / other[f"total_{host}_s"], 2)
        summary["changes"].append(entry)

    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / "ratios.json").write_text(json.dumps(summary, indent=2) + "\n")

    lines = [
        "| Change deployed to three stacks | Approach | Source time ÷ approach time, per deployment | Including one build on GitHub Actions | Including one build on EC2 |",
        "| --- | --- | ---: | ---: | ---: |",
    ]
    for entry in summary["changes"]:
        for approach in ("image", "bundle"):
            a = entry["approaches"][approach]
            name = "Custom executor image" if approach == "image" else "Release bundle"
            lines.append(f"| {entry['change']} | {name} | {a['per_deployment_ratio']:.2f} | {a['source_over_total_gha']:.2f} | {a['source_over_total_ec2']:.2f} |")
    (args.output / "ratios.md").write_text("\n".join(lines) + "\n")
    print("\n".join(lines))


if __name__ == "__main__":
    main()
