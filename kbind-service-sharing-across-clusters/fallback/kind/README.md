# Fallback: two local kind clusters

If AWS or EKS is not available:

```bash
06-bind/install-plugin.sh
fallback/kind/kind-quickstart.sh   # kubectl bind dev create
```

Needs Docker and kind. `kubectl bind dev` is marked experimental in the v0.8.1 docs. The command uses the chart's default image repository, which may not be pullable (README, Open points 2). Not run here.
