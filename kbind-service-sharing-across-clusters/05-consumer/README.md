# Step 5: a consumer cluster

Pulumi project `kbind-consumer` with a local component `KbindConsumer`: an EKS cluster of the same shape as the provider's (2 x t3.medium, public subnets). One project, one stack per consumer: `consumer-a-dev`, `consumer-b-dev`. The provider URL arrives as stack config from the stack's ESC environment (`pulumi-stacks` provider reading `provider-dev`). Exports: `providerUrl`, `clusterName`, `kubeconfig` (secret).

## Commands

```bash
05-consumer/deploy.sh                  # consumer-a-dev: pulumi preview, pulumi up
05-consumer/deploy.sh consumer-b-dev   # step 8
```

## Proof

```bash
05-consumer/check.sh   # kubectl get nodes; pulumi stack output providerUrl
```

Not run here.
