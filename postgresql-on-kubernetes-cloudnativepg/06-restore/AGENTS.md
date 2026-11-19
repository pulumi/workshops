# 06-restore

Presenter-only demo step. This project only does anything useful once
`02-cluster` (Pulumi project `cnpg-workshop-cluster`) has been deployed with
`backupsEnabled=true` and at least one backup already exists in the object
store it configured. Running this project before that prerequisite is met
will still `pulumi preview`/`pulumi up` cleanly, but the new `Cluster` it
creates has no backup to recover from and will fail to actually restore any
data.

Participants watch this step; they do not run it themselves.
