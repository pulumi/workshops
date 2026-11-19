# AGENTS.md: the deck's brief and sources

This file records what the deck was asked to be and which sources it was built from. Conventions for the whole workshop folder are in `../AGENTS.md`.

## The workshop

"Certificate and PKI lifecycle as code with cert-manager, AWS Private CA and Vault PKI". 105 minutes: about 40 minutes of talk, 55 minutes of demo, 10 minutes of questions. Event page, session dates and speakers are not known yet: the speaker slide is a placeholder (see `frame.json`). Brief: workspace document 31fd37a0-4f53-453e-a760-8dec76948de6.

## Story

1. The moment. The U.S. House Oversight Committee report on the Equifax breach (December 2018): the device that monitored traffic to the breached web application "had been inactive for 19 months due to an expired security certificate", and Equifax let over 300 security certificates expire. Source: https://oversight.house.gov/wp-content/uploads/2018/12/Equifax-Report.pdf (read 2026-10-24). The brief §2 had no sourced moment, so it was found this run.
2. The tension. Certificates get shorter lived (public TLS goes from 398 days to 47 by March 2029, CA/Browser Forum ballot SC-081v3), and each team still keeps its own CA, script and reminder.
3. Why it is hard. A date passes and nothing fails loudly. A calendar reminder works until the person who wrote the script leaves. Expiry is one of four ways a certificate estate fails.
4. The questions. Who is the CA and where does its key live. How does a pod get a certificate without a ticket. What renews it, and when. How do I know it failed to renew. Where do the credentials live. How do 20 teams do this the same way.
5. The answers. Two CAs (AWS Private CA, Vault PKI); a cert-manager Certificate that becomes a Secret; duration and renewBefore; a CloudWatch alarm and a PrometheusRule; Pulumi ESC; a Pulumi component. One section per question, in that order.
6. The proof. The demo builds both CAs on EKS, issues and force-renews a certificate, raises the alarm, and ends with one component serving both issuers. The close shows all six questions answered.

The story spine was built from the brief §1 to §3 and §7 plus the demo folder.

## Headlines

1. An expired certificate blinded Equifax for 19 months (quote-card)
2. Private certificates expire on a calendar nobody owns (big-statement)
3. Public certificate lifetimes fall from 398 days to 47 (compare)
4. Each team keeps its own CA, script and reminder (compare)
5. A certificate estate fails in four ways (card-grid)
6. Six questions before you trust a private PKI (card-grid)
7. Section: who is the CA (section-opener)
8. AWS Private CA keeps the key managed, Vault PKI keeps it yours (compare)
9. A root CA signs a subordinate CA, and the issuer uses the subordinate (stack)
10. Section: how a pod gets a certificate (section-opener)
11. A Certificate resource becomes a Secret on its own (flow)
12. Each issuer proves itself to its CA in its own way (compare)
13. Section: what renews it (section-opener)
14. cert-manager renews a certificate before it expires (flow)
15. Three questions covered, three to go (recap-grid)
16. Section: how I know it failed (section-opener)
17. Four signals watch one certificate (stack)
18. The expiry metric updates twice a day (big-statement)
19. Section: where credentials live (section-opener)
20. Pulumi ESC hands the AWS login to the stack (flow)
21. Section: how many teams do it the same way (section-opener)
22. A component turns issuer, certificate and alarm into one resource (compare)
23. Where this breaks today (card-grid)
24. One Pulumi stack per step builds two CAs, a cluster and an alarm (stack)
25. A new certificate is one component call (stack)
26. What we are going to do (demo-overview)
27. The AWS login comes from Pulumi ESC (demo-step)
28. The cluster has two Ready nodes (demo-step)
29. Both CAs report ACTIVE (demo-step)
30. The AWS issuer is Ready (demo-step)
31. The first certificate names the Private CA as issuer (demo-step)
32. The second issuer is Vault PKI (demo-step)
33. A renewal changes the serial number (demo-step)
34. One preview shows no diff (demo-step)
35. Six questions, six answers (recap-grid)

## Open items for later passes

- Humanizer pass, fact-check pass and PNG export are separate steps and were not part of this build.
- Speaker, event page and QR code are placeholders or absent: no event URL is known.
- Demo caveats carried into the speaker notes: unverified ACM PCA template ARNs, general-purpose CA mode only, DaysToExpiry updates twice a day (alarm state is forced), cmctl flags unverified, previews for steps 01, 02 and 04 hung offline and steps 05 to 08 were not run live.


## Fact-check

Read 2026-10-24. Confidence: medium to high. Every claim below was checked against a page read in this run.

| claim | slide | source URL | date read | result |
|---|---|---|---|---|
| Quote: monitoring device inactive 19 months due to expired security certificate | 6 | https://oversight.house.gov/wp-content/uploads/2018/12/Equifax-Report.pdf | 2026-10-24 | confirmed (exact wording) |
| Over 300 security certificates allowed to expire | 6 | same | 2026-10-24 | confirmed (report adds 79 for monitoring business critical domains) |
| Certificate renewed July 29, 2017 and suspicious traffic noticed at once | 6 | same | 2026-10-24 | confirmed |
| Report dated December 2018; device monitored ACIS traffic | 6 | same (URL path 2018/12) | 2026-10-24 | corrected: bullet said device sat on the path; now says it monitored traffic for the ACIS web application |
| Public TLS max validity 398 to 47 days, March 2026 to March 2029 (SC-081v3) | 8, notes | https://cabforum.org/2025/04/11/ballot-sc081v3-introduce-schedule-of-reducing-validity-and-data-reuse-periods/ | 2026-10-24 | confirmed |
| Steps 200 days (2026-03-15), 100 (2027-03-15), 47 (2029-03-15) | 8 notes | https://www.theregister.com/security/2025/04/14/ssl/tls-certificates-will-last-47-days-max-by-2029/463450 | 2026-10-24 | confirmed; added to notes |
| 'Today: up to 398 days' | 8 | same | 2026-10-24 | corrected: 200 days applies since 2026-03-15, so the column now reads 'Until March 2026' |
| Ballot does not bind private CAs | 8 notes | https://cabforum.org (ballot scope is publicly trusted TLS) | 2026-10-24 | confirmed by scope text; kept as stated opinion |
| AWS Private CA fee: $400 general-purpose, $50 short-lived per CA per month | 13 notes | https://aws.amazon.com/private-ca/pricing/ | 2026-10-24 | confirmed |
| Short-lived mode not implemented in the demo | 13 notes | demo folder 03-private-ca | 2026-10-24 | confirmed |
| Billing continues during the deletion window | 28 notes | https://aws.amazon.com/private-ca/pricing/ | 2026-10-24 | corrected: pricing page says no charge after deletion, only for restoration time; claim removed |
| AWS Private CA is managed; key held by AWS | 13 | https://docs.aws.amazon.com/privateca/latest/userguide/PCADeleteCA.html | 2026-10-24 | partially supported (managed service confirmed, key custody wording not stated on pages read); kept as the brief's framing, see open questions |
| aws-privateca-issuer plugin from cert-manager project; AWSPCAClusterIssuer; EC2 role or IRSA | 13, 14, 17 | https://github.com/cert-manager/aws-privateca-issuer | 2026-10-24 | confirmed |
| cert-manager Vault issuer: token, AppRole, Kubernetes auth | 17 | https://cert-manager.io/docs/configuration/vault/ | 2026-10-24 | confirmed |
| Docs example: 90 days duration, renews 15 days before expiry | 19 | https://cert-manager.io/docs/usage/certificate/ | 2026-10-24 | confirmed (2160h / 360h) |
| Chart pins cert-manager v1.21.2, aws-privateca-issuer v1.11.0, Vault chart 0.34.1 | 36, 38 | https://artifacthub.io/packages/helm/cert-manager/cert-manager ; https://github.com/cert-manager/aws-privateca-issuer/releases ; https://github.com/hashicorp/vault-helm/releases | 2026-10-24 | confirmed (versions exist; newer patch releases 1.21.3 and 1.11.1 also exist) |
| ACM DaysToExpiry published twice per day | 23 | https://docs.aws.amazon.com/acm/latest/userguide/cloudwatch-metrics.html | 2026-10-24 | confirmed |
| cert-manager exposes certificate expiration timestamp metric | 22 | https://pkg.go.dev/github.com/cert-manager/cert-manager/pkg/metrics | 2026-10-24 | corrected: name listed on pkg.go.dev, not on cert-manager.io metrics page; note updated |
| ESC aws-login uses OIDC | 25 | https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/aws-login/ | 2026-10-24 | confirmed |
| pulumi env open ... --format json | 33 | https://www.pulumi.com/docs/iac/cli/commands/pulumi_env_open/ | 2026-10-24 | confirmed |
| cmctl renew <name> --namespace | 39 | https://cert-manager.io/docs/reference/cmctl/ | 2026-10-24 | confirmed (renew documented; script not run live) |
| PkiCertificate adds alarm when ACM ARN and topic ARN given; component call matches step 08 | 27, 30 | demo 08-pki-component/pki-certificate.ts and index.ts | 2026-10-24 | confirmed against demo |
| Slide commands 33 to 40 match demo steps 01 to 08 | 33-40 | demo folder re-diffed 2026-10-24 | 2026-10-24 | confirmed |
| Components group resources into one resource | 27 | https://www.pulumi.com/docs/iac/concepts/components/ | 2026-10-24 | confirmed |
| ACTIVE CA must be disabled before deletion; status DELETED during restore window | 41 notes | https://docs.aws.amazon.com/privateca/latest/userguide/PCADeleteCA.html | 2026-10-24 | confirmed; open question on teardown script (see below) |

### Open questions

1. teardown.sh and the README say a Private CA is billed until the deletion window ends. The AWS pricing page says there is no charge after deletion. The slides no longer repeat the claim; the demo owner should decide which wording is right.
2. teardown.sh destroys with pulumi destroy only. AWS docs say an ACTIVE CA must be disabled before deletion. Not verified whether the Pulumi provider disables it first.
3. Slide 13 says AWS holds the key for AWS Private CA. The pages read do not state key custody in those words.
4. README says a third certificate needs 5 lines; step 08 call has 7. Slide 30 says seven.
