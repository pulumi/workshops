# IDP Component Policies Tutorial

This tutorial demonstrates how to create an IDP (Internal Developer Platform) component using Pulumi templates and implement progressive policy enforcement from local to organization-wide policies.

## Overview

We'll demonstrate three stages of policy enforcement:
1. **No Policies** - Clean deployment without any policy checks
2. **Local Policies** - Developer-defined policies run via CLI
3. **Organization Policies** - Enterprise-wide policies enforced automatically

## Prerequisites

- Pulumi CLI installed
- AWS credentials configured
- Access to a Pulumi Cloud organization
- Python 3.x installed

**Note**: This tutorial uses "pequod" as the organization name. Replace "pequod" with your actual Pulumi organization name throughout the tutorial.

## Part 1: Creating the IDP Component from Template

### Step 1: Initialize Project from Template

Navigate to the solution folder and create a new Pulumi project using the Go Microservice Boilerplate template:

```bash
cd solution
pulumi new ./../../golden-paths-infrastructure-components-and-templates/go-microservice-boilerplate \
  --name "idp-component-policies" \
  --description "IDP Component Policies project using Go Microservice Boilerplate template" \
  --yes

# For production use with remote templates, you would use a git URL instead:
# pulumi new https://github.com/your-org/golden-path-templates/go-microservice-boilerplate \
#   --name "my-microservice" \
#   --description "My microservice using organizational template" \
#   --yes
```
Then test is with pulumi preview:

```
❯ pulumi preview
Previewing update (dev)

Resources:
    + 11 to create
    11 unchanged
```

## Part 2: Demo Stage 1 - No Policies

In this stage, we'll deploy without any policy enforcement to show the baseline.

### Step 4: Initial Deployment

```bash

# Create development stack
pulumi stack init dev

# Preview the deployment
pulumi preview

# Deploy the infrastructure
pulumi up
```

### Step 5: Test the Deployed Service

```bash
# Test health endpoint
curl "$(pulumi stack output publicUrl)/health"
# Expected: {"service":"idp-component-policies","status":"healthy"}

# Test echo endpoint
curl "$(pulumi stack output publicUrl)/echo?message=No%20Policies%20Working!"
# Expected: {"echo":"No Policies Working!","service":"idp-component-policies","timestamp":"..."}
```

## Part 3: Demo Stage 2 - Local Policies

Now we'll create preventative policies that validate configuration before deployment and can block non-compliant infrastructure.

### Step 6: Modify Component to Trigger Policy Violations

To demonstrate policy enforcement, we'll temporarily modify the microservice component to use values that violate our policies. Edit `Pulumi.yaml`:

```yaml
resources:
  microserviceComponent:
    type: component-microservice:MicroserviceComponent
    properties:
      appPath: ./src
      port: 22        # This will violate the dangerous ports policy
      cpu: 256
      memory: 2048    # This will trigger the advisory memory policy
```

### Step 7: Create Local Policy Pack

Create the demo policies directory and files:

```bash
# Create policy pack directory
mkdir -p demo-policies
cd demo-policies
```

Create `PulumiPolicy.yaml`:
```yaml
runtime:
  name: python
  options:
    virtualenv: venv
version: 0.0.1
description: A minimal Policy Pack for AWS using Python.
```

Create `__main__.py` with preventative policies targeting the microservice component:

```python
"""Preventative policies that block deployments before infrastructure is created."""

from typing import Any, Callable
from pulumi_policy import (
    EnforcementLevel,
    PolicyPack,
    ReportViolation,
    ResourceValidationArgs,
    ResourceValidationPolicy,
)

# Type alias for validation function
ValidationFunc = Callable[[ResourceValidationArgs, ReportViolation], Any]

# Policy 1: Restrict dangerous ports (typed function)
def restrict_ports_validation(args: ResourceValidationArgs, report_violation: ReportViolation) -> Any:
    """Restrict dangerous ports like SSH, RDP, and database ports."""
    if args.resource_type != "component-microservice:index:MicroserviceComponent":
        return
    
    port = args.props.get('port', 8080)
    if port in [22, 3389, 1433, 5432, 3306]:
        report_violation(
            f"Microservice '{args.name}' uses dangerous port {port}. "
            f"Avoid using well-known service ports (22=SSH, 3389=RDP, 1433=SQL Server, 5432=PostgreSQL, 3306=MySQL)."
        )

restrict_dangerous_ports = ResourceValidationPolicy(
    name="restrict-dangerous-ports",
    description="Microservice components must not use dangerous ports like 22, 3389, or 1433",
    validate=restrict_ports_validation,
    enforcement_level=EnforcementLevel.MANDATORY,
)

# Policy 2: Limit memory usage (typed function)
def limit_memory_validation(args: ResourceValidationArgs, report_violation: ReportViolation) -> Any:
    """Limit memory usage for cost control."""
    if args.resource_type != "component-microservice:index:MicroserviceComponent":
        return
    
    memory = args.props.get('memory', 512)
    if memory > 1024:
        report_violation(
            f"Microservice '{args.name}' requests {memory}MB memory. "
            f"Consider using ≤1024MB for development environments to control costs."
        )

limit_memory_usage = ResourceValidationPolicy(
    name="limit-memory-usage",
    description="Microservice components should not exceed 1GB memory in development",
    validate=limit_memory_validation,
    enforcement_level=EnforcementLevel.ADVISORY,
)

# Create the policy pack
policy_pack = PolicyPack(
    name="demo-policies",
    enforcement_level=EnforcementLevel.MANDATORY,
    policies=[
        restrict_dangerous_ports,
        limit_memory_usage,
    ],
)
```

### Step 8: Install Policy Dependencies

```bash
# Create virtual environment for policies
cd demo-policies
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install pulumi-policy

# Return to solution directory
cd ..
```

### Step 9: Test Local Policies

```bash
# Preview with local policies - this should show violations
pulumi preview --policy-pack ../demo-policies
```

You should see policy violations like:
- **MANDATORY**: Dangerous port (22) usage violation 
- **ADVISORY**: High memory (2048MB) usage warning

### Step 10: Show Policy Enforcement

Try to deploy with violations:

```bash
# This should be blocked by mandatory policies
pulumi up --policy-pack ../demo-policies
```

The deployment should be blocked due to the mandatory port policy violation, while the advisory memory policy will show a warning but allow deployment. This demonstrates different enforcement levels providing immediate feedback during development.

## Part 4: Demo Stage 3 - Organization Policies

In this final stage, we'll publish our policies to the organization and show automatic enforcement.

### Step 11: Publish Policies to Organization

```bash
# Navigate to policy directory
cd demo-policies

# Publish policy pack to organization
pulumi policy publish
```

### Step 12: Enable Organization-Wide Enforcement

```bash
# Enable the policy pack for the organization
pulumi policy enable pequod/demo-policies latest
```

### Step 13: Test Organization Policies

```bash
# Return to solution directory
cd ../solution

# Now preview without --policy-pack flag - org policies apply automatically
pulumi preview
```

**Note**: Organization-wide policy enforcement typically requires configuration through the Pulumi Cloud UI to assign policy packs to specific stacks, projects, or stack tags. The CLI publish command makes the policies available organization-wide, but enforcement rules are usually configured via the web interface.

For demonstration purposes, you can show that:
1. The policy pack is successfully published and visible in the organization
2. Local development workflow continues to work with `--policy-pack ../demo-policies`
3. Organization policies would automatically apply once configured in the Pulumi Cloud UI

### Step 14: Clean Demo State

To reset for repeated demos:

```bash
# Reset microservice component to safe values in Pulumi.yaml
# Change port back to 8080 and memory back to 512

# Update with clean configuration
pulumi up

# Or destroy everything and recreate clean
pulumi destroy
pulumi up
```

### Step 16: Policy Management

```bash
# List organization policies
pulumi policy ls

# List policies for your organization
pulumi policy ls pequod

# Disable policy pack if needed (not typically needed for CLI workflow)
# Note: Organization-wide policy enforcement is usually configured via Pulumi Cloud UI

# Remove policy pack entirely (requires org name and version)
pulumi policy rm pequod/demo-policies 0.0.1 --yes
```
