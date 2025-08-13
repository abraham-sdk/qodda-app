#!/bin/bash

# Azure infrastructure setup script
set -e

# Configuration
RESOURCE_GROUP="qodda-rg"
LOCATION="eastus"
ACR_NAME="qodda"
SUBSCRIPTION_ID=${AZURE_SUBSCRIPTION_ID}

echo "🚀 Setting up Azure infrastructure..."

# Login to Azure (if not already logged in)
if ! az account show > /dev/null 2>&1; then
    echo "🔐 Please login to Azure..."
    az login
fi

# Set subscription
if [ -n "$SUBSCRIPTION_ID" ]; then
    echo "📋 Setting subscription to $SUBSCRIPTION_ID..."
    az account set --subscription "$SUBSCRIPTION_ID"
fi

# Create resource group
echo "📦 Creating resource group..."
az group create \
    --name "$RESOURCE_GROUP" \
    --location "$LOCATION"

# Create Azure Container Registry
echo "🐳 Creating Azure Container Registry..."
az acr create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$ACR_NAME" \
    --sku Basic \
    --admin-enabled true

# Get ACR credentials
echo "🔑 Getting ACR credentials..."
ACR_USERNAME=$(az acr credential show --name "$ACR_NAME" --query "username" -o tsv)
ACR_PASSWORD=$(az acr credential show --name "$ACR_NAME" --query "passwords[0].value" -o tsv)

echo "✅ Azure infrastructure setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Add these secrets to your GitHub repository:"
echo "   - AZURE_ACR_USERNAME: $ACR_USERNAME"
echo "   - AZURE_ACR_PASSWORD: $ACR_PASSWORD"
echo "2. Create a service principal for GitHub Actions:"
echo "   az ad sp create-for-rbac --name 'qodda-github-actions' --role contributor --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP --sdk-auth"
echo "3. Add the service principal JSON as AZURE_CREDENTIALS secret in GitHub"
