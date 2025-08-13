# Qodda Deployment Guide

This guide covers deploying the Qodda application to Azure using various methods.

## Prerequisites

- Azure CLI installed and configured
- Docker installed
- Node.js 18+ installed
- GitHub account with repository access

## Environment Setup

### 1. Azure Resources

Run the setup script to create required Azure resources:

\`\`\`bash
chmod +x scripts/setup-azure.sh
./scripts/setup-azure.sh
\`\`\`

This creates:
- Resource Group
- Azure Container Registry
- Service Principal for GitHub Actions

### 2. GitHub Secrets

Add the following secrets to your GitHub repository:

**Required Secrets:**
- `AZURE_CREDENTIALS` - Service principal JSON
- `AZURE_ACR_USERNAME` - Container registry username
- `AZURE_ACR_PASSWORD` - Container registry password
- `AZURE_CUSTOM_VISION_ENDPOINT` - Custom Vision API endpoint
- `AZURE_CUSTOM_VISION_PREDICTION_KEY` - Custom Vision prediction key
- `AZURE_STORAGE_ACCOUNT_NAME` - Storage account name
- `AZURE_STORAGE_ACCOUNT_KEY` - Storage account key
- `AZURE_COSMOS_ENDPOINT` - Cosmos DB endpoint
- `AZURE_COSMOS_KEY` - Cosmos DB key

**Optional Secrets:**
- `SNYK_TOKEN` - For security scanning
- `SLACK_WEBHOOK` - For deployment notifications

## Deployment Methods

### 1. GitHub Actions (Recommended)

The application automatically deploys when code is pushed:

- **Develop branch** → Staging environment
- **Main branch** → Production environment

The pipeline includes:
- Code quality checks (linting, testing)
- Security scanning
- Docker image building
- Infrastructure deployment
- Application deployment
- Smoke tests

### 2. Local Development

For local development with Docker:

\`\`\`bash
# Build and run locally
chmod +x scripts/deploy-local.sh
./scripts/deploy-local.sh
\`\`\`

Or use Docker Compose:

\`\`\`bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
\`\`\`

### 3. Manual Azure Deployment

Deploy infrastructure manually:

\`\`\`bash
# Deploy to production
az deployment group create \
  --resource-group qodda-rg \
  --template-file infrastructure/main.bicep \
  --parameters @infrastructure/parameters.prod.json
\`\`\`

## Monitoring and Maintenance

### Health Checks

The application includes health check endpoints:

- `/api/health` - Application health status
- Checks database connectivity
- Validates Azure service connections

### Logging

Application logs are sent to:
- Azure Application Insights (production)
- Console output (development)

### Scaling

To scale the application:

1. **Horizontal Scaling**: Increase container instances
2. **Vertical Scaling**: Increase CPU/memory allocation
3. **Auto Scaling**: Configure based on metrics

## Troubleshooting

### Common Issues

1. **Container Registry Authentication**
   - Verify ACR credentials in GitHub secrets
   - Check service principal permissions

2. **Database Connection**
   - Verify Cosmos DB connection string
   - Check network security groups

3. **Storage Access**
   - Verify storage account keys
   - Check blob container permissions

### Debugging

View application logs:

\`\`\`bash
# Azure Container Instances
az container logs --resource-group qodda-rg --name qodda-production

# Local Docker
docker logs qodda-local
\`\`\`

## Security Considerations

- All secrets stored in Azure Key Vault
- Container images scanned for vulnerabilities
- Network traffic encrypted (HTTPS)
- Rate limiting implemented
- Security headers configured
