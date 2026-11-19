#!/usr/bin/env bash
# Check the tools this workshop needs before the first step. Changes nothing.
set -uo pipefail

failed=0
ok() { echo "ok      $1"; }
bad() { echo "MISSING $1"; failed=1; }

# version_ge <have> <want>: true when have >= want (dotted numbers)
version_ge() { [[ "$(printf '%s\n%s\n' "$2" "$1" | sort -V | head -n1)" == "$2" ]]; }

if command -v pulumi >/dev/null 2>&1; then
  v="$(pulumi version | sed 's/^v//')"
  if version_ge "$v" "3.261.0"; then ok "pulumi ${v} (3.272.0 is the tested version; 3.261.0+ needed for 'pulumi env setup aws')"; else bad "pulumi ${v}: need 3.261.0 or newer"; fi
else
  bad "pulumi: install from https://www.pulumi.com/docs/get-started/download-install/"
fi

if command -v node >/dev/null 2>&1; then
  v="$(node -v | sed 's/^v//')"
  if version_ge "$v" "24.0.0"; then ok "node ${v}"; else bad "node ${v}: need 24 or newer"; fi
else
  bad "node: install Node.js 24"
fi

for tool in git npm aws; do
  if command -v "$tool" >/dev/null 2>&1; then ok "$tool"; else bad "$tool"; fi
done

if backend="$(pulumi whoami -v 2>/dev/null | sed -n 's/^Backend URL: //p')" && [[ "$backend" == https://* ]]; then
  ok "logged in to Pulumi Cloud (${backend}) as $(pulumi whoami)"
else
  bad "pulumi login: run 'pulumi login' and use Pulumi Cloud, not a local file backend"
fi

if aws sts get-caller-identity >/dev/null 2>&1; then
  ok "AWS credentials work (steps 3 and 4 use them until ESC takes over in step 5)"
else
  bad "AWS credentials: sign in with the AWS CLI for the account you will use"
fi

exit "$failed"
