# Restarting a hung service

Use this runbook when a service is unresponsive but its process is still
running (health checks time out, no crash in the process list).

## Before you restart

1. Capture a thread dump or `py-spy dump` / `jstack` (language-appropriate)
   so the on-call engineer can diagnose the hang after the fact.
2. Check whether the service is a member of a load-balanced pool. If it is,
   drain it from the pool first so in-flight requests are not dropped
   mid-restart: `az network lb address-pool address remove ...` or the
   equivalent for your load balancer.
3. Confirm no migration or long-running batch job is mid-flight against
   this instance. Restarting during a migration can leave the database in
   a partially-applied state.

## Restart steps

1. Notify the incident channel that a restart is starting, with the
   timestamp and instance ID.
2. Stop the service gracefully first (`systemctl stop <service>` or the
   container orchestrator's graceful-stop equivalent), giving it up to 30
   seconds to drain existing connections.
3. If it has not stopped after 30 seconds, force-kill it
   (`systemctl kill -s SIGKILL <service>`).
4. Start the service (`systemctl start <service>`).
5. Watch the health check endpoint for two consecutive healthy checks
   before re-adding the instance to the load-balanced pool.

## After the restart

1. Re-add the instance to the pool if you drained it.
2. Confirm error rates and latency have returned to baseline in the
   dashboards for at least 10 minutes.
3. Attach the thread dump from step 1 to the incident ticket.
