#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
manifest="${1:-$root/provider-plugins.txt}"
archives="${2:-$root/dist/plugins}"
os="$(uname -s | tr '[:upper:]' '[:lower:]')"
arch="$(uname -m)"
case "$arch" in x86_64) arch=amd64 ;; aarch64) arch=arm64 ;; esac
while read -r name version; do
    pulumi plugin install resource "$name" "$version" --exact \
        --file "$archives/pulumi-resource-${name}-v${version}-${os}-${arch}.tar.gz"
done < "$manifest"
