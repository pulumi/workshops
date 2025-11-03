# Azure OIDC Setup for Pulumi

This project uses **OpenID Connect (OIDC)** for secure, passwordless authentication to Azure.

## Benefits of OIDC

✅ **No secrets to manage** - No client secrets in ESC or pipelines
✅ **Short-lived tokens** - Tokens expire automatically, reducing security risk
✅ **No credential rotation** - Never need to update passwords/secrets
✅ **Better security** - Tokens can't be stolen or leaked like static credentials

## How It Works

1. **Pulumi requests token**: When `esc env run` executes, Pulumi requests an OIDC token from `https://api.pulumi.com/oidc`
2. **Azure validates token**: Azure validates the token against configured federated credentials
3. **Azure issues access token**: Azure provides a short-lived access token for resource management
4. **Pulumi uses token**: Pulumi uses the Azure token to manage infrastructure

## Azure Configuration

**App Registration**: `pulumi-environments-oidc-app`
**App ID**: `18a70830-3e7d-46a8-aa9c-aee6430587bc`
**Role**: Contributor on subscription `0282681f-7a9e-424b-80b2-96babd57a8a1`

### Federated Credentials

Three federated credentials were configured:

1. **ESC Environment Access**
   - **Name**: `adamgordonbell-org-azure-dev-env`
   - **Subject**: `pulumi:environments:org:adamgordonbell-org:project:azure-dev:env:azure-dev`
   - **Use**: Allows the ESC environment to authenticate to Azure

2. **Stack Preview Operations**
   - **Name**: `adamgordonbell-org-infrastructure-dev-preview`
   - **Subject**: `pulumi:deploy:org:adamgordonbell-org:project:infrastructure:stack:dev:operation:preview:scope:write`
   - **Use**: Allows Pulumi to run previews in CI/CD

3. **Stack Update Operations**
   - **Name**: `adamgordonbell-org-infrastructure-dev-update`
   - **Subject**: `pulumi:deploy:org:adamgordonbell-org:project:infrastructure:stack:dev:operation:update:scope:write`
   - **Use**: Allows Pulumi to deploy infrastructure in CI/CD

## ESC Environment Configuration

The ESC environment (`adamgordonbell-org/azure-dev/azure-dev`) is configured with:

```yaml
values:
  azure:
    login:
      fn::open::azure-login:
        clientId: 18a70830-3e7d-46a8-aa9c-aee6430587bc
        tenantId: 706143bc-e1d4-4593-aee2-c9dc60ab9be7
        subscriptionId: 0282681f-7a9e-424b-80b2-96babd57a8a1
        oidc: true  # This enables OIDC!
```

Key differences from client secret auth:
- No `clientSecret` field
- `oidc: true` flag enables OIDC token exchange
- `ARM_USE_OIDC: "true"` in environment variables

## Testing OIDC

Run the test script:

```bash
./test-oidc.sh
```

Or manually test:

```bash
# Test ESC environment
esc env open adamgordonbell-org/azure-dev/azure-dev

# Test Azure authentication
esc env run adamgordonbell-org/azure-dev/azure-dev -- az account show

# Test Pulumi preview
esc env run adamgordonbell-org/azure-dev/azure-dev -- pulumi preview
```

## Azure DevOps Pipelines

**No pipeline changes needed!** The pipelines already use `esc env run`, which automatically uses OIDC when the ESC environment is configured for it.

Both pipelines work with OIDC:
- `azure-pipelines.yml` - Main deployment pipeline
- `azure-pipelines-pr.yml` - PR preview pipeline

The only secret in Azure DevOps is still `PULUMI_ACCESS_TOKEN` - all Azure authentication is handled via OIDC.

## Adding More Stacks or Operations

To add OIDC support for additional stacks or operations, create federated credentials with the appropriate subject:

**Format**: `pulumi:deploy:org:<ORG>:project:<PROJECT>:stack:<STACK>:operation:<OPERATION>:scope:write`

**Example for a production stack**:
```bash
az ad app federated-credential create \
  --id 18a70830-3e7d-46a8-aa9c-aee6430587bc \
  --parameters '{
    "name": "adamgordonbell-org-infrastructure-prod-update",
    "issuer": "https://api.pulumi.com/oidc",
    "subject": "pulumi:deploy:org:adamgordonbell-org:project:infrastructure:stack:prod:operation:update:scope:write",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

## Troubleshooting

### "Failed to exchange OIDC token"

Check that:
1. Federated credential exists with correct subject
2. Subject matches exactly: org name, project name, environment/stack name
3. App has appropriate Azure role assignments

### "Invalid audience"

Ensure audience is `api://AzureADTokenExchange` in federated credential.

### "Token validation failed"

Verify:
- Issuer is `https://api.pulumi.com/oidc`
- Tenant ID matches in both ESC config and federated credential
- App registration is in the correct Azure AD tenant

## Resources

- [Pulumi ESC OIDC Documentation](https://www.pulumi.com/docs/pulumi-cloud/oidc/)
- [Azure Workload Identity Federation](https://learn.microsoft.com/en-us/azure/active-directory/develop/workload-identity-federation)
- [Pulumi Azure OIDC Guide](https://www.pulumi.com/docs/intro/cloud-providers/azure/setup/#oidc)
