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

2. **Start local development server**:
   ```bash
   ./scripts/run-local.sh
   ```

3. **Test the endpoints**:
   ```bash
   # Get a random dad joke
   curl http://localhost:7071/api/joke

   # Get a joke with keywords
   curl "http://localhost:7071/api/joke?keywords=coffee"

   # Post keywords in request body
   curl -X POST http://localhost:7071/api/joke \
        -H "Content-Type: application/json" \
        -d '{"keywords": "programming"}'

   # Get usage statistics
   curl http://localhost:7071/api/stats
   ```

## 🚀 Deployment

1. **Deploy infrastructure and function**:
   ```bash
   ./scripts/deploy.sh
   ```

   This script will:
   - Deploy Azure infrastructure using Pulumi
   - Build and publish the function code
   - Deploy the function to Azure
   - Display the function URLs

2. **Set up OpenAI API Key in Azure** (optional):
   ```bash
   # Get Key Vault name from Pulumi output
   KEY_VAULT_NAME=$(cd infrastructure && pulumi stack output keyVaultName)

   # Add your OpenAI API key
   az keyvault secret set --vault-name $KEY_VAULT_NAME \
                         --name "openai-api-key" \
                         --value "your-openai-api-key"
   ```

## 🌐 API Endpoints

### GET/POST `/api/joke`
Generate a dad joke with optional keywords.

**Query Parameter:**
```bash
curl "https://your-function.azurewebsites.net/api/joke?keywords=coding"
```

**POST Body:**
```bash
curl -X POST https://your-function.azurewebsites.net/api/joke \
     -H "Content-Type: application/json" \
     -d '{"keywords": "azure"}'
```

**Response:**
```json
{
  "joke": "Why did the developer go broke? Because he used up all his cache!",
  "keywords": "coding",
  "requestCount": 15,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### GET `/api/stats`
Get usage statistics and recent jokes.

```bash
curl https://your-function.azurewebsites.net/api/stats
```

**Response:**
```json
{
  "totalRequests": 127,
  "todayRequests": 15,
  "recentJokes": [
    {
      "joke": "Why don't programmers like nature?...",
      "keywords": "programming",
      "timestamp": "2024-01-15T10:25:00Z"
    }
  ]
}
```

## 🧪 Testing

### Test Local Development
```bash
# Start the function locally
./scripts/run-local.sh

# In another terminal, test the endpoints
curl http://localhost:7071/api/joke
curl http://localhost:7071/api/stats
```

### Test Deployed Function
```bash
# Get function URL from Pulumi
FUNCTION_URL=$(cd infrastructure && pulumi stack output functionAppUrl)

# Test the deployed function
curl $FUNCTION_URL/api/joke
curl "$FUNCTION_URL/api/joke?keywords=azure"
curl $FUNCTION_URL/api/stats
```

## 💰 Cost Estimation

- **Azure Functions (Consumption Plan)**: ~$0.20 per million requests
- **Storage Account**: ~$0.02/GB/month + minimal request charges
- **Application Insights**: Free tier up to 1GB/month
- **Key Vault**: ~$0.03 per 10K operations

**Total**: Less than $5/month for moderate usage (1K requests/day)

## 🔧 Development Commands

```bash
# Build solution
dotnet build

# Restore packages
dotnet restore

# Run infrastructure preview
cd infrastructure && pulumi preview

# Deploy infrastructure only
cd infrastructure && pulumi up

# Run functions locally
cd function && func start

# Deploy function code only
cd function && func azure functionapp publish YOUR_FUNCTION_APP_NAME
```

## 🧹 Cleanup

To remove all Azure resources:
```bash
cd infrastructure
pulumi destroy
```

## 🐛 Troubleshooting

### Common Issues

1. **DOTNET_ROOT not set**: Add to your shell profile:
   ```bash
   export DOTNET_ROOT=/opt/homebrew/Cellar/dotnet@8/8.0.120/libexec
   ```

2. **Function fails to start locally**:
   - Check that Azure Functions Core Tools is installed
   - Verify .NET 8 is installed and accessible

3. **Deploy fails**:
   - Ensure you're logged into Azure CLI (`az login`)
   - Check that you have contributor permissions on the subscription

4. **OpenAI API calls fail**:
   - Verify API key is correctly set in Key Vault or local settings
   - Function will fall back to hardcoded jokes if API calls fail

## 📝 Next Steps

- Add caching layer (Redis) for frequently requested jokes
- Implement rate limiting per user/IP
- Add more joke categories and themes
- Create a simple web frontend
- Add webhook support for Slack/Teams integration
- Implement A/B testing for different joke styles