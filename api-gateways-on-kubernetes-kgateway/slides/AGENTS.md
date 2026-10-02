# Slides: API Gateways on Kubernetes with kgateway

## Story
1. **The moment.** Kubernetes blog, "Ingress NGINX Retirement: What You Need to Know" (2025-11-11 per its URL; the page is a mirror of the kubernetes.dev original dated 12 Nov, and shows no byline): best-effort maintenance until March 2026, then no releases, bugfixes or security updates. https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/ (read 2026-10-02).
2. **The tension.** "Existing installs keep working." / "Nobody will patch the next flaw."
3. **Why it is hard.** The annotation flexibility that made Ingress useful became the security debt (the post's own words about snippet annotations). Compare: yesterday's flexibility vs today's technical debt.
4. **The questions.** Six questions about moving off Ingress (card-grid, slide 5 of Act 1).
5. **The answers.** Gateway API roles and resources, kgateway as controller (Envoy data plane), Pulumi IaC as the declaration, with limits stated in "Where this breaks today".
6. **The proof.** Demo: kind cluster, controller chart, GatewayClass, Gateway, two backends, path and header routing, teardown.

## Workshop info
90 minutes. Speakers unknown (one placeholder). Sessions and event page unknown.

## Inputs by authority
Brief (doc 992e56c6-f80a-419e-b4d9-ea4a5d8c3aec) first, then the demo folders at d175024, then docs read 2026-10-02.

## Structure and minutes
Frame 5 slides + Act 1 and 2 + solution + demo + closing; notes carry budgets and sum to 90 (Q&A absorbs the remainder).

## Sources (read 2026-10-02)
Kubernetes Gateway docs, Ingress docs, kgateway overview, Ingress NGINX retirement post. Pulumi registry page opened for the resource link.

## Deviations
Demo not run on a live kind cluster; slides show commands copied from the demo folders. Speaker is a placeholder.

## Rules
Frame comes from deck_frame.py only. Pattern markup, no theme layouts except image, no Mermaid. Code budget: 20 lines total.

marketing-web slidev-deck skill commit: 9b37f9afe8c7b0d406f19bc9116b16d5689389ce

## Headlines
1. An ingress controller was retired, and clusters still run it (pattern: quote-card)
2. Existing installs keep working (pattern: big-statement)
3. Nobody will patch the next flaw (pattern: big-statement)
4. Flexibility became the vulnerability (pattern: compare)
5. Six questions decide whether you can move off Ingress (pattern: card-grid)
6. What replaces Ingress. (pattern: section-opener)
7. Three roles own three resources (pattern: chain)
8. Header matching moves from annotations into the spec (pattern: compare)
9. One API, many implementations (pattern: big-statement)
10. What moves the traffic. (pattern: section-opener)
11. kgateway translates Gateway API resources into Envoy configuration (pattern: zones)
12. A request is matched on host, path and header, then forwarded (pattern: flow)
13. Four questions covered, two to go (pattern: recap-grid)
14. Pulumi IaC declares it. (pattern: section-opener)
15. Pulumi installs the controller as a chart and declares the routes as custom resources (pattern: zones)
16. Where this breaks today (pattern: card-grid)
17. Five questions covered, one to go (pattern: recap-grid)
18. The demo ends with one Gateway in front of two apps (pattern: chain)
19. A route is a custom resource in the same program as the Gateway (pattern: big-code)
20. What we are going to do (pattern: demo-overview)
21. The controller runs in its own namespace (pattern: demo-step)
22. A GatewayClass points at kgateway (pattern: demo-step)
23. The Gateway gets an address (pattern: demo-step)
24. Two backends answer with their own name (pattern: demo-checks)
25. Paths split traffic to the right app (pattern: demo-step)
26. A header decides the backend (pattern: demo-outcome)
27. Teardown leaves nothing behind (pattern: demo-step)

Gate: `deck_frame.py check` 24/24, code lines 19.

## Fact-check
Separate pass after drafting, sources opened 2026-10-02.
- Retirement post (kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/): best-effort until March 2026, no releases/bugfixes/security updates, existing installs not broken, artifacts stay available, one or two maintainers after hours, snippets annotations, "insurmountable technical debt" quote, label-selector check command. Confirmed. Removed the unsupported "controller most of us copied from a tutorial"; replaced with the post's "example implementation" and popularity. Dropped the author name: no byline on the page.
- Kubernetes Gateway docs (kubernetes.io/docs/concepts/services-networking/gateway/) and Ingress docs: role-oriented roles, resource model, one GatewayClass per Gateway, header matching and weighting needing custom annotations on Ingress, conformance, no Ingress kind and one-time conversion, request flow with Host header, Ingress API frozen. Confirmed.
- kgateway docs (kgateway.dev/docs/envoy/latest/about/overview/, install/helm, setup/default): control plane implementing Gateway API for microservices and AI workloads, Envoy proxy, kgateway-system namespace, kgateway GatewayClass created at install, controllerName kgateway.dev/kgateway, CRDs applied separately. Confirmed. Sandbox status confirmed on the kgateway.dev footer.
- Pulumi registry (Helm Release and apiextensions CustomResource pages opened). Confirmed that both resources exist. The claim "kind has no Pulumi provider" could not be verified and was reworded to what the demo does (a command resource).
- Counts: 31 claims checked. 28 confirmed as written, 2 corrected (kind wording on slide and note), 1 removed (the tutorial claim, replaced by sourced wording).
- Humanizer pass: removed a "not X but Y" closer in the slide 9 note and a weak intensifier; no em dashes remain.
- marketing-web slidev-deck SKILL.md re-read via gh api (raw), commit 9b37f9afe8c7b0d406f19bc9116b16d5689389ce, unchanged since the first read.
