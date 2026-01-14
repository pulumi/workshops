# Native Azure Container Apps Infrastructure with Resiliency

This infrastructure demonstrates native Azure Container Apps resiliency without using Dapr sidecars.

## Key Features

- **Backend is private** - Internal-only ingress, no public endpoint
- **Frontend calls backend via native service discovery** - Uses backend's internal FQDN
- **Resiliency policies applied to backend** - Automatic retries with exponential backoff
- **30% failure rate in backend** - Demonstrates transparent retry handling
- **Simpler than Dapr approach** - No Dapr configuration required

## Architecture

```
Internet
   |
   v
Frontend Container App (Public)
   |
   | HTTPS (internal FQDN)
   v
Backend Container App (Internal-only)
   |
   v
Azure Blob Storage
```

## Resiliency Configuration

The backend has the following resiliency policy applied:

- **HTTP Retry Policy**
  - Max retries: 3
  - Initial delay: 500ms
  - Max interval: 5 seconds (exponential backoff)
  - Retries on: 5xx errors, connection failures, resets

- **Timeout Policy**
  - Response timeout: 30 seconds
  - Connection timeout: 5 seconds

- **Circuit Breaker**
  - Consecutive errors threshold: 5
  - Evaluation interval: 10 seconds
  - Max ejection percent: 50%

## Deployment

### Prerequisites

- Azure CLI logged in
- Pulumi CLI installed
- .NET SDK (for building)

### Steps

1. **Initialize Pulumi stack**
   ```bash
   cd infra-native
   pulumi stack init native
   pulumi config set azure-native:location westus2
   ```

2. **Preview changes**
   ```bash
   pulumi preview
   ```
   Expected: Backend ingress is internal, resiliency policy is created

3. **Deploy**
   ```bash
   pulumi up
   ```
   Takes approximately 3-5 minutes

4. **Get URLs**
   ```bash
   FRONTEND_URL=$(pulumi stack output frontendUrl)
   BACKEND_URL=$(pulumi stack output backendUrl_out)
   ```

## Testing

### Verify Backend is Internal-Only

The backend should NOT be accessible from the internet:

```bash
curl $BACKEND_URL/api/board
```
**Expected:** Connection timeout or connection refused

### Verify Frontend Works with Retries

The frontend SHOULD work even though the backend fails 30% of the time:

```bash
curl $FRONTEND_URL/api/board
```
**Expected:** Success response with board data

### Test Retry Behavior

Call the frontend multiple times. Despite the 30% failure rate in the backend, you should never see errors because the resiliency policy automatically retries:

```bash
for i in {1..10}; do
  curl -s $FRONTEND_URL/api/board | jq -r '.columns[0].title // .error'
done
```

**Expected:** "Inbox" printed 10 times (no "Simulated failure" errors)

## How It Works

### Native Service Discovery

When the backend ingress is set to `External = false`:
- Azure Container Apps assigns an internal FQDN
- The FQDN is only accessible within the Container Apps Environment
- Frontend uses this internal FQDN to call the backend

### Resiliency Policy

The `AppResiliency` resource applies policies to incoming requests to the backend:
- Policies are applied **at the backend**, not the frontend
- No application code changes required
- Works transparently using Azure Container Apps platform features
- Dapr operates behind the scenes with no sidecar configuration needed

### Failure Simulation

The backend has `FailureRate = "0.3"` which causes it to:
- Return 503 Service Unavailable 30% of the time
- This demonstrates that retries work transparently
- Frontend never sees these failures due to automatic retries

## Cleanup

```bash
pulumi destroy
pulumi stack rm native
```

## Comparison with Other Approaches

| Feature | infra-basic | infra-native | infra-dapr |
|---------|-------------|--------------|------------|
| Backend public | ✅ Yes | ❌ No | ❌ No |
| Service discovery | ✅ Direct URL | ✅ Internal FQDN | ✅ Dapr service invocation |
| Resiliency | ❌ None | ✅ Native AppResiliency | ✅ Dapr component resiliency |
| Dapr config | ❌ None | ❌ None | ✅ Sidecar enabled |
| Complexity | Low | Low | Medium |

## Key Differences from infra-basic

1. **Backend ingress**: `External = false` instead of `true`
2. **FailureRate**: Added to backend environment variables
3. **AppResiliency**: New resource for retry/timeout/circuit breaker policies
4. **No Dapr configuration**: Simpler than Dapr approach

## Resources Created

- Resource Group
- Storage Account + Blob Container
- Container Registry
- Container Apps Environment
- Managed Identity (for backend)
- Backend Container App (internal-only)
- Frontend Container App (public)
- **AppResiliency Policy** (new in this version)
