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
14. cert-manager renews before expiry, not after (flow)
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
