"""Run a serialized, resumable Go preparation comparison in an existing test stack."""

import argparse
import hashlib
import json
import os
import shlex
import subprocess
import time
from pathlib import Path

if __package__:
    from .collect import request, stack_path
else:
    from collect import request, stack_path

VARIANTS = {
    "seed": ("image", False, True),
    "source-no-cache": ("source", False, False),
    "cache-population": ("source", True, False),
    "source-cache-warm": ("source", True, False),
    "program-artifact": ("program", True, False),
    "complete-artifact": ("complete", True, False),
    "skip-install": ("complete", True, True),
    "skip-cache": ("complete", False, True),
    "prebuilt-image": ("image", False, True),
}
ORDER = tuple(VARIANTS)


def save(path, document):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(document, indent=2) + "\n")
    temporary.replace(path)


def logs(api_url, base, deployment_id, index):
    response = request(api_url, f"{base}/{deployment_id}/logs?job=0&step={index}&count=499")
    return "\n".join(entry.get("line", "") for entry in response.get("lines", []))


def inspect(api_url, base, deployment, run):
    steps = deployment["jobs"][0]["steps"]
    observation = "disabled"
    custom = {}
    for index, step in enumerate(steps):
        if step["name"] == "Restore cache":
            text = logs(api_url, base, deployment["id"], index)
            if "Cache restored successfully" in text:
                observation = "hit"
            elif "No cache to restore" in text:
                observation = "miss"
            else:
                observation = "unknown"
        elif step["name"].startswith("Pre-run command"):
            text = logs(api_url, base, deployment["id"], index)
            for line in text.splitlines():
                if line.startswith("BENCHMARK_TIMING "):
                    event = json.loads(line.removeprefix("BENCHMARK_TIMING "))
                    name, seconds = event["phase"], event["seconds"]
                    if name not in ("configuration", "artifact_download", "artifact_verification", "artifact_extraction", "plugin_installation") or not isinstance(seconds, (int, float)) or seconds < 0:
                        raise ValueError("Invalid pre-run timing event")
                    custom[name] = custom.get(name, 0) + seconds
    updates = request(api_url, base + "/" + deployment["id"] + "/updates")
    applied = [u["info"] for u in updates if u.get("info", {}).get("kind") == "update"]
    if len(applied) != 1 or applied[0].get("result") != "succeeded":
        raise ValueError("Expected one successful update")
    changes = applied[0].get("resourceChanges", {})
    no_change = changes.get("same", 0) >= 2 and all(v == 0 for k, v in changes.items() if k != "same")
    run["cache_observation"] = observation
    run["resource_result"] = "no-change" if no_change else json.dumps(changes, sort_keys=True)
    run["pre_run_measurements_s"] = custom
    if run["cohort"] == "controlled-no-change" and not no_change:
        raise ValueError(f"Expected a no-change update, got {changes}")
    if run["cohort"] == "controlled-new-stack" and not (
        changes.get("create") == 2
        and all(v == 0 for k, v in changes.items() if k != "create")
    ):
        raise ValueError(f"Expected a new-stack deployment with two creates, got {changes}")
    expected = run["cache_expectation"]
    if expected in ("hit", "miss") and observation != expected:
        raise ValueError(f"Expected cache {expected}, got {observation}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=Path, required=True)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--variants", nargs="+", choices=ORDER, default=list(ORDER))
    parser.add_argument("--samples", type=int, default=3)
    parser.add_argument("--timeout", type=int, default=1200)
    parser.add_argument("--cohort", choices=("controlled-no-change", "controlled-new-stack"), default="controlled-no-change")
    args = parser.parse_args()
    config = json.loads(args.config.read_text())
    api_url = config.get("api_url", "https://api.pulumi.com")
    project = config["project"]
    if not project.startswith("deployment-timings-"):
        parser.error("Use a dedicated project named deployment-timings-<run-id>")
    if args.samples < 1:
        parser.error("samples must be positive")
    password = subprocess.check_output(["aws", "ecr", "get-login-password", "--region", config["ecr_region"]], text=True).strip()
    document = json.loads(args.manifest.read_text()) if args.manifest.exists() else {"runs": []}
    fingerprint = hashlib.sha256(json.dumps(config, sort_keys=True).encode()).hexdigest()
    if document.get("config_fingerprint", fingerprint) != fingerprint:
        parser.error("Configuration changed; use a new manifest for a new experiment")
    document["config_fingerprint"] = fingerprint
    document["metadata"] = {
        "source": config["source"], "platform": "linux/amd64",
        "program_sha256": config["program_sha256"],
        "tools_image": config["tools_image"].split("/")[-1],
        "prepared_image": config["prepared_image"].split("/")[-1],
        "image_cache": "Not force-controlled; setup time includes runner and image preparation.",
    }
    for variant in args.variants:
        mode, cached, skip_install = VARIANTS[variant]
        count = 1 if variant in ("seed", "cache-population") else args.samples
        for sample in range(1, count + 1):
            cohort = "warmup" if variant in ("seed", "cache-population") else args.cohort
            stack_name = config["stack"] if args.cohort == "controlled-no-change" else f"{variant}-{sample}"
            stack = f"{config['organization']}/{project}/{stack_name}"
            base = stack_path(stack)
            previous = [r for r in document["runs"] if r["stack"] == stack and r["variant"] == variant and r["sample"] == sample]
            if previous and previous[-1].get("validated"):
                continue
            image = config["prepared_image"] if mode == "image" else config["tools_image"]
            expected = "miss" if variant == "cache-population" else ("hit" if cached else "disabled")
            if previous:
                run = previous[-1]
            else:
                variables = {
                    "BENCHMARK_MODE": mode,
                    "BENCHMARK_PROJECT": project,
                    "BENCHMARK_STACK": stack,
                    "BENCHMARK_RELEASE_URI": config["release_uri"],
                    "BENCHMARK_PROGRAM_SHA256": config["program_sha256"],
                }
                prepare = f"pulumi env run {shlex.quote(config['credential_environment'])} -- python3 ../../benchmarks/prepare.py"
                body = {
                    "operation": "update", "inheritSettings": False,
                    "cacheOptions": {"enable": cached},
                    "sourceContext": {"git": config["source"]},
                    "executorContext": {"executorImage": {"reference": image, "credentials": {"username": "AWS", "password": {"secret": password}}}},
                    "operationContext": {
                        "options": {"skipInstallDependencies": skip_install},
                        "environmentVariables": {key: {"plaintext": value} for key, value in variables.items()},
                        "preRunCommands": [prepare],
                    },
                }
                created = request(api_url, base, "POST", body)
                run = {
                    "stack": stack, "deployment_id": created["id"], "variant": variant,
                    "cohort": cohort, "sample": sample, "cache_expectation": expected,
                    "include_in_comparison": False,
                    "source_commit": config["source"]["commit"],
                    "executor_image": image.split("/")[-1],
                    "notes": "Serialized requests; image-layer cache not force-controlled. Setup includes runner and image preparation.",
                }
                document["runs"].append(run)
                save(args.manifest, document)
            print(variant, sample, run["deployment_id"], flush=True)
            deadline = time.monotonic() + args.timeout
            while True:
                deployment = request(api_url, base + "/" + run["deployment_id"])
                if deployment["status"] in ("succeeded", "failed", "skipped", "canceled", "cancelled"):
                    break
                if time.monotonic() > deadline:
                    raise SystemExit("Timed out; resume with the same manifest to poll the existing deployment")
                time.sleep(5)
            run["status"] = deployment["status"]
            save(args.manifest, document)
            if deployment["status"] != "succeeded":
                raise SystemExit(f"Deployment {run['deployment_id']} {deployment['status']}; no automatic retry")
            try:
                inspect(api_url, base, deployment, run)
            except ValueError as error:
                save(args.manifest, document)
                raise SystemExit(str(error)) from None
            run["validated"] = True
            run["include_in_comparison"] = cohort != "warmup"
            save(args.manifest, document)
            print("validated", variant, sample, run["cache_observation"], run["resource_result"], flush=True)


if __name__ == "__main__":
    main()
