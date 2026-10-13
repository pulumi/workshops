#!/usr/bin/env bash
# generate.sh — presenter pre-step: create a local Notation test key pair
#
#   00-signing-key/generate.sh            # generate the key pair and trust policy
#   00-signing-key/generate.sh --clean    # remove them (see 08-teardown/ for the full teardown)
#
# Run this once, before 01-platform/'s `pulumi up`: the Kyverno ClusterPolicy
# that policy provisions embeds the certificate this script produces, so the
# certificate has to exist first. Re-running without --clean is safe; it
# leaves an existing key in place rather than rotating it.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../lib.sh
. "$DIR/../lib.sh"

IDENTITY="${SIGNING_IDENTITY:-supply-chain-signing.demo}"
OUT_DIR="$DIR/.notation"
CERT_PATH="$OUT_DIR/${IDENTITY}.crt"
TRUSTPOLICY_PATH="$OUT_DIR/trustpolicy.json"

if [[ "${1:-}" == "--clean" ]]; then
  say "Removing local Notation key material for ${IDENTITY}"
  notation key delete "${IDENTITY}" --yes 2>/dev/null || note "no notation key named ${IDENTITY} to delete (already gone)"
  rm -rf "$OUT_DIR"
  note "removed ${OUT_DIR}"
  exit 0
fi

have notation || die "notation CLI not found (expected v${NOTATION_VERSION})"

mkdir -p "$OUT_DIR"

say "Generating a local Notation test key pair for ${IDENTITY}"
notation cert generate-test --default "${IDENTITY}"

say "Exporting the self-signed certificate to ${CERT_PATH}"
# `notation cert generate-test` writes into notation's own config directory
# (~/.config/notation/localkeys and ~/.config/notation/truststore); this
# copies the public certificate into the workshop folder so 01-platform/ can
# read it as plain Pulumi config, and so 03-sign-and-push/ and this script
# agree on one path.
NOTATION_CONFIG_DIR="${NOTATION_CONFIG_DIR:-$HOME/.config/notation}"
SRC_CERT="$NOTATION_CONFIG_DIR/truststore/x509/ca/${IDENTITY}/${IDENTITY}.crt"
[[ -f "$SRC_CERT" ]] || die "expected certificate not found at $SRC_CERT — check notation's config dir"
cp "$SRC_CERT" "$CERT_PATH"

say "Writing a trust policy that trusts ${IDENTITY} for this registry"
cat > "$TRUSTPOLICY_PATH" <<EOF
{
  "version": "1.0",
  "trustPolicies": [
    {
      "name": "${IDENTITY}",
      "registryScopes": ["*"],
      "signatureVerification": { "level": "strict" },
      "trustStores": ["ca:${IDENTITY}"],
      "trustedIdentities": ["*"]
    }
  ]
}
EOF
notation policy import "$TRUSTPOLICY_PATH"

note "certificate ready at $CERT_PATH"
note "point 01-platform/ at it: pulumi config set signing:certPath $(realpath --relative-to="$DIR/../01-platform" "$CERT_PATH" 2>/dev/null || echo "$CERT_PATH")"
note "this is a local, self-signed test key. Do not reuse it outside this workshop."
