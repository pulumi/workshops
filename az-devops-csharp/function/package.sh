#!/bin/bash

# Package Dad Joke Function App
# This script builds and packages the .NET 8 Azure Function for deployment

set -e  # Exit on any error

echo "🏗️  Building Dad Joke Function App..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf bin/Release
rm -rf bin/publish
rm -f bin/function-app.zip

# Build and publish the function
echo "📦 Building and publishing function..."
dotnet publish -c Release -o bin/publish

# Create deployment package
echo "📝 Creating deployment package..."
cd bin/publish
zip -r ../function-app.zip .

echo "✅ Function app packaged successfully!"
echo "📦 Package location: bin/function-app.zip"
echo "🚀 Ready for deployment with 'pulumi up'"