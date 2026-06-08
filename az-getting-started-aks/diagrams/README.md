# Demo diagrams

Keynote-style architecture diagrams for the live demo — pull these up full-screen
as you hit each stage in `DEMO.md`. They mirror the slide deck so the screen-share
stays consistent whether you're on slides or in the editor.

| File | Show when | Shows |
|------|-----------|-------|
| `00-overview-what-were-building.png` | Top of demo / "what we're building" | Whole arc: program → AKS + ACR → cat app → public IP → cats |
| `01-cluster.png` | Stage 1 (`pulumi up` #1, the 5-min wait) | Program → Resource Group (AKS Cilium + ACR, AcrPull) → kubeconfig → k8s provider |
| `02-app.png` | Stage 2 (the payoff) | Provider → Cat Deployment (image from ACR) → LoadBalancer → Public IP → browser |
| `03-split.png` | Stage 3 (stretch) | Cluster Project / stack-output kubeconfig / Workload Project runs on AKS |
| `04-split-yaml.png` | Stage 4 (stretch) | Cat YAML → Pulumi ConfigFile → Workload Project → AKS |
| `05-gitops.png` | Stage 5 (take-home) | Pulumi builds cluster + bootstraps Flux; Git repo → Flux reconciles app |
| `pulumi-iac-model.png` | "How Pulumi works" aside | Program + Pulumi Cloud (state/secrets) → engine → Azure CRUD |

Source: `~/para/projects/aks-azure-workshop/presentation/slides.iapresenter/assets/`.
Regenerate via the nano-banana / mermaid-excalidraw passes documented in that project.
