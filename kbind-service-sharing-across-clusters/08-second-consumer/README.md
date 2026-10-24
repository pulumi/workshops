# Step 8: a second consumer

```bash
08-second-consumer/run.sh
```

Repeats steps 1, 5, 6 and 7 for `consumer-b-dev` and applies `08-second-consumer/mangodb.yaml`. The provider stack is not touched.

## Proof

```bash
08-second-consumer/check.sh
```

Lists the objects of both consumers on the provider and runs `pulumi preview --expect-no-changes` on `provider-dev`. Not run here.
