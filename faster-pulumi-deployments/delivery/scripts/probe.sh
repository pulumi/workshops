#!/usr/bin/env bash
# Reports what a Delivery job runtime provides, compiles the Go program when a
# Go toolchain is available, and writes the results as job outputs.
set -uo pipefail

section() { printf '\n== %s ==\n' "$1"; }
has() { command -v "$1" >/dev/null 2>&1; }

section "platform"
uname -a
cat /etc/os-release 2>/dev/null | grep -E '^(PRETTY_NAME|ID)=' || true
echo "user: $(id -un 2>/dev/null) uid=$(id -u)"
echo "pwd: $(pwd)"
echo "home: ${HOME:-unset}"
nproc 2>/dev/null | sed 's/^/cpus: /'
df -h . 2>/dev/null | tail -1 | sed 's/^/disk: /'

section "delivery environment"
env | grep -E '^DELIVERY_' | grep -v -E '_URL=|TOKEN' | sort
echo "credential variables present:"
env | cut -d= -f1 | grep -E '^(AWS_|PULUMI_|GITHUB_|ARM_|GOOGLE_)' | sort | sed 's/^/  /'

section "tools"
tools=(bash sh git curl tar gzip python3 node npm go dotnet java aws docker buildah pulumi esc jq)
found=()
for t in "${tools[@]}"; do
    if has "$t"; then
        found+=("$t")
        printf '%-8s %s\n' "$t" "$(command -v "$t")"
    else
        printf '%-8s missing\n' "$t"
    fi
done
has pulumi && pulumi version
has go && go version && go env GOMODCACHE GOCACHE
has node && node --version

section "caches"
for d in "${HOME:-/root}/.pulumi/plugins" "$(has go && go env GOMODCACHE)" "$(has go && go env GOCACHE)" "${HOME:-/root}/.npm"; do
    [ -n "$d" ] || continue
    if [ -d "$d" ]; then
        echo "$d: $(du -sh "$d" 2>/dev/null | cut -f1)"
    else
        echo "$d: absent"
    fi
done

section "build"
digest=none
build_seconds=0
if has go; then
    start=$(date +%s)
    mkdir -p dist/delivery
    if (cd programs/go && CGO_ENABLED=0 go build -buildvcs=false -trimpath -o ../../dist/delivery/infra .); then
        build_seconds=$(( $(date +%s) - start ))
        digest="sha256:$(sha256sum dist/delivery/infra | cut -d' ' -f1)"
        echo "built in ${build_seconds}s: $digest"
    else
        echo "go build failed"
    fi
else
    echo "no Go toolchain; skipping the build"
fi

section "outputs"
tool_list=$(IFS=,; echo "${found[*]}")
secret_output=""
if [ "${PUBLISH_SECRET:-}" = "true" ]; then
    secret_output=',
    "probeSecret": {"value": "not-a-real-secret", "secret": true}'
fi
cat > "${DELIVERY_OUTPUTS:-/dev/stdout}" <<EOF
{
    "programDigest": "$digest",
    "buildSeconds": $build_seconds,
    "tools": "$tool_list",
    "commit": "${DELIVERY_COMMIT:-unknown}",
    "release": "${DELIVERY_RELEASE:-unknown}"$secret_output
}
EOF
echo "wrote ${DELIVERY_OUTPUTS:-stdout}"
