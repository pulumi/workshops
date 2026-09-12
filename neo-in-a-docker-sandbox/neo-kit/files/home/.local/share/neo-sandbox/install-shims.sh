#!/usr/bin/env bash
# install-shims.sh — (re)install the neo-sandbox guard shims. Idempotent; runs at
# sandbox create (setup.install) and on every start (setup.startup).
#
#   ~/.local/bin/<tool>   -> exec guard.sh <tool> "$@"   for pulumi, aws, terraform, tofu
#   ~/.local/bin/neo-sandbox -> the entrypoint, so `sbx exec <sandbox> neo-sandbox …` works
#   ~/.profile / ~/.bashrc get a guarded line that puts ~/.local/bin first on PATH,
#   so `sbx exec -it <sandbox> bash -l` sessions resolve the shims too.
set -euo pipefail

share_dir="$HOME/.local/share/neo-sandbox"
shim_dir="$HOME/.local/bin"
tools="pulumi aws terraform tofu"
marker="# neo-sandbox: guard shims first on PATH"

mkdir -p "$shim_dir" "$HOME/.config/neo-sandbox" "$HOME/.local/state/neo-sandbox"
chmod 0755 "$share_dir/guard.sh" "$share_dir/neo-sandbox.sh" "$share_dir/install-shims.sh" 2>/dev/null || true

for t in $tools; do
  shim="$shim_dir/$t"
  tmp="$(mktemp "$shim_dir/.$t.XXXXXX")"
  printf '#!/usr/bin/env bash\n# neo-sandbox guard shim for %s (see %s/guard.sh)\nexec bash "%s/guard.sh" "%s" "$@"\n' \
    "$t" "$share_dir" "$share_dir" "$t" > "$tmp"
  chmod 0755 "$tmp"
  mv -f "$tmp" "$shim"
done

tmp="$(mktemp "$shim_dir/.neo-sandbox.XXXXXX")"
printf '#!/usr/bin/env bash\nexec bash "%s/neo-sandbox.sh" "$@"\n' "$share_dir" > "$tmp"
chmod 0755 "$tmp"
mv -f "$tmp" "$shim_dir/neo-sandbox"

for rc in "$HOME/.profile" "$HOME/.bashrc"; do
  if ! grep -qF "$marker" "$rc" 2>/dev/null; then
    # shellcheck disable=SC2016 # $PATH must stay literal: it is expanded by the login shell, not here
    printf '\n%s\ncase ":$PATH:" in *":%s:"*) ;; *) export PATH="%s:$PATH" ;; esac\n' \
      "$marker" "$shim_dir" "$shim_dir" >> "$rc"
  fi
done

echo "[neo-sandbox] guard shims installed in $shim_dir for: $tools"
