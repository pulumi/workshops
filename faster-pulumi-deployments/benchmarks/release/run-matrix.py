"""Run the November comparison: source on the default image, a prepared private image, and a release bundle.

Each approach deploys to three existing stacks (baseline, application edit, dependency update) and to three
new stacks. Deployments are serialized by benchmarks/run.py; repeating this command resumes from the manifests.
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
AWS_ENVIRONMENT = "team-ce/aws/pulumi-ce"
REVISIONS = {
    "baseline": ("239dc32154d35e30e1246d492437e23fa742c7db", "1.0.0"),
    "code": ("32ccc693f3bb3d4749be4804a6325bbe9a1e6768", "1.1.0"),
    "dependency": ("3609b0c5d3ede1b4965bde6c33a24cf052f872a1", "1.1.0"),
}
EXISTING = {
    "baseline": {"source": ("cache-population", None), "image": ("seed", None), "bundle": ("bundle-seed", None)},
    "code": {"source": ("source-cache-warm", "controlled-code-change"), "image": ("prebuilt-image", "controlled-code-change"), "bundle": ("skip-cache", "controlled-code-change")},
    "dependency": {"source": ("source-cache-miss", "controlled-dependency-change"), "image": ("prebuilt-image", "controlled-dependency-change"), "bundle": ("skip-cache", "controlled-dependency-change")},
}


def config_for(args, release, tools, label, stack):
    commit, revision = REVISIONS[label]
    return {
        "organization": args.organization,
        "project": args.project,
        "stack": stack,
        "source": {"repoUrl": "https://github.com/pulumi/workshops.git", "commit": commit,
                   "repoDir": "faster-pulumi-deployments/benchmarks/changed-program"},
        "executor_images": {
            "source": None,
            "image": {"reference": release["image"], "registry": "ecr"},
            "complete": {"reference": tools["image"], "registry": "public"},
        },
        "release_uri": release["release_uri"],
        "program_sha256": release["program_sha256"],
        "credential_environment": args.credential_environment,
        "environment_variables": {"AWS_DEFAULT_REGION": "us-west-2"},
        "ecr_region": "us-west-2",
        "prepare_script": "../prepare.py",
        "expected_revision": revision,
    }


def run(config, path, variant, cohort, samples=1):
    config_path = path.with_name(path.stem + "-config.json")
    config_path.write_text(json.dumps(config, indent=2) + "\n")
    command = ["pulumi", "env", "run", AWS_ENVIRONMENT, "--", sys.executable, str(HERE.parent / "run.py"),
               "--config", str(config_path), "--manifest", str(path), "--variants", variant, "--samples", str(samples)]
    if cohort:
        command += ["--cohort", cohort]
    subprocess.run(command, check=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--releases", type=Path, required=True, help="Directory containing release-<label>.json files")
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--organization", default="team-ce")
    parser.add_argument("--project", default="deployment-timings-20261104")
    parser.add_argument("--credential-environment", default="team-ce/aws/pulumi-ce")
    args = parser.parse_args()
    releases = {label: json.loads((args.releases / f"release-{label}.json").read_text()) for label in REVISIONS}
    tools = json.loads((args.releases / "release-tools.json").read_text())
    args.output.mkdir(parents=True, exist_ok=True)

    for label, approaches in EXISTING.items():
        for sample in (1, 2, 3):
            for approach, (variant, cohort) in approaches.items():
                stack = f"{approach}-{sample}"
                config = config_for(args, releases[label], tools, label, stack)
                run(config, args.output / f"{label}-{stack}.json", variant, cohort)

    for approach, variant in (("source", "source-new-stack"), ("image", "prebuilt-image"), ("bundle", "skip-cache")):
        config = config_for(args, releases["baseline"], tools, "baseline", "unused")
        run(config, args.output / f"new-stack-{approach}.json", variant, "controlled-new-stack", samples=3)


if __name__ == "__main__":
    main()
