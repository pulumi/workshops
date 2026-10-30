"""Pre-run preparation for the controlled Go fixture; configuration stays external."""

import hashlib
import json
import os
import subprocess
import tarfile
import time
from contextlib import contextmanager
from pathlib import Path


@contextmanager
def measured(name):
    start = time.monotonic()
    yield
    print("BENCHMARK_TIMING " + json.dumps({"phase": name, "seconds": time.monotonic() - start}), flush=True)


def command(*args):
    subprocess.run(args, check=True)


def digest(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


mode = os.environ["BENCHMARK_MODE"]
if mode not in ("source", "program", "complete", "image"):
    raise SystemExit("Unknown benchmark mode")
runtime = {"name": "go"}
if mode == "image":
    runtime["options"] = {"binary": "/opt/pulumi-program/infra"}
elif mode != "source":
    runtime["options"] = {"binary": "./benchmark-release/infra"}
with measured("configuration"):
    Path("Pulumi.yaml").write_text(json.dumps({"name": os.environ["BENCHMARK_PROJECT"], "runtime": runtime}, indent=2))
    command("pulumi", "config", "set", "environment", "benchmark", "--stack", os.environ["BENCHMARK_STACK"])

if mode in ("program", "complete"):
    prefix = os.environ["BENCHMARK_RELEASE_URI"].rstrip("/")
    archive = f"{mode}.tar.gz"
    with measured("artifact_download"):
        command("aws", "s3", "cp", f"{prefix}/{archive}", archive, "--only-show-errors")
        command("aws", "s3", "cp", f"{prefix}/{archive}.sha256", archive + ".sha256", "--only-show-errors")
    with measured("artifact_verification"):
        expected, filename = Path(archive + ".sha256").read_text().strip().split(maxsplit=1)
        if filename != archive or digest(Path(archive)) != expected:
            raise SystemExit("Artifact checksum does not match")
    with measured("artifact_extraction"):
        Path("benchmark-release").mkdir(exist_ok=True)
        with tarfile.open(archive) as bundle:
            bundle.extractall("benchmark-release", filter="data")
    if mode == "complete":
        with measured("plugin_installation"):
            command("pulumi", "plugin", "install", "resource", "random", "4.18.2", "--exact", "--file",
                    "benchmark-release/plugins/pulumi-resource-random-v4.18.2-linux-amd64.tar.gz")

if mode != "source":
    path = Path(runtime["options"]["binary"])
    actual = digest(path)
    if actual != os.environ["BENCHMARK_PROGRAM_SHA256"]:
        raise SystemExit("Program binary does not match the benchmark release")
    print("BENCHMARK_PROGRAM_SHA256 " + actual, flush=True)
