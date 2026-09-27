# 06-pitr-restore

Pulumi TypeScript project: a point-in-time restore of the CloudNativePG
cluster from 02-postgres-cluster's Barman Cloud plugin archive. `index.ts`
creates a new `ObjectStore` (`s3-store-restore`, same bucket, a different
prefix) and a new `Cluster` CR (`pg-cluster-restore`) that bootstraps via
`bootstrap.recovery` from the source cluster's archive and re-enables WAL
archiving into its own object store.

## How to work here

- Stack: `dev`. Config `clusterStackRef` points at the `02-postgres-cluster`
  stack (default placeholder `<org>/pg-postgres-cluster/dev`); this project
  reads `kubeconfigContext`, `namespace`, `clusterName`, `bucketName`, and
  `objectStoreName` from that stack's outputs and creates nothing there.
- `recoveryTargetTime` has **no default** and must be set immediately before
  `pulumi up`, to a real timestamp taken after the demo's on-demand backup:

  ```
  pulumi config set recoveryTargetTime "<RFC3339 timestamp>"
  ```

  Pick the timestamp from `../05-backup/backup.sh`'s output (the backup
  completion time, or a moment shortly after it once WAL has archived). A
  stale, guessed, or pre-backup timestamp will fail bootstrap or restore to
  the wrong point.
- The restored cluster reuses the existing `s3-creds` Secret in the same
  namespace (created in 02-postgres-cluster); this project does not create
  or copy that Secret, only references it by name.
- `npx tsc --noEmit` must be clean before `pulumi preview`. Always run
  `pulumi preview` before `pulumi up`.

## Verifying the restore

Once `pulumi up` finishes, confirm the restored cluster is healthy:

```
kubectl --context kind-pg-workshop-demo get cluster pg-cluster-restore -n postgres-demo
```

Expect `pg-cluster-restore` to reach the `Cluster in healthy state` status,
matching `pg-cluster`'s own status column.

Then compare a row count between the source and restored cluster for a
sample table (substitute the real table name and any auth the presenter's
runbook specifies):

```
kubectl --context kind-pg-workshop-demo exec -n postgres-demo pg-cluster-1 -- psql -U app -d app -tAc "SELECT count(*) FROM <sample_table>;"
kubectl --context kind-pg-workshop-demo exec -n postgres-demo pg-cluster-restore-1 -- psql -U app -d app -tAc "SELECT count(*) FROM <sample_table>;"
```

Open question for the presenter's runbook, not this folder's job: this
folder does not seed any demo data. The presenter must create `<sample_table>`
and insert rows on `pg-cluster` earlier in the demo (before the 05-backup
step runs), so there is something to compare here. Flag this in the runbook
rather than assuming it is covered.
