# Step 9: teardown

```bash
09-teardown/teardown.sh   # pulumi destroy + pulumi stack rm: consumer-b-dev, consumer-a-dev, provider-dev
09-teardown/verify.sh     # aws eks list-clusters, aws elbv2/elb describe-load-balancers, in eu-central-1
09-teardown/cleanup.sh    # pulumi env rm for the three environments, delete .state/
```

Consumers go first, the provider last. Run `verify.sh` before `cleanup.sh`: it needs the provider environment for AWS credentials.

## Proof

`verify.sh` should show an empty cluster list and no load balancer from the demo. Not run here.
