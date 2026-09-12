#!/usr/bin/env bash
# guard-test.sh — exercises guard.sh with fake tools in a temp HOME. No sandbox,
# no network, no real pulumi/aws/terraform needed. Exit 0 = all cases pass.
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
share="$here/../files/home/.local/share/neo-sandbox"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
export HOME="$tmp/home"
mkdir -p "$HOME/.local/share/neo-sandbox" "$HOME/.local/bin" "$tmp/real"
for f in guard.sh destructive.patterns install-shims.sh neo-sandbox.sh; do
  cat "$share/$f" > "$HOME/.local/share/neo-sandbox/$f"   # cat, not cp: cp can return zeroed bytes on some virtiofs mounts
done

# Fake real tools that echo what they were called with.
for t in pulumi aws terraform tofu; do
  printf '#!/usr/bin/env bash\necho "REAL %s $*"\n' "$t" > "$tmp/real/$t"
  chmod +x "$tmp/real/$t"
done
export PATH="$HOME/.local/bin:$tmp/real:$PATH"

bash "$HOME/.local/share/neo-sandbox/install-shims.sh" >/dev/null
pass=0; fail=0
expect_block() {  # expect_block <tool> <args…>
  local t="$1"; shift
  if out="$("$t" "$@" 2>&1)"; then
    echo "FAIL (ran):     $t $*"; fail=$((fail+1))
  elif printf '%s' "$out" | grep -q 'guard: blocked'; then
    echo "ok   (blocked): $t $*"; pass=$((pass+1))
  else
    echo "FAIL (other):   $t $* -> $out"; fail=$((fail+1))
  fi
}
expect_pass() {   # expect_pass <tool> <args…>
  local t="$1"; shift
  if out="$("$t" "$@" 2>&1)" && printf '%s' "$out" | grep -q "^REAL $t"; then
    echo "ok   (ran):     $t $*"; pass=$((pass+1))
  else
    echo "FAIL (blocked): $t $* -> $out"; fail=$((fail+1))
  fi
}

expect_block pulumi destroy
expect_block pulumi destroy --yes -s dev
expect_block pulumi stack rm dev --yes
expect_block pulumi state delete 'urn:pulumi:dev::x::aws:s3/bucket:Bucket::b'
expect_block pulumi state unprotect --all
expect_block pulumi env rm myorg/proj/env
expect_block pulumi up --target-replace 'urn:…'
expect_block aws s3 rb s3://neo-workshop-bucket --force
expect_block aws --profile demo s3api delete-bucket --bucket b
expect_block aws ec2 terminate-instances --instance-ids i-1
expect_block terraform destroy -auto-approve
expect_block terraform apply -destroy
expect_block tofu state rm aws_s3_bucket.b
expect_block tofu workspace delete prod

expect_pass pulumi preview
expect_pass pulumi up --yes
expect_pass pulumi neo --approval-mode manual "what's in this stack"
expect_pass pulumi stack ls
expect_pass pulumi env open myorg/proj/env
expect_pass pulumi whoami -v
expect_pass aws s3 ls
expect_pass aws s3api get-bucket-versioning --bucket b
expect_pass aws sts get-caller-identity
expect_pass terraform plan
expect_pass tofu init

# log + allow-file behaviour
if grep -q 'BLOCKED pulumi destroy' "$HOME/.local/state/neo-sandbox/guard.log"; then
  echo "ok   (logged)"; pass=$((pass+1))
else
  echo "FAIL (no log)"; fail=$((fail+1))
fi
mkdir -p "$HOME/.config/neo-sandbox" && touch "$HOME/.config/neo-sandbox/allow-destructive"
expect_pass pulumi destroy --yes
rm -f "$HOME/.config/neo-sandbox/allow-destructive"
expect_block pulumi destroy --yes

# entrypoint: quiet mode execs pulumi neo with the modes from the environment
out="$(cd "$tmp" && NEO_SANDBOX_QUIET=1 NEO_SANDBOX_APPROVAL_MODE=balanced NEO_SANDBOX_PERMISSION_MODE=read-only bash "$HOME/.local/share/neo-sandbox/neo-sandbox.sh" "hello" 2>&1)"
if [ "$out" = "REAL pulumi neo --approval-mode balanced --permission-mode read-only hello" ]; then
  echo "ok   (entrypoint modes + extra args)"; pass=$((pass+1))
else
  echo "FAIL (entrypoint): $out"; fail=$((fail+1))
fi
# entrypoint: finds the project one level under the workspace
mkdir -p "$tmp/ws/02-app" "$HOME/.config/neo-sandbox" && touch "$tmp/ws/02-app/Pulumi.yaml" && printf '%s' "$tmp/ws" > "$HOME/.config/neo-sandbox/workspace"
# shellcheck disable=SC2016 # the fake tool expands $1/$* itself
printf '#!/usr/bin/env bash\nif [ "$1" = neo ]; then pwd; else echo "REAL pulumi $*"; fi\n' > "$tmp/real/pulumi"
out="$(cd "$tmp" && NEO_SANDBOX_QUIET=1 bash "$HOME/.local/share/neo-sandbox/neo-sandbox.sh" 2>&1)"
if [ "$out" = "$tmp/ws/02-app" ]; then echo "ok   (entrypoint project discovery)"; pass=$((pass+1)); else echo "FAIL (discovery): $out"; fail=$((fail+1)); fi

echo "passed=$pass failed=$fail"
[ "$fail" -eq 0 ]
