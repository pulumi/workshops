#!/bin/bash
set -e

echo "📦 Building and packaging Azure Function..."

# Navigate to function directory
cd function

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf bin/publish
rm -f bin/function-app.zip

# Build and publish the function
echo "Building function..."
dotnet publish --configuration Release --output bin/publish

# Create the deployment package
echo "Creating deployment package..."
cd bin/publish
zip -r ../function-app.zip .
cd ../..

echo "✅ Package created: function/bin/function-app.zip"