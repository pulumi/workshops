# Slides: observability-as-code-otel-prometheus-grafana

Deck built with `deck_frame.py` (frame) plus reference-deck patterns. marketing-web `slidev-deck` skill read 2026-10-03, commit 9b37f9afe8c7b0d406f19bc9116b16d5689389ce.
Speakers are placeholders until the card names them.

## Story

1. **The moment.** Grafana Labs Observability Survey 2025 (3rd annual, 1,255 responses): 101 different observability technologies cited as in use. Source https://grafana.com/observability-survey/2025/ (read 2026-10-03). Brief §2 had no incident scene, so a sourced survey figure opens the deck.
2. **The tension.** The tools are open source and anyone can run them. The wiring around them is clicked together and nobody reviews it.
3. **Why it is hard.** Dashboards, alert rules and Collector config live in a UI or a loose file. Compare: observability as clicks versus as reviewed code.
4. **The questions.** Six: how does the app emit telemetry, where does it arrive, how is it stored and queried, how does a dashboard get defined, how does an alert get defined, how do the layers stay wired together.
5. **The answers.** OpenTelemetry (emit, Collector), Prometheus (pull, store, operator CRDs), Grafana (dashboard from a labelled ConfigMap, alert as PrometheusRule), Pulumi IaC (one project per layer, StackReference).
6. **The proof.** Seven demo steps end with load on the sample app, a moving p95 graph, a trace in Tempo and the alert rule firing path.

## Headlines (pattern per slide)

Read in order they tell the story: 101 tools in use; open source stack; wiring clicked together; what changes when it is code (compare); six questions (card-grid); OpenTelemetry (section-opener, big-statement, flow); Prometheus; Grafana; Pulumi IaC; where this breaks today; five answered, one to go (recap-grid); solution diagrams; demo divider; demo-overview; one demo-step per folder 01 to 07.

## Counts

39 slides: frame 5 + 1 speaker, Act 1 5 slides, Act 2 15, solution 2, demo divider 1, Act 3 8, closing 3. Code in deck: 12 lines (one 7-line program slide, six one-line commands). Time budget on every slide, total 90 min.

## Fact-check

Separate pass, 2026-10-03, against pages opened in this run.

| Claim | Source | Result |
|---|---|---|
| 1,255 responses; 101 technologies; 71% use Prometheus and OpenTelemetry in some capacity; complexity is the most cited obstacle (39%) | grafana.com/observability-survey/2025/ | confirmed |
| Prometheus stores time series with labels, pull model over HTTP, PromQL | prometheus.io/docs/introduction/overview/ | confirmed |
| Alertmanager handles silencing, inhibition, aggregation, notifications | prometheus.io/docs/alerting/latest/overview/ | confirmed |
| Collector is a vendor-agnostic way to receive, process and export telemetry | opentelemetry.io/docs/collector/ | confirmed |
| OTLP describes encoding, transport and delivery between sources, collectors and backends | opentelemetry.io/docs/specs/otlp/ | confirmed |
| PrometheusRule defines alerting and recording rules, loaded without restart | prometheus-operator.dev/docs/getting-started/design/ | confirmed |
| ServiceMonitor, PodMonitor, PrometheusRule are operator CRDs | prometheus-operator.dev/docs/getting-started/design/ | confirmed |
| Selector-nil-uses-helm-values flags set to false let Prometheus see outside monitors | kube-prometheus-stack chart README | confirmed |
| Grafana sidecar loads dashboards from labelled ConfigMaps | grafana helm chart README, k8s-sidecar README | confirmed |
| StackReference reads another stack's outputs | pulumi.com/docs/iac/concepts/stacks/ | confirmed |
| Tempo is a distributed tracing backend | grafana.com/docs/tempo/latest/introduction/ | confirmed |
| Metric name, job label, p95 query, 200 ms threshold, 1m for, chart versions | demo code and README in this folder | confirmed against code |
| Premise slide ("wiring is clicked together") | not a statistic; labelled as the workshop claim in the note | reworded |

Corrections: one speaker note said "Not price, not features"; reworded to the survey's "most frequently cited obstacle". One note now says the premise is a claim, not a survey result.
Not run: the demo itself (no docker in this sandbox).
