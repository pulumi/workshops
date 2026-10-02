# AGENTS.md: slides

## Story

1. **The moment.** The Kubernetes documentation, "Volumes" page (read 2026-10-02): "If a node becomes unhealthy, then the local volume becomes inaccessible to the Pod. The Pod using this volume is unable to run. Applications using local volumes must be able to tolerate this reduced availability, as well as potential data loss". Source: https://kubernetes.io/docs/concepts/storage/volumes/
2. **The tension.** "Pods are replaceable." / "Their data is not."
3. **Why it is hard.** A stateless pod restarts on any node. A stateful pod's data sits on one node's disk.
4. **The questions.** Where does the data live? How many copies exist? What happens when a node dies? How is it provisioned? How fast can the app read? What tears it down?
5. **The answers.** Longhorn (persistent block storage, one controller per volume, replicas on several nodes) answers the first three. Pulumi IaC with the Kubernetes provider (Longhorn Helm chart pinned to 1.13.0, a StorageClass with two replicas, destroy in reverse order) answers provisioning and teardown. DragonflyDB (Redis and Memcached APIs, no client code changes) answers read speed. Rook is named as the alternative on a compare slide.
6. **The proof.** The node failure demo answers question 3 last: the record written in step 4 is still there after the node is cordoned and the pod deleted.

## Workshop

- Title: Storage and caching as code
- Length: 90 minutes
- Audience: platform engineers, intermediate
- Promise: a Longhorn-backed persistent volume and a DragonflyDB cache on Kubernetes (kind, 3 workers), both provisioned with Pulumi IaC (TypeScript), and a simulated node failure that recovers without data loss.

## Structure

| Part | Slides | Minutes |
| --- | --- | --- |
| Opening frame (title, speaker, agenda slides) | 5 | 4.5 |
| Act 1: the pain | 5 | 9 |
| Act 2: the tech | 13 | 35 |
| The solution we will build | 1 | 4.5 |
| Demo divider | 1 | 0.5 |
| Act 3: the demo (overview plus 7 steps) | 8 | 20 |
| Closing frame (Resources, journey, Q&A) | 3 | 16.5 (Q&A buffer is 15) |

Total: 36 slides, 90.0 minutes. Every slide has a speaker note ending with its time budget.

## Sources

| Date read | Source | What it established |
| --- | --- | --- |
| 2026-10-02 | https://kubernetes.io/docs/concepts/storage/volumes/ | The local volume availability and data loss passage used on the first slide |
| 2026-10-02 | Longhorn concepts documentation (longhorn.io/docs) | "Longhorn creates a dedicated storage controller for each volume and synchronously replicates the volume across multiple replicas stored on multiple nodes." |
| 2026-10-02 | https://longhorn.io | Longhorn is a CNCF Incubating Project and provides persistent block storage |
| 2026-10-02 | https://rook.io | Rook is a CNCF graduated project, a Kubernetes Operator for Ceph with file, block and object storage |
| 2026-10-02 | https://www.dragonflydb.io/docs | "Fully compatible with Redis and Memcached APIs", "multi-threaded, shared-nothing architecture", "requires no code changes" |
| 2026-10-02 | https://www.dragonflydb.io/docs/about/license | "Dragonfly is released under BSL 1.1 (Business Source License)." The page also says the docs are CC BY-SA 4.0. |

## Deviations from the brief

- The brief calls the cache CNCF-graduated Dragonfly. The demo and the deck use DragonflyDB (dragonflydb.io), which is not a CNCF project.
- The brief's own Dragonfly source is about the CNCF peer-to-peer project d7y.io, a different product. The deck says so on the "Where this breaks today" slide.
- The speaker is unknown, so the frame has one placeholder speaker.
- The node failure step and the DragonflyDB steps were not run on a live cluster while building the deck.

## Headlines

1. Local disks tie data to one node - pattern: quote-card
2. Pods are replaceable. - pattern: big-statement
3. Their data is not. - pattern: big-statement
4. A stateful pod carries a disk that cannot move - pattern: compare
5. Six questions decide whether you trust a storage setup - pattern: card-grid
6. Where does the data live? - pattern: section-opener
7. Longhorn copies every write to replicas on other nodes - pattern: flow
8. The cluster asks and Longhorn answers on the worker disks - pattern: zones
9. Two replicas let one node fail. - pattern: big-statement
10. Longhorn is block storage, Rook brings Ceph - pattern: compare
11. Three questions are answered, three to go - pattern: recap-grid
12. Provision it with code - pattern: section-opener
13. The program decides what lands in the cluster - pattern: chain
14. Replica count is one line of code. - pattern: big-statement
15. A cache that speaks Redis - pattern: section-opener
16. The client keeps its Redis commands - pattern: compare
17. Where this breaks today - pattern: compare
18. Five questions are answered, one to go - pattern: recap-grid
19. Four pieces make one stateful setup - pattern: flow
20. What we are going to do - pattern: demo-overview
21. Four nodes come up in kind - pattern: demo-step
22. Longhorn runs on every worker - pattern: demo-step
23. The StorageClass keeps two replicas - pattern: demo-step
24. A record written to a volume reads back - pattern: demo-step
25. Killing a node loses nothing - pattern: demo-step
26. The cache answers PING - pattern: demo-step
27. A Redis client works without changes - pattern: demo-step

## Rules

- The frame (title, speakers, agenda, demo divider, closing slides) comes from `frame.json` through `deck_frame.py`. Never edit frame slides by hand.
- Story and demo slides are built from the reference patterns. Headlines are claims.
- Code budget: no program code on slides, one to two commands per demo slide, at most twenty lines of code and commands in the deck.
- Run `deck_frame.py check` before every commit.
