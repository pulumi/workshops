#!/usr/bin/env bash
# Build and publish one fixture revision as a prepared image and a release bundle,
# timing each stage. Usage: build-release.sh <fixture-program-dir> <label> <output-dir>
#
# Required environment: BUILD_HOST, IMAGE_REPOSITORY, RELEASE_BUCKET, BASE_IMAGE.
# Optional: BUILDX_CACHE_ARGS, PLUGIN_CACHE_DIR, GO_CACHE_HIT.
set -euo pipefail

program_dir=$(cd "$1" && pwd)
label=$2
output=$(mkdir -p "$3" && cd "$3" && pwd)
here=$(cd "$(dirname "$0")" && pwd)
plugin=pulumi-resource-random-v4.18.2-linux-amd64.tar.gz
plugin_cache=${PLUGIN_CACHE_DIR:-$output/plugin-cache}
tag="${BUILD_HOST}-${label}"
release_uri="s3://${RELEASE_BUCKET}/${BUILD_HOST}/${label}"
steps="$output/steps-$label.jsonl"
: > "$steps"

timed() {
    local name=$1
    shift
    local start end
    start=$(date +%s.%N)
    "$@"
    end=$(date +%s.%N)
    python3 -c 'import json,sys; print(json.dumps({"step": sys.argv[1], "seconds": round(float(sys.argv[3]) - float(sys.argv[2]), 3)}))' \
        "$name" "$start" "$end" >> "$steps"
}

fetch_plugin() {
    mkdir -p "$plugin_cache"
    if [ ! -f "$plugin_cache/$plugin" ]; then
        curl -fsSL -o "$plugin_cache/$plugin" \
            "https://github.com/pulumi/pulumi-random/releases/download/v4.18.2/$plugin"
    fi
}

compile() {
    (cd "$program_dir" && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -o "$output/release/infra" .)
}

assemble() {
    # shellcheck disable=SC2086
    docker buildx build --platform linux/amd64 --target prepared \
        --build-arg "BASE_IMAGE=$BASE_IMAGE" ${BUILDX_CACHE_ARGS:-} \
        --load -t "$IMAGE_REPOSITORY:$tag" -f "$here/Dockerfile" "$output/release"
}

package() {
    tar -C "$output/release" -czf "$output/complete.tar.gz" infra plugins
    (cd "$output" && sha256sum complete.tar.gz > complete.tar.gz.sha256)
}

upload() {
    aws s3 cp "$output/complete.tar.gz" "$release_uri/complete.tar.gz" --only-show-errors
    aws s3 cp "$output/complete.tar.gz.sha256" "$release_uri/complete.tar.gz.sha256" --only-show-errors
}

rm -rf "$output/release"
mkdir -p "$output/release/plugins"
started=$(date -u +%Y-%m-%dT%H:%M:%SZ)

timed dependency_preparation bash -c "cd '$program_dir' && go mod download"
timed compilation compile
timed plugin_download fetch_plugin
cp "$plugin_cache/$plugin" "$output/release/plugins/$plugin"
timed image_assembly assemble
timed image_publication docker push --quiet "$IMAGE_REPOSITORY:$tag"
timed bundle_packaging package
timed bundle_publication upload

digest=$(docker image inspect --format '{{index .RepoDigests 0}}' "$IMAGE_REPOSITORY:$tag")
python3 - "$steps" "$output/release-$label.json" <<EOF
import hashlib, json, platform, subprocess, sys
steps = [json.loads(line) for line in open(sys.argv[1])]
binary = hashlib.sha256(open("$output/release/infra", "rb").read()).hexdigest()
document = {
    "label": "$label", "build_host": "$BUILD_HOST", "started": "$started",
    "steps": {s["step"]: s["seconds"] for s in steps},
    "program_sha256": binary,
    "image": "$digest", "release_uri": "$release_uri",
    "bundle_bytes": __import__("os").path.getsize("$output/complete.tar.gz"),
    "go_version": subprocess.check_output(["go", "version"], text=True).strip(),
    "go_cache_hit": "${GO_CACHE_HIT:-not-applicable}",
    "machine": platform.machine(), "cpus": __import__("os").cpu_count(),
}
json.dump(document, open(sys.argv[2], "w"), indent=2)
print(json.dumps(document, indent=2))
EOF
