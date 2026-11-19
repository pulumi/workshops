# Deck notes: kafka-on-kubernetes-strimzi

slidev-deck skill (pulumi/marketing-web) read on 2026-10-04 at commit 9b37f9afe8c7b0d406f19bc9116b16d5689389ce.

## Story

1. **The moment.** The Strimzi overview, section "Why use Strimzi to run Kafka on Kubernetes?": "Running Kafka on Kubernetes without native support from Strimzi can be complex. While deploying Kafka directly with standard resources like StatefulSet and Service is possible, the process is often error-prone and time-consuming. This is especially true for operations like upgrades and configuration updates." Source: https://strimzi.io/docs/operators/latest/overview (read 2026-10-04). No dated public incident was found this run, so the moment is the project's own statement of the problem.
2. **The tension.** "You can deploy Kafka with a StatefulSet." / "Upgrades and config changes are where it hurts."
3. **Why it is hard.** Day one is a manifest. Day two is an upgrade, a config change, a new broker. The operator takes over that work.
4. **The questions.** What describes the cluster? Where does the data live? Who does the rolling upgrade? How do we add a broker? How does Pulumi drive all of it? Did we lose a message?
5. **The answers.** Custom resources and KRaft; node pools and deleteClaim; edit the version and the operator rolls; replicas plus an approved KafkaRebalance; CustomResource, StackReference and waitFor in three Pulumi projects.
6. **The proof.** Numbered messages are sent during a scale-up and a rolling upgrade, then counted with check.sh. The last question is answered live.

## Fact-check

Separate pass on 2026-10-04 against pages opened this run. Verified 31, corrected 2, removed 0.

| Claim | Source | Result |
| --- | --- | --- |
| Moment quote (StatefulSet, error-prone, upgrades) | https://strimzi.io/docs/operators/latest/overview | verified |
| Kafka, KafkaTopic, KafkaUser custom resources; high-level definition | Strimzi overview, Why use Strimzi | verified |
| Rolling upgrades and recovery automated; node pools, Cruise Control reassignment, Drain Cleaner | Strimzi overview | verified |
| IaC workflow, version-controlled YAML | Strimzi overview | verified |
| Kafka 4.0 first major release without ZooKeeper, KRaft | https://kafka.apache.org/blog/2025/03/18/apache-kafka-4.0.0-release-announcement/ | verified |
| Strimzi dropped ZooKeeper clusters from 0.46 | Strimzi deploying docs 2.2 | verified |
| Brokers stream and store, controllers manage metadata, node pools | Strimzi overview 3.2 | verified |
| deleteClaim default false | Strimzi configuring docs | verified |
| Upgrade: change spec.kafka.version, leave metadataVersion at current, rolling updates | Strimzi deploying docs, upgrade procedure | verified |
| KafkaRebalance add-brokers, ProposalReady, strimzi.io/rebalance=approve, Executor applies approved proposals | Strimzi deploying docs | verified |
| Static controller quorums: scaling needs downtime | Strimzi deploying docs 2.1.1 | verified |
| StackReference gives access to another stack's outputs, creates a dependency | https://www.pulumi.com/docs/iac/concepts/stacks/ | verified |
| CustomResource represents an instance of a CRD | https://www.pulumi.com/registry/packages/kubernetes/api-docs/apiextensions/customresource/ | verified |
| pulumi.com/waitFor supports condition=Type | https://github.com/pulumi/pulumi-kubernetes/blob/master/CHANGELOG.md (4.24.0) | verified |
| Demo values: 3+3 pods, kafkaVersion 4.2.1, metadataVersion 4.2-IV1, 3 partitions, commands and flags | demo folders 01-cluster to 06-teardown, README.md | verified against files |
| Metadata version "stays at 4.2-IV1" after the upgrade | 05-day2/upgrade.sh, README step 6 | corrected wording to match the script |
| Moment wording: earlier draft said "incident" | no incident source found | corrected: moment is the doc statement |

Open questions:
- No dated public incident of a Kafka-on-Kubernetes failure was found. A reviewer may prefer one.
- Speaker is a placeholder; the speakers are unknown.
- The deck was not rehearsed against a live run.
