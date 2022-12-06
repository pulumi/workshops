# workshop-confluent

This repo contains code for the Pulumi/Confluent workshop delivered on 2022-12-05. The infrastructure in this repo comprises:

* A schema registry cluster.
* A Kafka cluster for our messages ("inventory").
* An admin service account which we'll use to create our producer and consumer accounts.
* A Kafka topic for our cluster, which will hold our sample messages.
* A producer service account, which we'll use to write messages to the topic.
* A consumer service account, which we'll use to read messages from the topic.

When running the workshop, we'll swap out the ACL authorization for the producer and consumer for RBAC authorization. Both implementations are in this codebase - just comment out one for the other.

In addition to the usual Pulumi requirements (account, CLI), in order to run the code in this repo, you will need:

* The [Confluent CLI](https://docs.confluent.io/confluent-cli/current/overview.html).
* A Confluent Cloud account.
* A Confluent Cloud API key, with the key ID and secret placed in the environment variables `CONFLUENT_CLOUD_API_KEY` and `CONFLUENT_CLOUD_API_SECRET`, respectively.

## Producing Messages

After deploying the infrastructure in this repo, you can demonstrate writing messages to the Kafka topic via the following command:

```bash
confluent kafka topic produce $(pulumi stack output ordersTopicName) \
  --environment $(pulumi stack output environmentId) \
  --cluster $(pulumi stack output clusterId) \
  --api-key $(pulumi stack output producerApiKeyId) \
  --api-secret "$(pulumi stack output producerApiKeySecret --show-secrets)"
```

Enter a few records and then press 'Ctrl-C' when you're done.

Sample records:

```json
{"number":1,"date":18500,"shipping_address":"899 W Evelyn Ave, Mountain View, CA 94041, USA","cost":15.00}
{"number":2,"date":18501,"shipping_address":"1 Bedford St, London WC2E 9HG, United Kingdom","cost":5.00}
{"number":3,"date":18502,"shipping_address":"3307 Northland Dr Suite 400, Austin, TX 78731, USA","cost":10.00}
```

## Consuming Messages

After writing messages to the Kafka topic, you can demonstrate consuming messages from the Kafka topic via the following command:

```bash
confluent kafka topic consume $(pulumi stack output ordersTopicName) \
  --from-beginning \
  --environment $(pulumi stack output environmentId) \
  --cluster $(pulumi stack output clusterId) \
  --api-key $(pulumi stack output consumerApiKeyId) \
  --api-secret $(pulumi stack output consumerApiKeySecret --show-secrets)
```
