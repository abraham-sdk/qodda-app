@description('The name of the application')
param appName string = 'qodda'

@description('The location for all resources')
param location string = resourceGroup().location

@description('The environment (dev, staging, prod)')
param environment string = 'prod'

@description('The container image to deploy')
param containerImage string

@description('The container registry server')
param containerRegistryServer string = 'qodda.azurecr.io'

@description('Container registry username')
@secure()
param containerRegistryUsername string

@description('Container registry password')
@secure()
param containerRegistryPassword string

// Variables
var resourcePrefix = '${appName}-${environment}'
var tags = {
  application: appName
  environment: environment
  managedBy: 'bicep'
}

// Storage Account for blob storage
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: '${replace(resourcePrefix, '-', '')}storage'
  location: location
  tags: tags
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
  }
}

// Blob container for images
resource blobContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  name: '${storageAccount.name}/default/skin-images'
  properties: {
    publicAccess: 'None'
  }
}

// Cosmos DB Account
resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: '${resourcePrefix}-cosmos'
  location: location
  tags: tags
  kind: 'MongoDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
      }
    ]
    capabilities: [
      {
        name: 'EnableMongo'
      }
    ]
  }
}

// Cosmos DB Database
resource cosmosDatabase 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases@2023-04-15' = {
  parent: cosmosAccount
  name: 'qodda'
  properties: {
    resource: {
      id: 'qodda'
    }
  }
}

// Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${resourcePrefix}-insights'
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    RetentionInDays: 90
  }
}

// Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2023-02-01' = {
  name: '${resourcePrefix}-kv'
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    accessPolicies: []
    enabledForDeployment: false
    enabledForDiskEncryption: false
    enabledForTemplateDeployment: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
    enableRbacAuthorization: true
  }
}

// Container Instance
resource containerInstance 'Microsoft.ContainerInstance/containerGroups@2023-05-01' = {
  name: '${resourcePrefix}-aci'
  location: location
  tags: tags
  properties: {
    containers: [
      {
        name: appName
        properties: {
          image: containerImage
          ports: [
            {
              port: 3000
              protocol: 'TCP'
            }
          ]
          resources: {
            requests: {
              cpu: 2
              memoryInGB: 4
            }
          }
          environmentVariables: [
            {
              name: 'NODE_ENV'
              value: 'production'
            }
            {
              name: 'AZURE_STORAGE_ACCOUNT_NAME'
              secureValue: storageAccount.name
            }
            {
              name: 'AZURE_STORAGE_ACCOUNT_KEY'
              secureValue: storageAccount.listKeys().keys[0].value
            }
            {
              name: 'AZURE_COSMOS_ENDPOINT'
              secureValue: cosmosAccount.properties.documentEndpoint
            }
            {
              name: 'AZURE_COSMOS_KEY'
              secureValue: cosmosAccount.listKeys().primaryMasterKey
            }
            {
              name: 'AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING'
              secureValue: appInsights.properties.ConnectionString
            }
          ]
        }
      }
    ]
    osType: 'Linux'
    restartPolicy: 'Always'
    ipAddress: {
      type: 'Public'
      ports: [
        {
          port: 3000
          protocol: 'TCP'
        }
      ]
      dnsNameLabel: '${resourcePrefix}-app'
    }
    imageRegistryCredentials: [
      {
        server: containerRegistryServer
        username: containerRegistryUsername
        password: containerRegistryPassword
      }
    ]
  }
}

// Outputs
output storageAccountName string = storageAccount.name
output cosmosEndpoint string = cosmosAccount.properties.documentEndpoint
output appInsightsConnectionString string = appInsights.properties.ConnectionString
output containerInstanceFqdn string = containerInstance.properties.ipAddress.fqdn
output keyVaultUri string = keyVault.properties.vaultUri
