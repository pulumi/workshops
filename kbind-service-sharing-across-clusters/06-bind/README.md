# Step 6: bind the API

```bash
06-bind/install-plugin.sh   # kubectl-bind v0.8.1 tarball, checksum verified, into .state/bin
06-bind/bind.sh
```

`bind.sh` runs, against the consumer cluster, `kubectl bind login <backendUrl>` and `kubectl bind --konnector-image ghcr.io/kbind-dev/konnector:v0.8.1`. Both open a browser: sign in on the embedded OIDC page and select the `mangodb` template. The `--konnector-image` flag is hidden in `--help`; it is needed because the default konnector image repository in v0.8.1 is not pullable.

## Proof

```bash
06-bind/check.sh
```

Runs `kubectl get pods -n kube-bind`, `kubectl get apiservicebindings -n kube-bind` and `kubectl get crd mangodbs.mangodb.com` on the consumer. Not run here.
