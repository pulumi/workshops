# Lab 6: Control rollout work

Keep the selected program artifact and runner configuration constant while testing scheduling. Record the request, start, and completion times for each stack. Total runner time and elapsed rollout time measure different outcomes.

## Path filters

Use source paths that include the selected program, shared build scripts, provider manifest, and relevant configuration. For this companion, a TypeScript source deployment could include:

```text
faster-pulumi-deployments/programs/typescript/**
faster-pulumi-deployments/scripts/**
faster-pulumi-deployments/provider-plugins.txt
```

Add any external configuration paths your actual repository uses. Test an unrelated commit and a shared-dependency commit through your configured VCS integration. API-triggered deployments do not prove that push-trigger filters work.

## Queue consolidation

Enable **Skip intermediate deployments** on a disposable stack. Add a temporary `sleep 45` pre-run command to the first request, then wait until it starts. Queue two updates of the same type while it is active. Do not include the delay in the later requests.

The active deployment should complete, the middle request should be marked **Skipped**, and the newest request should run. Remove the diagnostic delay afterward. If the first job finishes before the others are queued, repeat the experiment; that sequence did not test consolidation.

## Capacity

Run two stacks against a single customer-managed agent, then repeat with two agents. Check queue wait and actual execution overlap. A polling interval can affect start times independently of runner capacity. Do not alter your production pool for this experiment.

Resource-level `--parallel` is a different control from stack concurrency. Test it only after understanding queue time and resource dependencies, and watch for provider throttling.

Record which changes reduced repeated preparation and which changed only scheduling. Do not publish the small Random program's timings as a forecast for an AWS infrastructure program.
