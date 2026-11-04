"""Run the customer-managed Kubernetes comparison through one kind runner host.

Phases: pull-policy probes, executor image pulls (cold node, warm node with IfNotPresent and Always, and a
new release that shares base layers), and source deployments with and without a persistent Go cache volume.
Node and agent changes run over SSM before each deployment request; repeating the command resumes.
"""

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
BENCHMARKS = HERE.parent
AWS_ENVIRONMENT = "team-ce/aws/pulumi-ce"
REVISIONS = {
    "baseline": ("239dc32154d35e30e1246d492437e23fa742c7db", "1.0.0"),
    "code": ("32ccc693f3bb3d4749be4804a6325bbe9a1e6768", "1.1.0"),
    "dependency": ("3609b0c5d3ede1b4965bde6c33a24cf052f872a1", "1.1.0"),
}
NODE = "runners-control-plane"
SETUP = "export HOME=/root KUBECONFIG=/root/.kube/config; cd /opt/workshops/faster-pulumi-deployments/benchmarks/kubernetes-runner"


class Matrix:
    def __init__(self, args):
        self.args = args
        self.releases = {label: json.loads((args.releases / f"release-{label}.json").read_text()) for label in REVISIONS}
        self.log_path = args.output / "operations.json"
        self.log = json.loads(self.log_path.read_text()) if self.log_path.exists() else []

    def aws(self, *command):
        return subprocess.run(["pulumi", "env", "run", AWS_ENVIRONMENT, "--", "aws", *command],
                              check=True, capture_output=True, text=True).stdout

    def ssm(self, label, script):
        done = {entry["label"] for entry in self.log}
        if label in done:
            return
        request = {"InstanceIds": [self.args.instance], "DocumentName": "AWS-RunShellScript",
                   "Parameters": {"commands": [SETUP, script], "executionTimeout": ["900"]}}
        path = self.args.output / ".ssm-request.json"
        path.write_text(json.dumps(request))
        command_id = self.aws("ssm", "send-command", "--region", "us-west-2", "--cli-input-json", f"file://{path}",
                              "--query", "Command.CommandId", "--output", "text").strip()
        while True:
            time.sleep(3)
            try:
                result = json.loads(self.aws("ssm", "get-command-invocation", "--region", "us-west-2",
                                             "--command-id", command_id, "--instance-id", self.args.instance))
            except subprocess.CalledProcessError:
                continue
            if result["Status"] not in ("Pending", "InProgress", "Delayed"):
                break
        print(label, result["Status"], result["StandardOutputContent"][-400:], result["StandardErrorContent"][-400:], flush=True)
        if result["Status"] != "Success":
            raise SystemExit(f"SSM step {label} failed")
        self.log.append({"label": label, "finished": time.time(), "stdout": result["StandardOutputContent"][-2000:]})
        self.log_path.write_text(json.dumps(self.log, indent=2) + "\n")

    def configure(self, label, template, agent_policy, worker_policy):
        self.ssm(label, f"./configure.sh {template} {agent_policy} {worker_policy}")

    def deploy(self, name, stack, label, variant, cohort, samples=1):
        commit, revision = REVISIONS[label]
        release = self.releases[label]
        config = {
            "organization": "team-ce", "project": "deployment-timings-20261104", "stack": stack,
            "source": {"repoUrl": "https://github.com/pulumi/workshops.git", "commit": commit,
                       "repoDir": "faster-pulumi-deployments/benchmarks/changed-program"},
            "executor_images": {"source": None, "image": {"reference": release["image"], "registry": "node"}},
            "release_uri": release["release_uri"], "program_sha256": release["program_sha256"],
            "credential_environment": AWS_ENVIRONMENT,
            "environment_variables": {"AWS_DEFAULT_REGION": "us-west-2"},
            "ecr_region": "us-west-2", "prepare_script": "../prepare.py", "expected_revision": revision,
            "agent_pool_id": self.args.pool,
        }
        manifest = self.args.output / "runs" / f"{name}.json"
        manifest.parent.mkdir(parents=True, exist_ok=True)
        config_path = manifest.with_name(manifest.stem + "-config.json")
        config_path.write_text(json.dumps(config, indent=2) + "\n")
        command = [sys.executable, str(BENCHMARKS / "run.py"), "--config", str(config_path), "--manifest", str(manifest),
                   "--variants", variant, "--samples", str(samples)]
        if cohort:
            command += ["--cohort", cohort]
        subprocess.run(command, check=True)

    def prune(self, label):
        self.ssm(label, f"docker exec {NODE} crictl rmi --prune")

    def remove(self, label, reference):
        self.ssm(label, f"docker exec {NODE} crictl rmi {reference} || true")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--releases", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--instance", required=True)
    parser.add_argument("--pool", required=True)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    m = Matrix(args)
    dependency_image = m.releases["dependency"]["image"]

    # Probe 1: agent setting Always, no executor policy in the template.
    m.configure("probe-agent-always", "cache", "Always", "none")
    for i in (1, 2, 3):
        m.deploy(f"probe-agent-always-image-{i}", f"k8s-image-{i}", "baseline", "seed", None)
    # Probe 2: agent setting IfNotPresent, executor policy Always in the template.
    m.configure("probe-template-always", "cache", "IfNotPresent", "Always")
    m.deploy("probe-template-always-image-1", "k8s-image-1", "baseline", "seed", None)

    # Executor image pulls for the application edit.
    m.configure("pull-ifnotpresent", "cache", "IfNotPresent", "IfNotPresent")
    for i in (1, 2, 3):
        m.prune(f"prune-cold-{i}")
        m.deploy(f"image-cold-{i}", f"k8s-image-{i}", "code", "prebuilt-image", "controlled-code-change")
    for i in (1, 2, 3):
        m.deploy(f"image-warm-ifnotpresent-{i}", f"k8s-image-{i}", "code", "prebuilt-image", "controlled-code-change")
    m.configure("pull-always", "cache", "IfNotPresent", "Always")
    for i in (1, 2, 3):
        m.deploy(f"image-warm-always-{i}", f"k8s-image-{i}", "code", "prebuilt-image", "controlled-code-change")
    m.configure("pull-ifnotpresent-release", "cache", "IfNotPresent", "IfNotPresent")
    for i in (1, 2, 3):
        m.remove(f"remove-dependency-image-{i}", dependency_image)
        m.deploy(f"image-new-release-{i}", f"k8s-image-{i}", "dependency", "prebuilt-image", "controlled-dependency-change")

    # Source deployments of the dependency update without and with a persistent Go cache.
    m.configure("source-nocache", "nocache", "IfNotPresent", "IfNotPresent")
    for i in (1, 2, 3):
        m.deploy(f"source-nocache-seed-{i}", f"k8s-src-nocache-{i}", "baseline", "source-seed", None)
    for i in (1, 2, 3):
        m.deploy(f"source-nocache-dependency-{i}", f"k8s-src-nocache-{i}", "dependency", "source-no-cache", "controlled-dependency-change")
    m.configure("source-cache", "cache", "IfNotPresent", "IfNotPresent")
    for i in (1, 2, 3):
        m.deploy(f"source-cache-seed-{i}", f"k8s-src-cache-{i}", "baseline", "source-seed", None)
    for i in (1, 2, 3):
        m.deploy(f"source-cache-dependency-{i}", f"k8s-src-cache-{i}", "dependency", "source-no-cache", "controlled-dependency-change")
    m.deploy("source-cache-new-stack", "unused", "dependency", "source-no-cache", "controlled-new-stack", samples=3)

    m.ssm("collect-logs", "aws s3 cp /opt/k8s-logs/ s3://deployment-timings-20261104-052848974346/k8s/logs/ --recursive --only-show-errors")


if __name__ == "__main__":
    main()
