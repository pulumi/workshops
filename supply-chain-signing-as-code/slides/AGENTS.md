# Workshop deck notes: supply-chain-signing-as-code

## Story
1. The moment: Sysdig Threat Research Team (2022) analysed over 250,000 Linux images on Docker Hub and identified 1,652 as malicious; cryptominers were the most common type. Source: https://sysdig.com/blog/analysis-of-supply-chain-attacks-through-public-docker-images/
2. The tension: "You can scan an image for what is inside it." / "You can't tell who built it."
3. Why it is hard: a pull succeeds whether or not the publisher is known (compare slide).
4. The questions: who built this image; has it changed since they signed it; what stops an unsigned image at deploy; where do the keys and trust live; is the cluster itself sound; can we rebuild all of it from code.
5. The answers, in order: a Notation signature (questions 1 and 2); trust store, trust policy and the signing key (question 4); Kyverno verifyImages (question 3); Kubescape (question 5); Pulumi IaC plus the demo (question 6).
6. The proof: the demo builds the stack with one pulumi up, signs an image, shows Kyverno rejecting an unsigned one, and scans the cluster.

## Workshop info
- Slug: supply-chain-signing-as-code. Length: 90 minutes. Audience: platform and security engineers, intermediate (Kubernetes and registry familiarity), no Pulumi experience needed.

## Original request
The brief: https://workprentice.ai/documents/0a1f7c46-3c0f-4d94-b8aa-ac088ef6ea87

## Structure and minute budget
44 slides: frame 5 + Act 1 (slides 6 to 10) + Act 2 (slides 11 to 30, with the solution slides 28 to 30) + demo divider (31) + Act 3 (slides 32 to 41, ten slides including the overview) + closing frame (42 to 44). Budgets in the speaker notes add up to 90 minutes. Act 3 is 10 of 44 slides.

## Sources
- Sysdig article (above), Notary Project docs https://notaryproject.dev/docs/, Kyverno https://kyverno.io/docs/policy-types/cluster-policy/verify-images/notary/, Kubescape https://kubescape.io/docs/, Pulumi IaC https://www.pulumi.com/docs/iac/, AWS Signer and ECR docs. All read 2026-10-03.
- Pulumi marketing-web slidev-deck skill, commit 9b37f9afe8c7b0d406f19bc9116b16d5689389ce (read 2026-10-03).

## Deviations
- The nine numbered demo folders (00 to 08) map 1:1 to nine demo slides.
- Speakers are placeholders because the speakers are unknown.

## Rules
- The frame (opening, demo divider, closing), headmatter and style.css come from deck_frame.py and are never edited by hand. Change frame.json and run init --frame-only.
- Slides are built from deck_frame.py patterns only; no theme layouts other than image; no Mermaid.
- Pulumi names: Pulumi Neo, Pulumi ESC, Pulumi Cloud, Pulumi IaC. No em dashes.

## Headlines
1. Supply chain signing as code (pattern: flow/chain/zones/other)
2. Speaker Name (pattern: flow/chain/zones/other)
3. Housekeeping and Agenda (pattern: flow/chain/zones/other)
4. Housekeeping (pattern: flow/chain/zones/other)
5. Today's Agenda (pattern: flow/chain/zones/other)
6. 1,652 of 250,000 public images were malicious (pattern: quote-card)
7. 61% of all images pulled come from public repositories. (pattern: big-statement)
8. You can scan an image for what is inside it. (pattern: big-statement)
9. You can't tell who built it. (pattern: big-statement)
10. A pull succeeds whether or not the publisher is known (pattern: flow/chain/zones/other)
11. Six questions decide whether you trust a pipeline (pattern: recap-grid/card-grid)
12. A signature answers who built it and whether it changed. (pattern: section-opener)
13. A signature is tied to an image digest in the registry (pattern: flow/chain/zones/other)
14. Trust is a policy you write down. (pattern: section-opener)
15. A trust policy says which signatures count (pattern: flow/chain/zones/other)
16. The demo signs with a local test key (pattern: flow/chain/zones/other)
17. Three questions covered, three to go (pattern: recap-grid/card-grid)
18. Kyverno stops an unsigned image at admission. (pattern: section-opener)
19. Kyverno rejects the pod before it runs (pattern: flow/chain/zones/other)
20. Four fields in one rule decide what gets blocked (pattern: flow/chain/zones/other)
21. Four questions covered, two to go (pattern: recap-grid/card-grid)
22. Kubescape reports how sound the cluster is. (pattern: section-opener)
23. A Kubescape scan counts controls that failed, passed or need setup (pattern: flow/chain/zones/other)
24. Five questions answered, one to go (pattern: recap-grid/card-grid)
25. Where this breaks today (pattern: flow/chain/zones/other)
26. Pulumi IaC answers the last question. (pattern: section-opener)
27. One Pulumi program builds the registry, the cluster and the policy (pattern: flow/chain/zones/other)
28. The policy is ordinary Pulumi code (pattern: flow/chain/zones/other)
29. pulumi up creates or updates every resource in the stack (pattern: flow/chain/zones/other)
30. The demo shows the whole pipeline end to end. (pattern: big-statement)
31. Demo: Supply chain signing. (pattern: section-opener)
32. What we are going to do (pattern: flow/chain/zones/other)
33. A local test key and a trust policy exist (pattern: flow/chain/zones/other)
34. One pulumi up builds the registry, the cluster and the policy (pattern: flow/chain/zones/other)
35. The hello image builds locally (pattern: flow/chain/zones/other)
36. The image is pushed, signed and verified (pattern: flow/chain/zones/other)
37. A second image goes up with no signature (pattern: flow/chain/zones/other)
38. Kyverno admits the pod with the signed image (pattern: flow/chain/zones/other)
39. Kyverno rejects the pod with the unsigned image (pattern: flow/chain/zones/other)
40. Kubescape reports the cluster posture (pattern: flow/chain/zones/other)
41. One script tears the whole stack down (pattern: flow/chain/zones/other)
42. Resources (pattern: flow/chain/zones/other)
43. Continue your Pulumi journey! (pattern: recap-grid/card-grid)
44. Questions? (pattern: recap-grid/card-grid)

## Fact-check
| Claim | Source | Read date | Outcome |
| --- | --- | --- | --- |
| 1,652 of 250,000 images malicious (Sysdig 2022) | https://sysdig.com/blog/analysis-of-supply-chain-attacks-through-public-docker-images/ (fetched page "sysdig") | 2026-10-03 | confirmed (phrase found in the fetched page) |
| 250,000 Linux images analysed | https://sysdig.com/blog/analysis-of-supply-chain-attacks-through-public-docker-images/ (fetched page "sysdig") | 2026-10-03 | confirmed (phrase found in the fetched page) |
| cryptominers most common | https://sysdig.com/blog/analysis-of-supply-chain-attacks-through-public-docker-images/ (fetched page "sysdig") | 2026-10-03 | confirmed (phrase found in the fetched page) |
| 61% of images pulled from public repositories | https://sysdig.com/blog/analysis-of-supply-chain-attacks-through-public-docker-images/ (fetched page "sysdig") | 2026-10-03 | confirmed (phrase found in the fetched page) |
| trust policy: registryScopes | https://notaryproject.dev/docs/ (fetched page "notary_trust") | 2026-10-03 | confirmed (phrase found in the fetched page) |
| trust policy: trustStores | https://notaryproject.dev/docs/ (fetched page "notary_trust") | 2026-10-03 | confirmed (phrase found in the fetched page) |
| trust policy: trustedIdentities | https://notaryproject.dev/docs/ (fetched page "notary_trust") | 2026-10-03 | confirmed (phrase found in the fetched page) |
| signatureVerification level strict (doc example) | https://notaryproject.dev/docs/ (fetched page "notary_trust") | 2026-10-03 | confirmed (phrase found in the fetched page) |
| notation sign / verify flow | https://notaryproject.dev/docs/ (fetched page "n_qs") | 2026-10-03 | confirmed (phrase found in the fetched page) |
| signature tied to digest / tag resolved to digest | https://notaryproject.dev/docs/ (fetched page "n_qs") | 2026-10-03 | confirmed (phrase found in the fetched page) |
| Kyverno type: Notary / verifyImages | https://kyverno.io/docs/policy-types/cluster-policy/verify-images/notary/ (fetched page "kyverno") | 2026-10-03 | confirmed (phrase found in the fetched page) |
| Kyverno failureAction Enforce | https://kyverno.io/docs/policy-types/cluster-policy/verify-images/notary/ (fetched page "kyverno") | 2026-10-03 | confirmed (phrase found in the fetched page) |
| Kyverno imageReferences | https://kyverno.io/docs/policy-types/cluster-policy/verify-images/notary/ (fetched page "kyverno") | 2026-10-03 | confirmed (phrase found in the fetched page) |
| Kyverno attestors / certificates | https://kyverno.io/docs/policy-types/cluster-policy/verify-images/notary/ (fetched page "kyverno") | 2026-10-03 | confirmed (phrase found in the fetched page) |
| Kyverno blocked unsigned image message | https://kyverno.io/docs/policy-types/cluster-policy/verify-images/notary/ (fetched page "kyverno") | 2026-10-03 | confirmed (phrase found in the fetched page) |
| Kubescape NSA framework 24 controls | https://kubescape.io/docs/ (fetched page "ks_gs") | 2026-10-03 | confirmed (phrase found in the fetched page) |
| Kubescape --verbose | https://kubescape.io/docs/ (fetched page "ks_gs") | 2026-10-03 | confirmed (phrase found in the fetched page) |
| Kubescape failed/passed/skipped summary | https://kubescape.io/docs/ (fetched page "ks_scan") | 2026-10-03 | confirmed (phrase found in the fetched page) |
| Pulumi IaC stack up creates/updates resources | https://www.pulumi.com/docs/iac/ (fetched page "pu_up") | 2026-10-03 | confirmed (phrase found in the fetched page) |
| AWS Signer Notation profile | https://docs.aws.amazon.com/signer/ (fetched page "signer") | 2026-10-03 | confirmed (phrase found in the fetched page) |
| ECR image tag mutability | https://docs.aws.amazon.com/AmazonECR/latest/userguide/ (fetched page "ecr_mut") | 2026-10-03 | confirmed (phrase found in the fetched page) |

The check above is a phrase match against the fetched pages, not a reading of the surrounding sentence. A human reviewer should still read the Kyverno and Kubescape slides against the pages once.

## Open questions
- Speaker names, roles, photos and bios are unknown; frame.json holds a placeholder.
- The Kubescape numbers on the Kubescape slide (24 controls: 12 failed, 10 passed, 2 need configuration) are from the docs example, not from the demo cluster.
- The PNG export from the Slidev CLI wrote no files in this environment; pages were checked by rendering the exported PDF with pdftoppm.

## Build notes
- npm install, npm run build and npm run export (PDF) were run in slides/. Export output (slides-export.pdf, export-pages/, dist/) is gitignored.
- A slide body must start after a blank line following its --- separator, otherwise Slidev reads it as frontmatter and merges slides.
