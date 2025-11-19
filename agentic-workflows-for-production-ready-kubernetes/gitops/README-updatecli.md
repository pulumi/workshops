# UpdateCLI - Manual Helm Chart Updates

This directory contains the UpdateCLI configuration for manually checking and updating Helm charts used in the GitOps workflow.

## Overview

UpdateCLI monitors the following Helm charts and can update them to their latest versions:

- **ArgoCD**: `oci://ghcr.io/argoproj/argo-helm/argo-cd`
  - File: `gitops/spoke/argocd/argocd-app.yaml`
  - Current version field: `spec.sources[0].targetRevision`

- **ArgoCD Apps**: `oci://ghcr.io/argoproj/argo-helm/argocd-apps`
  - File: `gitops/spoke/argocd/argocd-apps-app.yaml`
  - Current version field: `spec.sources[0].targetRevision`

- **Kyverno**: `https://kyverno.github.io/kyverno/`
  - File: `gitops/spoke/kyverno/kyverno-app.yaml`
  - Current version field: `spec.sources[0].targetRevision`

## Installation

### macOS
```bash
brew install updatecli/updatecli/updatecli
```

### Linux
```bash
curl -sSL https://github.com/updatecli/updatecli/releases/latest/download/updatecli_Linux_amd64.tar.gz | tar -xz -C /usr/local/bin
```

### Docker
```bash
docker pull updatecli/updatecli:latest

# Create alias for convenience
alias updatecli='docker run --rm -v $(pwd):/workspace -w /workspace updatecli/updatecli:latest'
```

## Usage

### 1. Check for Available Updates (Dry Run)

See what updates are available without making any changes:

```bash
updatecli diff --config gitops/updatecli.yaml
```

**Example output:**
```
SOURCES:
────────
argocd
├── Current: 9.1.3
└── Latest: 9.2.0

argocd-apps
├── Current: 2.0.2
└── Latest: 2.0.3

kyverno
├── Current: 3.2.5
└── Latest: 3.3.0

TARGETS:
────────
✓ argocd-spoke: gitops/spoke/argocd/argocd-app.yaml needs update (9.1.3 → 9.2.0)
✓ argocd-apps-spoke: gitops/spoke/argocd/argocd-apps-app.yaml needs update (2.0.2 → 2.0.3)
✓ kyverno-spoke: gitops/spoke/kyverno/kyverno-app.yaml needs update (3.2.5 → 3.3.0)
```

### 2. Apply Updates Locally (Without Git/PR)

Update the files directly without creating a pull request:

```bash
updatecli apply --config gitops/updatecli.yaml --disable-scm
```

This will:
- ✅ Check for latest versions
- ✅ Update the YAML files in place
- ✅ Skip Git commit and PR creation

### 3. Apply Updates with Pull Request

To create a pull request with the updates:

```bash
# Set GitHub credentials
export UPDATECLI_GITHUB_TOKEN="your-github-token"
export UPDATECLI_GITHUB_ACTOR="your-username"
export UPDATECLI_GITHUB_OWNER="dirien"
export UPDATECLI_GITHUB_REPOSITORY="workshops"

# Run UpdateCLI
updatecli apply --config gitops/updatecli.yaml
```

This will:
- ✅ Check for latest versions
- ✅ Update the YAML files
- ✅ Create a Git commit
- ✅ Push to a new branch
- ✅ Create a pull request

## Quick Commands

### Check Current Versions
```bash
# ArgoCD
grep targetRevision gitops/spoke/argocd/argocd-app.yaml

# ArgoCD Apps
grep targetRevision gitops/spoke/argocd/argocd-apps-app.yaml

# Kyverno
grep targetRevision gitops/spoke/kyverno/kyverno-app.yaml
```

### View UpdateCLI Plan
```bash
updatecli show --config gitops/updatecli.yaml
```

### Update Specific Chart Only

Create a temporary config for a single chart:

```bash
# Just ArgoCD
updatecli apply --config gitops/updatecli.yaml --target argocd-spoke --disable-scm

# Just ArgoCD Apps
updatecli apply --config gitops/updatecli.yaml --target argocd-apps-spoke --disable-scm

# Just Kyverno
updatecli apply --config gitops/updatecli.yaml --target kyverno-spoke --disable-scm
```

## Verification

After updating, verify the changes:

```bash
# Show what changed
git diff gitops/spoke/

# Test the ArgoCD app syntax
kubectl apply --dry-run=client -f gitops/spoke/argocd/argocd-app.yaml
kubectl apply --dry-run=client -f gitops/spoke/argocd/argocd-apps-app.yaml
kubectl apply --dry-run=client -f gitops/spoke/kyverno/kyverno-app.yaml
```

## Configuration Details

### UpdateCLI Manifest Structure

The `updatecli.yaml` file contains:

1. **Sources** - Where to check for new versions
2. **Conditions** - Validation before updating
3. **Targets** - What files to update
4. **Actions** - What to do after updating (PR creation, etc.)

### Adding More Charts

To monitor additional Helm charts, edit `updatecli.yaml`:

```yaml
sources:
  my-new-chart:
    name: "Get latest My Chart version"
    kind: helmchart
    spec:
      url: https://my-helm-repo.example.com/
      name: my-chart

conditions:
  my-new-chart-exists:
    kind: helmchart
    sourceid: my-new-chart
    spec:
      url: https://my-helm-repo.example.com/
      name: my-chart

targets:
  my-new-chart-app:
    kind: yaml
    sourceid: my-new-chart
    spec:
      file: gitops/path/to/my-app.yaml
      key: "$.spec.sources[0].targetRevision"
```

## Version Constraints

To pin to specific major versions, use version filters:

```yaml
sources:
  argocd:
    kind: helmchart
    spec:
      url: oci://ghcr.io/argoproj/argo-helm
      name: argo-cd
      versionfilter:
        kind: semver
        pattern: "~9.0.0"  # Only patch updates in 9.x
```

Available patterns:
- `"~9.0.0"` - Only 9.x versions (minor + patch updates)
- `"^9.1.0"` - 9.1.x and above (patch updates only)
- `">9.0.0 <10.0.0"` - Between 9.0.0 and 10.0.0
- `"9.x"` - Any 9.x version

## Troubleshooting

### UpdateCLI Can't Find Chart Versions

Verify the chart exists and is accessible:

```bash
# For OCI registries (ArgoCD)
helm show chart oci://ghcr.io/argoproj/argo-helm/argo-cd

# For Helm repositories (Kyverno)
helm repo add kyverno https://kyverno.github.io/kyverno/
helm search repo kyverno/kyverno --versions | head
```

### Check UpdateCLI Logs

Run with debug output:

```bash
updatecli diff --config gitops/updatecli.yaml --debug
```

### Validate YAML Syntax

```bash
# Check if YAML is valid
yq eval '.' gitops/spoke/argocd/argocd-app.yaml
yq eval '.' gitops/spoke/kyverno/kyverno-app.yaml
```

## Best Practices

1. **Always run `diff` first** to see what would change
2. **Review changes** before committing
3. **Test in a non-production environment** first
4. **Check release notes** of new chart versions for breaking changes
5. **Use version constraints** to avoid major version updates

## Common Workflows

### Weekly Update Check
```bash
# Every Monday morning
cd /path/to/repo
updatecli diff --config gitops/updatecli.yaml
# Review output
updatecli apply --config gitops/updatecli.yaml --disable-scm
git add gitops/spoke/
git commit -m "chore: update helm charts"
git push
```

### Pre-Release Testing
```bash
# Check for updates
updatecli diff --config gitops/updatecli.yaml

# Apply to test branch
git checkout -b update-helm-charts
updatecli apply --config gitops/updatecli.yaml --disable-scm
git add gitops/spoke/
git commit -m "test: update helm charts"
git push origin update-helm-charts
```

## Resources

- [UpdateCLI Documentation](https://www.updatecli.io/)
- [UpdateCLI Helm Chart Source](https://www.updatecli.io/docs/plugins/source/helmchart/)
- [ArgoCD Helm Charts](https://github.com/argoproj/argo-helm)
- [Kyverno Helm Charts](https://github.com/kyverno/kyverno/tree/main/charts/kyverno)
