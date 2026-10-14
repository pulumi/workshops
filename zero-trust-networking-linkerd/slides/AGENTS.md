# Workshop deck notes: zero-trust-networking-linkerd

## Story

1. The moment. The Kubernetes Network Policies concept page: "By default, a pod is non-isolated for ingress; all inbound connections are allowed." Egress is the same. Source: https://kubernetes.io/docs/concepts/services-networking/network-policies/ (read 2026-10-01). No incident is invented. The brief gave no incident, so the moment is the documented default.
2. The tension. "Inside the cluster, everything can talk to everything." / "And nobody can prove who is calling."
3. Why it is hard. Network policies match IPs, labels and namespaces, not cryptographic identity. Traffic is plaintext. Certificates by hand are toil, and a root CA is a secret someone has to create and store.
4. The questions. Six: who is calling, is it encrypted, where does the root of trust come from, who may call whom, where does this fall short, how do we prove it and tear it down.
5. The answers. Act 2 in order: proxies give workloads an identity and automatic mTLS (Linkerd); landscape and trade-off; Pulumi IaC declares the trust anchor, charts and policy; authentication versus authorization with Server, MeshTLSAuthentication and AuthorizationPolicy; limits.
6. The proof. The demo shows the SECURED edge, the policy objects, a 403 for an unknown client and a 200 for front, and answers the last question with teardown.

The brief had no separate story section for this deck, so the spine was built from the brief sections on the problem, the audience and the demo flow.

## Headlines

- Title: Zero-trust networking as code (frame)
- Speaker placeholder (frame)
- Housekeeping and Agenda (frame)
- Housekeeping (frame)
- Today's Agenda (frame)
- Kubernetes allows all traffic until you say otherwise — pattern: quote-card
- Inside the cluster, everything can talk to everything — pattern: big-statement
- Nobody can prove who is calling — pattern: big-statement
- Labels and IPs are claims, certificates are proof — pattern: compare
- Certificates by hand are toil, and the root is a secret — pattern: compare
- Six questions decide whether you can trust the network — pattern: card-grid
- Who is calling, and is it private? — pattern: section-opener
- A proxy next to every pod gives each workload an identity — pattern: flow
- Four projects cover this ground, and we use one — pattern: card-grid
- A 90-minute laptop workshop needs a mesh that joins a running cluster — pattern: compare
- Meshed pods talk mutual TLS without any code change — pattern: chain
- Two of six questions are answered — pattern: recap-grid
- Where does the root of trust come from? — pattern: section-opener
- The root of trust is a few resources in a Pulumi program — pattern: flow
- One program installs the chart, the CRDs and the policy — pattern: card-grid
- Three of six questions are answered — pattern: recap-grid
- Who may call whom? — pattern: section-opener
- mTLS proves who is calling; policy decides who may — pattern: compare
- Three small objects say who may reach the backend — pattern: flow
- Four of six questions are answered — pattern: recap-grid
- This setup has limits you should know about — pattern: card-grid
- Five of six questions are answered — pattern: recap-grid
- The cluster ends with a trust anchor, a mesh and a policy — pattern: chain
- The trust anchor and the chart are plain resources — pattern: solution-code
- Demo: Zero-trust networking as code (frame divider)
- What we are going to do — pattern: demo-overview
- 1 · A local cluster is the only prerequisite — pattern: demo-step
- 2 · The trust anchor is created with no cluster resources — pattern: demo-step
- 3 · The control plane starts from those certificates — pattern: demo-step
- 4 · One namespace annotation puts a proxy in every pod — pattern: demo-step
- 5 · The edges show front to backend as secured — pattern: demo-step
- 6 · Policy objects exist, and front still gets through — pattern: demo-checks
- 7 · An unknown client gets a 403, front still gets a 200 — pattern: demo-outcome
- 8 · Teardown removes everything in reverse order — pattern: demo-outcome
- Resources (frame)
- Continue your Pulumi journey! (frame)
- Thank you / Questions? (frame)

## Sources

All read 2026-10-01 unless noted.

- https://kubernetes.io/docs/concepts/services-networking/network-policies/
- https://linkerd.io/2.19/features/automatic-mtls/
- https://linkerd.io/2.19/features/server-policy/
- https://linkerd.io/2.19/reference/authorization-policy/
- https://linkerd.io/2.19/features/proxy-injection/
- https://linkerd.io/2.19/reference/cli/check/
- https://linkerd.io/2.19/tasks/install-helm/
- https://linkerd.io/2.19/tasks/manually-rotating-control-plane-tls-credentials/
- https://linkerd.io/releases/
- https://istio.io/latest/docs/ambient/overview/
- https://docs.cilium.io/en/stable/network/servicemesh/mutual-authentication/mutual-authentication/
- https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v4/chart/
- https://www.pulumi.com/registry/packages/tls/api-docs/selfsignedcert/
- https://www.pulumi.com/docs/iac/concepts/secrets/
- slidev-deck skill source (pulumi/marketing-web, .agents/skills/slidev-deck) read through the pointer skill; commit read 9b37f9afe8c7b0d406f19bc9116b16d5689389ce


## Fact-check

Read 2026-10-01. Results: Verified / Corrected / Removed.

| Claim | Source | Read | Result |
|---|---|---|---|
| Quote: 'By default, a pod is non-isolated for ingress; all inbound connections are allowed.' | https://kubernetes.io/docs/concepts/services-networking/network-policies/ | 2026-10-01 | Verified |
| Egress: all outbound connections allowed by default | https://kubernetes.io/docs/concepts/services-networking/network-policies/ | 2026-10-01 | Verified |
| Network policy selects by pod labels, namespaces, IP blocks | https://kubernetes.io/docs/concepts/services-networking/network-policies/ | 2026-10-01 | Verified |
| Linkerd applies mTLS to all TCP traffic between meshed pods | https://linkerd.io/2.19/features/automatic-mtls/ | 2026-10-01 | Verified |
| Proxy injection by linkerd.io/inject: enabled on a namespace or workload | https://linkerd.io/2.19/features/proxy-injection/ | 2026-10-01 | Verified |
| Policy-denied HTTP traffic gets a 403 from the proxy | https://linkerd.io/2.19/features/server-policy/ | 2026-10-01 | Verified |
| Default inbound policy can be set to deny | https://linkerd.io/2.19/features/server-policy/ | 2026-10-01 | Verified |
| Server, AuthorizationPolicy, MeshTLSAuthentication objects | https://linkerd.io/2.19/reference/authorization-policy/ | 2026-10-01 | Verified |
| linkerd check validates the install | https://linkerd.io/2.19/reference/cli/check/ | 2026-10-01 | Verified |
| Two charts: linkerd-crds, then linkerd-control-plane; identityTrustAnchorsPEM value | https://linkerd.io/2.19/tasks/install-helm/ | 2026-10-01 | Verified |
| Destination service and proxy injector are control plane components | https://linkerd.io/2.19/reference/architecture/ | 2026-10-01 | Verified |
| Linkerd documents certificate rotation | https://linkerd.io/2.19/tasks/manually-rotating-control-plane-tls-credentials/ and .../automatically-rotating-control-plane-tls-credentials/ | 2026-10-01 | Verified |
| Edge release 26.6.3 exists; chart pinned 2026.6.3 (pin matches 03-control-plane/index.ts) | https://linkerd.io/releases/ | 2026-10-01 | Verified |
| Istio ambient: ztunnel and CNI update | https://istio.io/latest/docs/ambient/overview/ | 2026-10-01 | Verified |
| Cilium mutual authentication is beta and uses SPIFFE | https://docs.cilium.io/en/stable/network/servicemesh/mutual-authentication/mutual-authentication/ | 2026-10-01 | Verified |
| k8s.helm.v4.Chart exists | https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v4/chart/ | 2026-10-01 | Verified |
| tls.SelfSignedCert has isCaCertificate | https://www.pulumi.com/registry/packages/tls/api-docs/selfsignedcert/ | 2026-10-01 | Verified |
| Pulumi encrypts secrets in state; issuer key in state needs care | https://www.pulumi.com/docs/iac/concepts/secrets/ | 2026-10-01 | Verified |
| Step 7: front prints 'HTTP/1.1 200' | 07-deny-in-action/run-deny-demo.sh (script prints first HTTP/ line of wget; version not knowable unrun) | 2026-10-01 | Corrected (now 'HTTP 200') |
| Step 5 notes: pulumi up then script | 05-mtls-proof/wait-for-control-plane.sh, verify-mtls.sh | 2026-10-01 | Corrected (wait script, then pulumi up, then verify-mtls.sh) |
| Step 5 slide: 'folder first installs viz chart with pulumi up' | same | 2026-10-01 | Corrected (wording) |
| Step 8: stacks 06,05,04,03,02 destroyed, then kind delete cluster | 08-teardown/teardown.sh | 2026-10-01 | Verified |
| A proxy that several meshes build on (Envoy) | https://istio.io/latest/docs/ambient/overview/ | 2026-10-01 | Corrected |
