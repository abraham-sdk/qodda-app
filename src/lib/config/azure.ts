/**
 * Azure service configuration and constants
 */

export const azureConfig = {
  // Custom Vision
  customVision: {
    endpoint: process.env.AZURE_CUSTOM_VISION_ENDPOINT!,
    predictionKey: process.env.AZURE_CUSTOM_VISION_PREDICTION_KEY!,
    projectId: process.env.AZURE_CUSTOM_VISION_PROJECT_ID!,
    iterationName: process.env.AZURE_CUSTOM_VISION_ITERATION_NAME!,
  },

  // Blob Storage
  storage: {
    accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME!,
    accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY!,
    containerName: process.env.AZURE_STORAGE_CONTAINER_NAME!,
  },

  // Cosmos DB
  cosmos: {
    endpoint: process.env.AZURE_COSMOS_ENDPOINT!,
    key: process.env.AZURE_COSMOS_KEY!,
    databaseName: process.env.AZURE_COSMOS_DATABASE_NAME!,
    containerName: process.env.AZURE_COSMOS_CONTAINER_NAME!,
  },

  // Key Vault
  keyVault: {
    url: process.env.AZURE_KEY_VAULT_URL!,
  },

  // Application Insights
  appInsights: {
    connectionString: process.env.AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING!,
  },

  // Azure AD B2C
  adB2C: {
    tenantName: process.env.AZURE_AD_B2C_TENANT_NAME!,
    clientId: process.env.AZURE_AD_B2C_CLIENT_ID!,
    clientSecret: process.env.AZURE_AD_B2C_CLIENT_SECRET!,
    policyName: process.env.AZURE_AD_B2C_POLICY_NAME!,
  },
} as const

export const appConfig = {
  rateLimit: {
    maxRequests: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "10"),
    windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
  },
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
  },
} as const
