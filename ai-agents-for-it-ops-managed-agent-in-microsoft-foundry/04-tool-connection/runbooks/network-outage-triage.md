# First steps when a service reports network errors

Use this runbook when a service's error logs show connection timeouts, DNS
resolution failures, or "connection refused" against a dependency, and you
do not yet know whether the problem is the service, the dependency, or the
network path between them.

## Establish scope first

1. Check the status dashboards for the cloud region and for any managed
   dependencies (managed database, message queue, DNS). A regional
   provider incident changes the whole response.
2. Determine whether the errors affect one instance or all instances of the
   service. One instance points at that instance's networking or host;
   all instances points at the dependency or a shared network path (NSG
   rule, DNS, peering).

## Triage steps

1. From an affected instance, test basic connectivity to the dependency's
   hostname and port: `nc -zv <host> <port>` or
   `curl -v telnet://<host>:<port>`.
2. If that fails, test DNS resolution separately: `dig <host>` /
   `nslookup <host>`. A resolution failure with connectivity otherwise fine
   points at DNS; a connection failure with resolution fine points at a
   firewall rule, NSG, or the dependency itself being down.
3. Check for a recent change: a deployment, an NSG rule update, or a
   certificate rotation in the last hour. Most network-error incidents
   trace back to a change, not a spontaneous failure.
4. If the dependency is itself an internal service, check its own health
   endpoint and error rate before assuming the network path is at fault.

## Escalation

If the outage affects all instances and no recent change explains it,
escalate to the network on-call with the scope (single service vs.
multiple), the affected dependency, and the `nc`/`dig` output from step 2
attached.
