# Slides notes

## Story

1. The moment: the kbind project's own sentence, "While Kubernetes has amazing ecosystem, it lacks a native way to provide APIs as services." (kbind.dev, read 2026-10-24). No incident or quote found.
2. The tension: "One service. Many clusters."
3. Why it is hard: a CRD alone is only a schema; something must act on it, and consumers should not run that operator.
4. The questions: who provides the API, what is shared, how a consumer binds, which credentials each side holds, how the next consumer is added, where the object lives.
5. The way out: kbind exports the API, the konnector syncs it, Pulumi IaC builds the clusters, Pulumi ESC and Pulumi Cloud carry credentials and outputs.
6. The close: four questions answered by slides, two by the demo, then the recap.

