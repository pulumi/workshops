# Freeing disk space on a VM

Use this runbook when monitoring reports a VM's root or data volume above
85% utilization, or a service has started failing writes with "no space
left on device".

## Find what is using the space

1. `df -h` to confirm which volume is full.
2. `du -sh /var/log/* | sort -rh | head -20` to find the largest log
   directories.
3. `du -sh /var/lib/docker/* 2>/dev/null | sort -rh | head -20` if the host
   runs containers -- dangling images and stopped containers are the most
   common culprit.

## Safe cleanup steps, in order

1. Rotate and compress logs that are not already rotated:
   `logrotate -f /etc/logrotate.conf`.
2. Delete application logs older than the retention policy (check the
   service's own runbook for its retention window before deleting; do not
   assume 7 days).
3. Remove unused Docker images and stopped containers:
   `docker system prune -af --filter "until=72h"` (the 72h filter avoids
   deleting images still needed by a container that is mid-restart).
4. Clear package manager caches: `apt-get clean` or `yum clean all`.
5. If a core dump directory (`/var/crash`, `/var/lib/systemd/coredump`) is
   large, archive dumps older than 30 days to blob storage before deleting
   them locally -- they are sometimes needed for a still-open incident.

## If none of the above frees enough space

Escalate to resizing the volume rather than deleting anything
application-data-related. Never delete files under a database's data
directory to free space; that risks corrupting the database.

## After cleanup

Confirm utilization has dropped below 70% and re-check in one hour, since a
runaway log or a leaking temp-file writer will refill the volume quickly.
