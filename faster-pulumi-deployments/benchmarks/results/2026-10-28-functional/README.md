# Historical functional-test timings

These 25 retained deployments were exported from Pulumi Cloud after the original functional checks. Their raw step timestamps are in [deployments.json](deployments.json), and the calculated phase breakdowns are in [runs.csv](runs.csv).

All rows are excluded from benchmark summaries. Runs changed images, configuration, and operation workloads during debugging; some contain deliberate delays or failed preparation steps. In particular, the first source deployment created resources, while later runs often made no changes. These rows cannot establish a controlled speedup.

The export preserves failures and skipped requests. A skipped request has no execution duration rather than an artificial zero-second result.

The separate cross-language CLI tests did not produce equivalent deployment-step records. They verified execution and configuration, but their build, image-pull, and installation breakdowns cannot be reconstructed from the CLI's operation duration.
