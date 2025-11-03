#!/bin/bash

# Deploy the Dad Joke Function App using Bicep
# Usage: ./deploy.sh <resource-group-name> [location] [prefix]

set -e

RESOURCE_GROUP_NAME=${1:-}
LOCATION=${2:-eastus}
PREFIX=${3:-dadjoke}

if [ -z "$RESOURCE_GROUP_NAME" ]; then
    echo "❌ Error: Resource group name is required"
    echo "Usage: ./deploy.sh <resource-group-name> [location] [prefix]"
    exit 1
fi

echo "🚀 Starting Dad Joke Function App deployment..."

# Check if Azure CLI is installed and logged in
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI not found. Please install Azure CLI first."
    exit 1
fi

ACCOUNT=$(az account show --query "name" -o tsv 2>/dev/null || echo "")
if [ -z "$ACCOUNT" ]; then
    echo "❌ Not logged in to Azure. Please run 'az login' first."
    exit 1
fi

echo "✅ Using Azure account: $ACCOUNT"

# Create resource group if it doesn't exist
echo "📦 Creating resource group '$RESOURCE_GROUP_NAME'..."
az group create --name "$RESOURCE_GROUP_NAME" --location "$LOCATION" --output none

# Build the function app
echo "🔨 Building function app..."
cd ../function
dotnet publish --configuration Release --output bin/publish
cd bin
zip -r function-app.zip publish/
cd ../../bicep

# Create temporary storage for deployment
TEMP_STORAGE_NAME="temp$(openssl rand -hex 4)"
echo "📁 Creating temporary storage account '$TEMP_STORAGE_NAME'..."

az storage account create \
    --name "$TEMP_STORAGE_NAME" \
    --resource-group "$RESOURCE_GROUP_NAME" \
    --location "$LOCATION" \
    --sku Standard_LRS \
    --output none

# Get storage account key
STORAGE_KEY=$(az storage account keys list \
    --account-name "$TEMP_STORAGE_NAME" \
    --resource-group "$RESOURCE_GROUP_NAME" \
    --query "[0].value" -o tsv)

# Create container and upload function zip
echo "📤 Uploading function package..."
az storage container create \
    --name packages \
    --account-name "$TEMP_STORAGE_NAME" \
    --account-key "$STORAGE_KEY" \
    --output none

az storage blob upload \
    --file "../function/bin/function-app.zip" \
    --container-name packages \
    --name function-app.zip \
    --account-name "$TEMP_STORAGE_NAME" \
    --account-key "$STORAGE_KEY" \
    --overwrite \
    --output none

# Generate SAS URL (macOS compatible)
if [[ "$OSTYPE" == "darwin"* ]]; then
    EXPIRY_DATE=$(date -v +1y +%Y-%m-%d)
else
    EXPIRY_DATE=$(date -d "+1 year" +%Y-%m-%d)
fi
SAS_URL=$(az storage blob generate-sas \
    --account-name "$TEMP_STORAGE_NAME" \
    --account-key "$STORAGE_KEY" \
    --container-name packages \
    --name function-app.zip \
    --permissions r \
    --expiry "$EXPIRY_DATE" \
    --https-only \
    --full-uri \
    -o tsv)

echo "📋 Generated SAS URL for function package"

# Deploy Bicep template
echo "🏗️ Deploying infrastructure with Bicep..."
DEPLOYMENT_OUTPUT=$(az deployment group create \
    --resource-group "$RESOURCE_GROUP_NAME" \
    --template-file main.bicep \
    --parameters location="$LOCATION" prefix="$PREFIX" functionPackageSasUrl="$SAS_URL" \
    --query "properties.outputs" \
    -o json)

# Clean up temporary storage
echo "🧹 Cleaning up temporary storage..."
az storage account delete \
    --name "$TEMP_STORAGE_NAME" \
    --resource-group "$RESOURCE_GROUP_NAME" \
    --yes \
    --output none

# Parse and display results
FUNCTION_APP_URL=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.functionAppUrl.value')
JOKE_ENDPOINT=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.jokeEndpoint.value')
OPENAI_ACCOUNT=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.openAIAccountName.value')

echo ""
echo "🎉 Deployment completed successfully!"
echo "📊 Deployment outputs:"
echo "   Function App URL: $FUNCTION_APP_URL"
echo "   Joke Endpoint:    $JOKE_ENDPOINT"
echo "   OpenAI Account:   $OPENAI_ACCOUNT"
echo ""
echo "🧪 Test the deployment:"
echo "   curl '$JOKE_ENDPOINT'"