# Step 7: create an object

```bash
07-create-object/create.sh
```

Runs `kubectl apply -f 07-create-object/mangodb.yaml` on consumer A, then lists `mangodbs.mangodb.com -A` on consumer A and on the provider.

## Proof

```bash
07-create-object/check.sh
```

Expect `demo-from-consumer-a` on both clusters (on the provider in a namespace the backend created for this consumer). Not run here.
