@description('Location for all resources')
param location string = resourceGroup().location

@description('Prefix for resource names')
param prefix string = 'dadjoke'

@description('The SAS URL for the function app package zip file')
param functionPackageSasUrl string

// Storage Account for Functions runtime
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: '${prefix}sa${uniqueString(resourceGroup().id)}'
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    allowBlobPublicAccess: false
  }
}

// Azure OpenAI (Cognitive Services) - Use East US for OpenAI availability
resource openAIAccount 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: '${prefix}-openai-${uniqueString(resourceGroup().id)}'
  location: 'eastus'  // OpenAI requires specific regions
  kind: 'OpenAI'
  sku: {
    name: 'S0'
  }
  properties: {
    customSubDomainName: '${prefix}-openai-${uniqueString(resourceGroup().id)}'
    publicNetworkAccess: 'Enabled'
  }
}

// GPT-4o-mini deployment
resource gptDeployment 'Microsoft.CognitiveServices/accounts/deployments@2023-05-01' = {
  name: 'gpt-4o-mini'
  parent: openAIAccount
  properties: {
    model: {
      format: 'OpenAI'
      name: 'gpt-4o-mini'
      version: '2024-07-18'
    }
    versionUpgradeOption: 'OnceCurrentVersionExpired'
  }
  sku: {
    name: 'Standard'
    capacity: 10
  }
}

// Linux Consumption plan for Functions
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: '${prefix}-plan-${uniqueString(resourceGroup().id)}'
  location: location
  kind: 'functionapp'
  properties: {
    reserved: true // Linux
  }
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
}

// Function App (Linux, .NET 8 isolated)
resource functionApp 'Microsoft.Web/sites@2023-01-01' = {
  name: '${prefix}-function-${uniqueString(resourceGroup().id)}'
  location: location
  kind: 'functionapp,linux'
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOTNET-ISOLATED|8.0'
      http20Enabled: true
      appSettings: [
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'dotnet-isolated'
        }
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=core.windows.net'
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: functionPackageSasUrl
        }
        {
          name: 'AZURE_OPENAI_ENDPOINT'
          value: openAIAccount.properties.endpoint
        }
        {
          name: 'AZURE_OPENAI_API_KEY'
          value: openAIAccount.listKeys().key1
        }
      ]
    }
  }
}

// Outputs
output functionAppUrl string = 'https://${functionApp.properties.defaultHostName}'
output jokeEndpoint string = 'https://${functionApp.properties.defaultHostName}/api/joke'
output openAIAccountName string = openAIAccount.name
output storageAccountName string = storageAccount.name
output resourceGroupName string = resourceGroup().name