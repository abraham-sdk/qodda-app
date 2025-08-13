A comprehensive step-by-step guide to configure all Azure services for the Qodda app:

## Azure Configuration Guide for Qodda

### 1. Create Azure Resource Group

```shellscript
az group create --name qodda-rg --location eastus
```

### 2. Setup Azure AD B2C Tenant

1. **Create B2C Tenant:**

1. Go to Azure Portal → Create a resource → Azure Active Directory B2C
2. Create new tenant: `qodda-b2c.onmicrosoft.com`
3. Switch to the B2C tenant



2. **Register Application:**

1. Go to App registrations → New registration
2. Name: `Qodda Web App`
3. Redirect URI: `https://your-domain.com/auth/callback` (and `http://localhost:3000/auth/callback` for dev)
4. Copy the **Application (client) ID**



3. **Create User Flow:**

1. Go to User flows → New user flow
2. Select "Sign up and sign in" → Recommended
3. Name: `B2C_1_signupsignin`
4. Identity providers: Email signup
5. User attributes: Given Name, Surname, Email Address





### 3. Setup Azure Custom Vision

1. **Create Cognitive Services:**

```shellscript
az cognitiveservices account create \
  --name qodda-customvision \
  --resource-group qodda-rg \
  --kind CustomVision.Training \
  --sku F0 \
  --location eastus
```


2. **Create Custom Vision Project:**

1. Go to customvision.ai → Sign in → New Project
2. Name: `Skin Health Classification`
3. Project Type: Classification
4. Classification Type: Multiclass
5. Domain: General (compact)



3. **Train Your Model:**

1. Upload training images for different skin conditions
2. Tag images with condition names
3. Train the model
4. Publish iteration as "Production"
5. Copy **Project ID**, **Prediction Key**, and **Prediction Endpoint**





### 4. Setup Azure Blob Storage

```shellscript
az storage account create \
  --name qoddaimages \
  --resource-group qodda-rg \
  --location eastus \
  --sku Standard_LRS

az storage container create \
  --name user-images \
  --account-name qoddaimages \
  --public-access off
```

- Copy **Storage Account Name** and **Access Key**


### 5. Setup Azure Cosmos DB

```shellscript
az cosmosdb create \
  --name qodda-cosmos \
  --resource-group qodda-rg \
  --kind MongoDB \
  --locations regionName=eastus

az cosmosdb mongodb database create \
  --account-name qodda-cosmos \
  --resource-group qodda-rg \
  --name qodda-db
```

- Copy **Connection String** from Keys section


### 6. Setup Azure Key Vault

```shellscript
az keyvault create \
  --name qodda-keyvault \
  --resource-group qodda-rg \
  --location eastus

# Add secrets
az keyvault secret set --vault-name qodda-keyvault --name "CustomVisionKey" --value "your-key"
az keyvault secret set --vault-name qodda-keyvault --name "StorageKey" --value "your-key"
az keyvault secret set --vault-name qodda-keyvault --name "CosmosKey" --value "your-key"
```

### 7. Setup Application Insights

```shellscript
az monitor app-insights component create \
  --app qodda-insights \
  --location eastus \
  --resource-group qodda-rg
```

- Copy **Connection String**


### 8. Configure Environment Variables

Create `.env.local` with these values:

```plaintext
# Azure AD B2C
NEXT_PUBLIC_AZURE_AD_B2C_TENANT_NAME=qodda-b2c
NEXT_PUBLIC_AZURE_AD_B2C_CLIENT_ID=your-client-id
NEXT_PUBLIC_AZURE_AD_B2C_POLICY_NAME=B2C_1_signupsignin

# Azure Custom Vision
AZURE_CUSTOM_VISION_ENDPOINT=https://eastus.api.cognitive.microsoft.com/
AZURE_CUSTOM_VISION_PREDICTION_KEY=your-prediction-key
AZURE_CUSTOM_VISION_PROJECT_ID=your-project-id
AZURE_CUSTOM_VISION_ITERATION_NAME=Production

# Azure Storage
AZURE_STORAGE_ACCOUNT_NAME=qoddaimages
AZURE_STORAGE_ACCOUNT_KEY=your-storage-key
AZURE_STORAGE_CONTAINER_NAME=user-images

# Azure Cosmos DB
AZURE_COSMOS_ENDPOINT=https://qodda-cosmos.documents.azure.com:443/
AZURE_COSMOS_KEY=your-cosmos-key
AZURE_COSMOS_DATABASE_NAME=qodda-db
AZURE_COSMOS_CONTAINER_NAME=classifications

# Azure Key Vault
AZURE_KEY_VAULT_URL=https://qodda-keyvault.vault.azure.net/

# Application Insights
NEXT_PUBLIC_AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING=your-connection-string

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

### 9. Setup Container Registry (for deployment)

```shellscript
az acr create \
  --resource-group qodda-rg \
  --name qoddaacr \
  --sku Basic \
  --admin-enabled true
```

### 10. Test the Setup

1. Run `npm run dev` locally
2. Test authentication flow
3. Upload a test image
4. Verify classification works
5. Check Application Insights for telemetry


This configuration provides a complete Azure infrastructure for the Qodda application with proper security, monitoring, and scalability. Each service is configured with appropriate access controls and follows Azure best practices for production deployments.