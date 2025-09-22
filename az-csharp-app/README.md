# Dad Joke Azure Function App

A serverless Azure Function App that generates dad jokes using AI and tracks usage statistics. Built with C#, Azure Functions, and deployed via Pulumi Infrastructure as Code.

## 🚀 Features

- **AI-Powered Dad Jokes**: Generate custom jokes with optional keywords using OpenAI API
- **Usage Statistics**: Track total requests, daily counts, and recent joke history
- **Serverless Architecture**: Pay-per-use Azure Functions on consumption plan
- **Infrastructure as Code**: Complete Azure infrastructure managed with Pulumi
- **Local Development**: Full local testing environment with Azure Functions Core Tools

## 📁 Project Structure

```
├── infrastructure/          # Pulumi infrastructure code
│   ├── Program.cs          # Azure resources definition
│   ├── Pulumi.yaml         # Pulumi project configuration
│   └── c3-azure.csproj     # Infrastructure project file
├── function/               # Azure Function application
│   ├── JokeFunctions.cs    # Function endpoints
│   ├── Program.cs          # Function app setup
│   ├── host.json          # Function runtime configuration
│   ├── local.settings.json # Local development settings
│   └── DadJokeFunctionApp.csproj # Function project file
├── scripts/               # Deployment and development scripts
│   ├── run-local.sh       # Start local development server
│   └── deploy.sh          # Deploy to Azure
└── c3-azure.sln          # Visual Studio solution file
```

## 🛠️ Prerequisites

### Install Required Tools

**Note:** may vary on depending on OS

```bash
# Install .NET 8
brew install --cask dotnet@8

# Install Azure CLI
brew install azure-cli

# Install Pulumi CLI
brew install pulumi

# Install Azure Functions Core Tools
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

### Set up Environment

```bash
# Authenticate with Azure
az login

# Set DOTNET_ROOT for .NET 8 (add to ~/.zshrc)
export DOTNET_ROOT=/opt/homebrew/Cellar/dotnet@8/8.0.120/libexec
```

## 🏗️ Infrastructure

The Pulumi infrastructure creates:

- **Resource Group**: Container for all resources
- **Storage Account**: Azure Functions runtime and table storage for joke history
- **Function App**: Serverless compute with consumption plan
- **Application Insights**: Monitoring and logging
- **Key Vault**: Secure storage for API keys
- **Table Storage**: Joke history and request statistics

## 🔧 Local Development

1. **Set up OpenAI API Key** (optional, will use fallback jokes without it):

   ```bash
   # Edit function/local.settings.json
   {
     "Values": {
       "OPENAI_API_KEY": "your-openai-api-key-here"
     }
   }
   ```
