#!/usr/bin/env bash
# install-plugin.sh — install the kubectl-bind plugin at the pinned version.
#
#   06-bind/install-plugin.sh   # downloads the v0.8.1 release tarball into .state/bin
#
# Verifies the SHA-256 from the release's checksums file, then puts kubectl-bind in
# .state/bin. lib.sh adds that directory to PATH, so `kubectl bind` finds it in every
# demo script. To use it in your own shell: export PATH="$PWD/.state/bin:$PATH".
# Needs curl, tar and sha256sum or shasum. Supports macOS and Linux, amd64 and arm64.
# shellcheck source=../01-stacks-and-esc/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../01-stacks-and-esc/lib.sh"
set -euo pipefail

os="$(uname -s | tr '[:upper:]' '[:lower:]')"
case "$(uname -m)" in
  x86_64|amd64) arch=amd64 ;;
  arm64|aarch64) arch=arm64 ;;
  *) die "unsupported architecture $(uname -m)" ;;
esac
case "$os" in darwin|linux) ;; *) die "unsupported OS $os" ;; esac

tarball="kubectl-bind_${KBIND_VERSION}_${os}_${arch}.tar.gz"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

say "kubectl-bind $KBIND_VERSION ($os/$arch)"
run curl -fsSL -o "$work/$tarball" "$KBIND_RELEASE_URL/$tarball"
run curl -fsSL -o "$work/checksums.txt" "$KBIND_RELEASE_URL/kube-bind_${KBIND_VERSION}_checksums.txt"

want="$(awk -v f="$tarball" '$2 == f {print $1}' "$work/checksums.txt")"
[ -n "$want" ] || die "$tarball is not listed in the checksums file"
if have sha256sum; then got="$(sha256sum "$work/$tarball" | awk '{print $1}')"; else got="$(shasum -a 256 "$work/$tarball" | awk '{print $1}')"; fi
[ "$want" = "$got" ] || die "checksum mismatch for $tarball"
note "checksum ok"

run tar -xzf "$work/$tarball" -C "$work"
bin="$(find "$work" -type f -name kubectl-bind | head -n1)"
[ -n "$bin" ] || die "kubectl-bind not found in the tarball"
mkdir -p "$STATE_DIR/bin"
cp "$bin" "$STATE_DIR/bin/kubectl-bind"
chmod +x "$STATE_DIR/bin/kubectl-bind"

say "proof"
run kubectl bind --help
