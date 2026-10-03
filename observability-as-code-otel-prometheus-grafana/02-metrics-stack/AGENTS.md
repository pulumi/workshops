# AGENTS.md -- 02-metrics-stack

This folder holds two `kubernetes.helm.v3.Release` resources (Prometheus
stack + Tempo). Two things about that are non-obvious:

- `helm.v3.Release` performs a real Helm install against a reachable cluster
  ([Pulumi docs](https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v3/release/):
  "models a Helm Release as if it were created by the Helm CLI"). It cannot be
  previewed or rendered offline the way `helm.v3.Chart`/`ConfigGroup` can. Verify
  changes here with `helm template <chart> --version <pin> -f <values>`
  against the same values this file passes, and `npx tsc --noEmit`; do not
  expect `pulumi preview` to run without a live cluster.
- `prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues` and
  `...ruleSelectorNilUsesHelmValues` must both be `false`. The chart's default
  (`true`) scopes Prometheus to ServiceMonitors/PrometheusRules created by this
  same Helm release, which would silently drop step 3's ServiceMonitor and
  step 6's PrometheusRule -- they would exist in the cluster but never be
  scraped or evaluated, with no error anywhere.
