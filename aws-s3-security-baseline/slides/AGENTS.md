# Workshop deck notes: aws-s3-security-baseline

## Workshop

- Slug: aws-s3-security-baseline
- Title: Automating the S3 security baseline as code
- Audience and level: platform and cloud engineers, intermediate (brief section 1)
- Length: 90 minutes (slides 30, demo 50, questions 10), brief section 1
- Speakers: placeholders in frame.json; the speakers are not confirmed. The pull request says so.
- Branch: anvil/aws-s3-security-baseline. One draft pull request, never merged by Anvil.
- Deck: 44 slides, 1920-pixel canvas, `@pulumi/slidev-theme` with Slidev 0.50, scaffolded by `deck_frame.py init`.

## Authority order

1. The brief (section 1 to 9) is the contract.
2. The demo folders in this workshop folder; every command on a slide is a command a demo script runs.
3. The reference deck `pulumi/workshops/neo-in-a-docker-sandbox/slides`, for patterns.
4. The workshop-deck and slidev-deck skills, for mechanics.

## Story

1. The moment. UpGuard reported in 2017 that an Amazon S3 bucket run by an engineer at NICE Systems, a Verizon partner, was fully downloadable and configured to allow public access. UpGuard estimated up to 14 million US customers; Verizon said 6 million. Found June 8, reported to Verizon June 13, closed June 22. Source: https://www.upguard.com/breaches/verizon-cloud-leak, read 2026-10-12. The deck does not claim anything about what S3 offered in 2017.
2. The tension. "The baseline is six resources per bucket." / "Copies drift. Review finds out after the deploy."
3. Why it is hard. Each of the six controls closes a different gap, and two of them raise a fair doubt: encryption is already on by default, and versioning needs lifecycle rules to keep the cost down.
4. The questions. What is in the baseline? How do we stop each team from retyping it? How do we stop someone from skipping it? How do we run this without static AWS keys? How does it reach every team?
5. The answers, in order. Six controls (slides 9 to 11). A SecureBucket component (14 to 16). A policy pack that fails the preview (19 to 22). Pulumi ESC with OIDC (25). Three ways to reach every team: local pack, policy group, and the limits that remain (27, 28).
6. The proof. Ten demo steps from an empty project to a verified bucket and a teardown. Step 8 shows a mixed stack where the pack blocks only the bare bucket, which answers the skip question last.

## Headlines

| Slide | Headline | Pattern | Minutes |
| --- | --- | --- | --- |
| 6 | A public S3 bucket exposed Verizon customer data | quote-card | 1.75 |
| 7 | The baseline is six resources per bucket. | big-statement | 0.5 |
| 8 | Copies drift. Review finds out after the deploy. | big-statement | 0.5 |
| 9 | Each of the six controls closes one gap | card-grid | 2 |
| 10 | Encryption is on by default, so why configure it? | compare | 1.25 |
| 11 | Versioning protects objects, lifecycle keeps the cost down | compare | 1.25 |
| 12 | Five questions before you trust a baseline | card-grid | 1.25 |
| 13 | How do we stop each team from retyping it? | section-opener | 0.25 |
| 14 | One component replaces six resources per bucket | compare | 1.75 |
| 15 | Children name the parent, and the order is explicit | chain | 1.75 |
| 16 | The demo avoids the deprecated V2 resources | compare | 0.75 |
| 17 | Two of five answered | recap-grid | 0.5 |
| 18 | How do we stop someone from skipping it? | section-opener | 0.25 |
| 19 | The enforcement level decides what a violation does | options | 0.75 |
| 20 | A stack policy sees the whole graph, a resource policy sees one | compare | 1.25 |
| 21 | Three policies, all mandatory, make up the pack | card-grid | 1.25 |
| 22 | The pack runs at preview, before anything is created | chain | 1.25 |
| 23 | Three of five answered | recap-grid | 0.5 |
| 24 | How do we run this without static AWS keys? | section-opener | 0.25 |
| 25 | Pulumi ESC trades a short-lived token for AWS credentials | flow | 1.25 |
| 26 | Four of five answered | recap-grid | 0.5 |
| 27 | Three ways to reach every team | options | 1.25 |
| 28 | Where this breaks today | icon list (limits) | 1.25 |
| 29 | The program and the pack run on your machine | zones | 1 |
| 30 | The demo builds one guarded path to a secure bucket | chain | 1.25 |
| 32 | What we are going to do | demo-overview | 0.75 |
| 33 | 1 · An empty project has nothing to block | demo-step | 2.25 |
| 34 | 2 and 3 · ESC hands over credentials, the caller identity proves it | demo-step | 5.5 |
| 35 | 4 and 5 · A bare bucket fails the pack with six violations | demo-step | 7.5 |
| 36 | 6 and 7 · SecureBucket creates the bucket and six companions, the pack passes | demo-step | 10 |
| 37 | 8 · A mixed stack blocks only the bare bucket | demo-step | 4.5 |
| 38 | 9 · Deploy goes through the pack and ESC | demo-step | 5.5 |
| 39 | 10 · AWS confirms every control | demo-step | 8 |
| 40 | 11 · Optional: publish the pack to a policy group | demo-step | 3.5 |
| 41 | 12 · Teardown leaves no bucket behind | demo-step | 2.5 |

Pattern names are from `deck_frame.py patterns`; they are mapped from the markup, and `deck_frame.py check` enforces them.

## Structure and minute budgets

Every slide carries its budget in the first words of its speaker note. The budgets add up to 90 minutes, which is the brief section 1 length. The demo slides (33 to 41) carry the live demo time, and slide 44 carries the 10 minutes for questions.

Frame and other slides:
- Slide 1: 0.5 min
- Slide 2: 1 min
- Slide 3: 0.25 min
- Slide 4: 0.75 min
- Slide 5: 0.5 min
- Slide 31: 0.25 min
- Slide 42: 0.5 min
- Slide 43: 0.5 min
- Slide 44: 10.25 min

## Sources, with the date read

All read 2026-10-12.

- Brief for this workshop, and the knowledge base binding rules.
- UpGuard, Cloud Leak: https://www.upguard.com/breaches/verizon-cloud-leak
- Pulumi docs, write your own policy packs: https://www.pulumi.com/docs/insights/policy/policy-packs/authoring/
- Pulumi docs, component resources: https://www.pulumi.com/docs/iac/concepts/components/
- Pulumi docs, ESC aws-login provider: https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/aws-login/
- Pulumi docs, policy overview and policy groups: https://www.pulumi.com/docs/insights/policy/ and https://www.pulumi.com/docs/insights/policy/policy-groups/
- AWS, S3 security best practices: https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html
- slidev-deck skill, pulumi/marketing-web `.agents/skills/slidev-deck/SKILL.md`, commit 9b37f9afe8c7b0d406f19bc9116b16d5689389ce
- Reference deck: pulumi/workshops `neo-in-a-docker-sandbox/slides`

## Deviations from the brief section 5

- The brief outline is a guide; the deck follows the workshop-deck skill (three acts inside the generated frame). The five questions come from the brief section 5 and the demo plan in section 4.
- Demo slides 34 to 38 each show one command (three lines at most), taken from the demo folder with the same flags. Slides 35 and 37 cover two demo steps and show only the command that proves the step. The deck has about 12 lines of commands and no program code, under the budget of 20.
- Step 11 (policy group) is optional. Two docs pages list different editions for policy groups: the policy groups page says Pro and Enterprise, the policy overview says Essentials, Pro and Enterprise. The slide says so; the pull request lists it as an open question.

## Binding rules

- Never edit the frame slides by hand; change `frame.json` and run `init --frame-only`.
- No program code on story or demo slides. No theme layout except `image`. No Mermaid.
- Names: Pulumi IaC, Pulumi ESC, Pulumi Policies, Pulumi Cloud, Pulumi Neo.
- No credentials, `node_modules/`, `dist/`, `export-pages/` or PDFs in a commit.
- Do not push, merge, or edit the brief.

## Fact-check

| Claim | Source | Date read | Outcome |
|---|---|---|---|
| Bucket was "fully downloadable and configured to allow public access" (quote, now opened with an ellipsis to match the source's lower case) | https://www.upguard.com/breaches/verizon-cloud-leak | 2026-10-12 | Confirmed, quote fixed |
| Found June 8, UpGuard notified Verizon June 13, closed June 22, 2017 | https://www.upguard.com/breaches/verizon-cloud-leak | 2026-10-12 | Confirmed |
| Up to 14 million US customers (UpGuard analysis) | https://www.upguard.com/breaches/verizon-cloud-leak | 2026-10-12 | Confirmed ("as many as 14 million") |
| Verizon said 6 million | https://www.upguard.com/breaches/verizon-cloud-leak | 2026-10-12 | Confirmed (page cites a Verizon spokesperson) |
| Bucket administered by an engineer at NICE Systems, a Verizon third-party vendor | https://www.upguard.com/breaches/verizon-cloud-leak | 2026-10-12 | Confirmed |
| Reachable by entering the S3 URL; "No exploit" | https://www.upguard.com/breaches/verizon-cloud-leak | 2026-10-12 | Reworded to "No hack needed" (source says "simply by entering the S3 URL") |
| SSE-S3 applied to all new objects since January 5, 2023, at no charge | https://docs.aws.amazon.com/AmazonS3/latest/userguide/default-encryption-faq.html | 2026-10-12 | Confirmed |
| Ownership controls, bucket owner enforced: ACLs disabled, bucket owner owns every object | https://docs.aws.amazon.com/AmazonS3/latest/userguide/about-object-ownership.html | 2026-10-12 | Confirmed |
| Block Public Access has four independent settings | https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html | 2026-10-12 | Confirmed |
| Versioning recovers from unintended deletes and overwrites | https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html | 2026-10-12 | Confirmed ("unintended user actions and application failures") |
| Lifecycle: NoncurrentVersionExpiration and AbortIncompleteMultipartUpload exist | https://docs.aws.amazon.com/AmazonS3/latest/userguide/intro-lifecycle-rules.html | 2026-10-12 | Confirmed |
| TLS-only: deny via aws:SecureTransport, which AWS recommends | https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html | 2026-10-12 | Confirmed |
| Enforcement levels advisory (warns), mandatory (blocks), remediate (fixes), disabled (off) | https://www.pulumi.com/docs/insights/policy/policy-packs/authoring/ | 2026-10-12 | Confirmed |
| Resource validation vs stack validation (validateStack sees all resources) | https://www.pulumi.com/docs/insights/policy/policy-packs/authoring/ | 2026-10-12 | Confirmed |
| --policy-pack flag runs a local pack on preview | https://www.pulumi.com/docs/insights/policy/policy-packs/authoring/ | 2026-10-12 | Confirmed |
| Pulumi Neo can generate policy pack content (mention only) | https://www.pulumi.com/docs/insights/policy/policy-packs/authoring/ | 2026-10-12 | Confirmed |
| Components: one resource with children nested under it | https://www.pulumi.com/docs/iac/concepts/components/ | 2026-10-12 | Confirmed |
| children set parent: this; dependsOn on the public access block | https://www.pulumi.com/docs/iac/guides/building-extending/components/build-a-component/ | 2026-10-12 | Confirmed (docs example does the same) |
| registerOutputs signals creation is complete; "or it stays in creating" | https://www.pulumi.com/docs/iac/guides/building-extending/components/build-a-component/ | 2026-10-12 | Narrowed: docs say it signals completion; the "stays in creating" part is not in the docs and was removed |
| ESC aws-login OIDC: short-lived OIDC token exchanged for temporary credentials, no long-lived keys | https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/aws-login/ | 2026-10-12 | Confirmed |
| BucketV2 and the V2 companions (versioning, lifecycle, encryption) are deprecated | https://www.pulumi.com/registry/packages/aws/api-docs/s3/bucketv2/ and the bucketversioningv2, bucketlifecycleconfigurationv2, bucketserversideencryptionconfigurationv2 pages | 2026-10-12 | Confirmed |
| Policy groups: Pro and Enterprise | https://www.pulumi.com/docs/insights/policy/policy-groups/ | 2026-10-12 | Confirmed; conflicts with the next row, stated on slides 28, 29, 41 |
| Policy overview: Essentials, Pro and Enterprise | https://www.pulumi.com/docs/insights/policy/ | 2026-10-12 | Confirmed; open question for the PR |
| Step 9 "costs less than a cent per participant" | none | 2026-10-12 | Not found, removed from the note |
| Slide 21 note: "we ran that in the demo code" (dependency visible at preview) | none this run | 2026-10-12 | Not verified, removed |
| Six companions, nine resources in 06 preview, ten in 08, six violations for a bare bucket | demo code: 06-secure-bucket/secureBucket.ts, 05-policy-pack/policy/index.ts | 2026-10-12 | Confirmed against code by reading it; not executed in this pass |
| Three policies, all mandatory, names s3-bucket-has-baseline, s3-public-access-block-all-on, s3-versioning-enabled | 05-policy-pack/policy/index.ts | 2026-10-12 | Confirmed against code |
| Lifecycle 30 days noncurrent, 7 days multipart; region eu-central-1; Node 22 | secureBucket.ts, 01-new-project/Pulumi.dev.yaml, README | 2026-10-12 | Confirmed against code |
| Slide 16: public access block first, the rest wait with dependsOn | 06-secure-bucket/secureBucket.ts | 2026-10-12 | Corrected: four companions depend on it, lifecycle depends on versioning |
| Step 10 runs six aws s3api reads and a plain HTTP upload; step 12 runs destroy, stack rm, list-buckets | 10-verify-controls/verify-controls.sh, 12-teardown/teardown.sh | 2026-10-12 | Confirmed against scripts |

Counts: 29 claim groups checked (about 55 individual statements). 23 confirmed as written, 4 corrected or narrowed (quote case, "No exploit", registerOutputs, dependsOn), 2 removed (cost per participant, "we ran that"). Not executed in this pass: the demo itself; code counts were verified by reading the code.
