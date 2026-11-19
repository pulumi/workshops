# Slides: Access governance as code

Working rules and story for the deck in this folder. Written 2026-10-02.

## Workshop

Access governance as code: BigQuery, Secret Manager and service-account bindings without console clicks. Folder `policy-access-governance-as-code/`, Python demo in `01-gcp` to `05-teardown`, 90-minute slot (brief allows 60 to 90).

## Original request

Brief first: workshop brief document a421ffd0-3cc5-4840-8625-fa65d9eb8c16 (Pulumi workspace, read-only). Audience: cloud platform and security engineers, intermediate. Promise: provision a least-privilege access model as code across two clouds, see the diff of a proposed IAM change before it applies, watch a policy check block an over-broad binding. Speakers, dates and event page are unknown, so the deck carries one placeholder speaker and no event link.

## Story

1. **The moment.** Capital One's 2019 cyber incident. Its own page says the "configuration vulnerability" was reported through its Responsible Disclosure Program on July 17, 2019, and that the event "affected approximately 100 million individuals in the United States and approximately 6 million in Canada". The US Department of Justice case summary says "The intrusion occurred through a misconfigured web application firewall that enabled access to the data." Neither source says the role behind it was over-broad IAM, so the deck must not say that. It says a configuration nobody diffed.
2. **The tension.** "You can diff the application." / "You can't diff the console."
3. **Why it is hard.** Console IAM changes leave no diff and no review point; an over-broad grant works silently until it is used. Contrast: console grant (clicked, undiffable, unaudited) against the same grant in code (reviewed in `pulumi preview`, checked by a policy pack).
4. **The questions.** (1) Where does each grant live? (2) What changes before it applies? (3) Is it the same on both clouds? (4) What counts as too broad? (5) Does it really stop before anything changes?
5. **The answers.** Q1: the resource types `gcp.bigquery.DatasetIamMember`, `gcp.secretmanager.SecretIamMember`, `gcp.serviceaccount.IAMMember` (Pulumi IaC). Q2: `pulumi preview` (Pulumi IaC, Pulumi Cloud update history only if the docs confirm it). Q3: `aws.iam.Role` and `aws.iam.RolePolicy`. Q4: a Python policy pack with four rules (Pulumi Policies). Q5 is left to the demo.
6. **The proof.** Demo step 6: widening the service account to project-level Owner makes `pulumi up --policy-pack` fail with a violation and nothing applies. It answers question 5 last.

## Headlines

Slides 1 to 40, with pattern and minute budget. Total 90.0 minutes. Act 3 (demo overview and steps) is 8 of 40 slides.

1. Title (frame) — pattern: frame — 0.5 min
2. Speaker: placeholder (frame) — pattern: frame — 1 min
3. Housekeeping and Agenda (frame) — pattern: frame — 0.25 min
4. Housekeeping (frame) — pattern: frame — 0.75 min
5. Today's Agenda (frame) — pattern: frame — 0.5 min
6. A leaked-data incident began with a configuration nobody diffed — pattern: quote-card — 2.5 min
7. You can diff the application. — pattern: big-statement — 1 min
8. You can't diff the console. — pattern: big-statement — 1 min
9. Console IAM leaves no diff and no audit trail; IAM as code leaves both — pattern: compare — 2.5 min
10. An over-broad grant stays invisible until someone uses it — pattern: big-statement — 1.5 min
11. Five questions decide whether you can trust access you did not click — pattern: card-grid — 2 min
12. Grants belong on the resource that needs them — pattern: section-opener — 0.5 min
13. Dataset, secret and service account each get their own binding type — pattern: stack — 2 min
14. The casing differs on purpose: IAMMember against IamMember — pattern: compare — 2 min
15. A project-level role reaches everything in the project — pattern: boundaries — 2 min
16. The diff is the review — pattern: section-opener — 0.5 min
17. pulumi preview shows the access change before it applies — pattern: flow — 2.5 min
18. The same diff becomes the audit record — pattern: chain — 2 min
19. Two questions covered, three to go — pattern: recap-grid — 1 min
20. AWS gets the same shape — pattern: section-opener — 0.5 min
21. An AWS role scoped to one action set mirrors the GCP binding — pattern: compare — 2 min
22. Too broad needs a definition the machine can check — pattern: section-opener — 0.5 min
23. A policy pack runs on every preview and every update — pattern: flow — 2 min
24. Four rules cover the over-broad cases — pattern: card-grid — 2.5 min
25. Where this breaks today: a pack checks what Pulumi manages, not what already exists — pattern: compare — 2 min
26. Four questions answered, one to go — pattern: recap-grid — 1 min
27. The access model we will build spans two clouds and one gate — pattern: zones — 2 min
28. The program is a handful of binding resources — pattern: flow — 1.5 min
29. Demo: Access governance as code (frame divider) — pattern: frame — 0.25 min
30. What we are going to do — pattern: demo-overview — 2 min
31. Step 1: one dataset, one narrow binding — pattern: demo-step — 6 min
32. Step 2: the secret is readable by one principal — pattern: demo-step — 5 min
33. Step 3: the service account carries one role, not the project — pattern: demo-step — 5 min
34. Step 4: the AWS role can do one thing — pattern: demo-step — 6 min
35. Step 5: the policy pack passes its own tests — pattern: demo-checks — 7 min
36. Step 6: the widened binding is blocked before anything changes — pattern: demo-outcome — 7 min
37. Step 7: nothing is left in either cloud — pattern: demo-step — 3 min
38. Resources (frame) — pattern: frame — 1 min
39. Continue your Pulumi journey! (frame) — pattern: frame — 0.25 min
40. Thank you / Questions? (frame) — pattern: frame — 7.5 min

Counts: frame 9 slides (5 opening, divider, 3 closing), Act 1 6, Act 2 15, solution 2, Act 3 8. Not yet in the deck: the brief's internal usage-growth figures and conference session counts. Both are internal or aggregate-only material and the deck is public, so they stay out.

Code budget: program code on slide 28 only (ten lines at most); one command per demo slide, three lines at most; twenty lines of code and commands in total.

## Demo commands (copy exactly)

From the demo README: `pulumi config set step N && pulumi preview && pulumi up` in `01-gcp`; proving commands `bq show --format=prettyjson access_demo | grep -A3 dataViewer`, `gcloud secrets get-iam-policy access-demo-secret`, `gcloud iam service-accounts get-iam-policy access-demo-runner@<your-project-id>.iam.gserviceaccount.com`; step 6 `04-widen/widen.sh` (runs `pulumi up --yes --policy-pack ../03-policy` after `pulumi config set widen true`); step 7 `05-teardown/destroy.sh`.

## Sources

Brief section 8 (dates read in the brief): the three gcp registry pages and policy docs, 2026-09-22; Pulumi CLI 3.263.0 per brief, README says tested with 3.267.0 (flag in the pull request). Read this run, 2026-10-02:

- https://www.capitalone.com/digital/facts2019/ (Capital One, 2019 Cyber Incident: what happened)
- https://www.justice.gov/usao-wdwa/united-states-v-paige-thompson (DOJ case summary)
- https://www.pulumi.com/docs/insights/policy/policy-packs/authoring/ (opened for frame.json)
- https://www.pulumi.com/registry/packages/gcp/api-docs/bigquery/datasetiammember/ (opened)
- https://cloud.google.com/iam/docs/using-iam-securely (opened)

## Binding rules

- Pattern deck: every story and demo slide comes from `deck_frame.py patterns`; no theme layout except `image`; no Mermaid; icon-list text inside one `<span>`; `zoom-content` 1.2 to 1.8.
- Do not edit `frame.json` headmatter or `style.css`; frame slides change through `frame.json` and `init --frame-only`.
- Names: Pulumi IaC, Pulumi Policies, Pulumi Cloud, Pulumi console. The older "CrossGuard" name is not used as a product name on slides.
- Never name a customer. No internal aggregate figures on slides.
- The brief's slide outline (14 items) is a short list; this deck follows the workshop-deck skill's three-act structure instead, and the pull request says so.

## Skills

marketing-web slidev-deck skill read 2026-10-02 at commit 9b37f9afe8c7b0d406f19bc9116b16d5689389ce (`pulumi/marketing-web`, path `.agents/skills/slidev-deck`).

## Fact-check

Not yet run. Claims to verify against docs read this run: each resource type name and casing, the four policy rules against `03-policy/rules.py`, `pulumi preview` and policy-pack flags, anything said about Pulumi Cloud history, the Capital One quotes above.

## Fact-check

Run 2026-10-02, separate pass after drafting. Sources opened this run: Capital One 2019 facts page and the DOJ case summary (read earlier this run), Pulumi policy authoring docs, policy groups docs, pulumi preview CLI reference, pulumi stack history CLI reference, state and backends docs, Pulumi registry page for gcp.bigquery.DatasetIamMember, Google Cloud "Using IAM securely", and the demo folder code and README.

Counts: 34 claims checked; 33 confirmed, 1 changed, 0 removed, 0 unverified left.

Changes made:
- Slide 18: "one update with a time and a result" became "one update you can list". The history command reference only says it shows data about previous updates.
- Slide 18 makes no audit-trail claim; the speaker note points to cloud audit logs for that. The brief's CrossGuard wording is replaced by Pulumi Policies.
- Slide 6 does not say IAM caused the incident; both sources name a misconfiguration (a firewall, per the DOJ).

Not checked against a live run: step outputs (no live GCP or AWS run; see the pull request).
