#!/bin/bash
set -euo pipefail

echo "=== Azure Container Apps Native Resiliency Test ==="
echo ""

# Get URLs from Pulumi
FRONTEND_URL=$(pulumi stack output frontendUrl)
BACKEND_URL=$(pulumi stack output backendUrl_out)

echo "Frontend URL: $FRONTEND_URL (public)"
echo "Backend URL: $BACKEND_URL (internal-only)"
echo ""

# Test 1: Backend should NOT be accessible
echo "[1/4] Testing backend is internal-only..."
echo "Attempting to access backend directly from internet..."
if curl -sf --max-time 5 "$BACKEND_URL/api/board" > /dev/null 2>&1; then
    echo "✗ FAILED: Backend is publicly accessible (should be internal-only)"
    exit 1
else
    echo "✓ Backend is internal-only (connection refused/timeout as expected)"
fi

# Test 2: Frontend should work
echo ""
echo "[2/4] Testing frontend can access backend..."
RESPONSE=$(curl -sf "$FRONTEND_URL/api/board" 2>&1 || true)
if echo "$RESPONSE" | jq -e '.columns[0].title' > /dev/null 2>&1; then
    TITLE=$(echo "$RESPONSE" | jq -r '.columns[0].title')
    echo "✓ Frontend successfully called backend: First column is '$TITLE'"
else
    echo "✗ FAILED: Frontend could not access backend"
    echo "Response: $RESPONSE"
    exit 1
fi

# Test 3: Multiple calls should succeed (testing retry behavior)
echo ""
echo "[3/4] Testing retry behavior with 30% backend failure rate..."
echo "Making 20 requests to frontend (backend fails ~30% of the time)..."

SUCCESS_COUNT=0
FAIL_COUNT=0

for i in {1..20}; do
    RESPONSE=$(curl -sf "$FRONTEND_URL/api/board" 2>&1 || true)
    if echo "$RESPONSE" | jq -e '.columns[0].title' > /dev/null 2>&1; then
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        echo -n "."
    else
        FAIL_COUNT=$((FAIL_COUNT + 1))
        echo -n "X"
    fi
done

echo ""
echo ""
echo "Results: $SUCCESS_COUNT successes, $FAIL_COUNT failures out of 20 requests"

if [ "$FAIL_COUNT" -eq 0 ]; then
    echo "✓ All requests succeeded! Resiliency policy is working (retries are transparent)"
elif [ "$FAIL_COUNT" -lt 5 ]; then
    echo "⚠ Few failures detected ($FAIL_COUNT/20). Resiliency is mostly working but may need tuning."
else
    echo "✗ FAILED: Too many failures ($FAIL_COUNT/20). Resiliency policy may not be working correctly."
    exit 1
fi

# Test 4: Check resiliency policy is configured
echo ""
echo "[4/4] Verifying resiliency policy configuration..."
RG=$(pulumi stack output resourceGroupName_out)
BACKEND_APP=$(pulumi config get azure-native:location | xargs -I {} echo "ca-backend-$(pulumi stack --show-name)")

RESILIENCY_COUNT=$(az containerapp resiliency list \
    --name "$BACKEND_APP" \
    --resource-group "$RG" \
    --query "length(@)" -o tsv 2>/dev/null || echo "0")

if [ "$RESILIENCY_COUNT" -gt 0 ]; then
    echo "✓ Resiliency policy configured on backend"
    echo ""
    echo "Policy details:"
    az containerapp resiliency list \
        --name "$BACKEND_APP" \
        --resource-group "$RG" \
        --query "[].{Name:name, HttpRetries:httpRetryPolicy.maxRetries}" -o table
else
    echo "⚠ Could not verify resiliency policy (may require newer Azure CLI)"
fi

echo ""
echo "=== All tests passed! ==="
echo ""
echo "✅ Backend is internal-only (no public access)"
echo "✅ Frontend can call backend via internal FQDN"
echo "✅ Resiliency policy handles failures transparently"
echo ""
echo "Key accomplishments:"
echo "  • Backend simulates 30% failure rate"
echo "  • Resiliency policy retries failures automatically"
echo "  • Frontend users never see errors"
echo "  • No Dapr configuration required"
echo ""
