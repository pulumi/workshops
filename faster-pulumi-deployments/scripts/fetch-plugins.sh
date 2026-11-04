#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
output="${1:-$root/dist/plugins}"
os="${TARGET_OS:-$(uname -s | tr '[:upper:]' '[:lower:]')}"
arch="${TARGET_ARCH:-$(uname -m)}"
case "$arch" in x86_64) arch=amd64 ;; aarch64) arch=arm64 ;; esac
case "$os/$arch" in linux/amd64|linux/arm64|darwin/amd64|darwin/arm64) ;; *) exit 2 ;; esac
mkdir -p "$output"
while read -r name version; do
    archive="pulumi-resource-${name}-v${version}-${os}-${arch}.tar.gz"
    curl --fail --location --retry 3 \
        "${PLUGIN_BASE_URL:-https://get.pulumi.com/releases/plugins}/$archive" \
        --output "$output/$archive"
done < "$root/provider-plugins.txt"
printf '%s/%s\n' "$os" "$arch" > "$output/platform.txt"
