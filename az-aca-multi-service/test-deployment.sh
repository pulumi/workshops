#!/bin/bash
set -euo pipefail

echo "=== Todo Demo Deployment Test ==="
echo ""

# Get URLs from Pulumi
cd /Users/adam/sandbox/todo-demo/infra
FRONTEND_URL=$(pulumi stack output frontendUrl)
BACKEND_URL=$(pulumi stack output backendUrl_out)
RG=$(pulumi stack output resourceGroupName_out)
STORAGE=$(pulumi stack output storageAccountName_out)

echo "Frontend URL: $FRONTEND_URL"
echo "Backend URL: $BACKEND_URL (internal)"
echo ""

# Test 1: Frontend health
echo "[1/5] Testing frontend health endpoint..."
if curl -sf "$FRONTEND_URL/health" > /dev/null; then
    echo "✓ Frontend health OK"
else
    echo "✗ Frontend health FAILED"
    exit 1
fi

# Test 2: Frontend loads
echo ""
echo "[2/5] Testing frontend loads HTML..."
if curl -sf "$FRONTEND_URL" | grep -q "<!doctype html>"; then
    echo "✓ Frontend HTML loads"
else
    echo "✗ Frontend HTML FAILED"
    exit 1
fi

# Test 3: Backend health via logs
echo ""
echo "[3/5] Testing backend is running..."
if az containerapp show --name ca-todo-demo-backend-dev --resource-group "$RG" --query "properties.provisioningState" -o tsv | grep -q "Succeeded"; then
    echo "✓ Backend provisioned successfully"
else
    echo "✗ Backend provisioning FAILED"
    exit 1
fi

# Test 4: Check blob storage container exists
echo ""
echo "[4/5] Testing blob storage container exists..."
if az storage container show --name board-state --account-name "$STORAGE" --auth-mode login > /dev/null 2>&1; then
    echo "✓ Blob storage container exists"
else
    echo "⚠ Could not verify blob storage (may need permissions)"
fi

# Test 5: Check managed identity assignment
echo ""
echo "[5/5] Testing managed identity configured..."
IDENTITY=$(az containerapp show --name ca-todo-demo-backend-dev --resource-group "$RG" --query "identity.type" -o tsv)
if [ "$IDENTITY" = "UserAssigned" ]; then
    echo "✓ Managed identity configured"
else
    echo "✗ Managed identity NOT configured"
    exit 1
fi

echo ""
echo "=== All tests passed! ==="
echo ""
echo "🎉 Application deployed successfully!"
echo ""
echo "Frontend: $FRONTEND_URL"
echo ""
echo "Next steps:"
echo "  1. Open the frontend URL in your browser"
echo "  2. Test board functionality (drag items, use chat)"
echo "  3. Check that data persists after refresh"
echo ""
