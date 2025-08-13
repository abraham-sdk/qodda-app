# Qodda - AI-Powered Skin Health Classifier

A production-grade web application that uses Azure Custom Vision AI to classify human skin health conditions. Built with Next.js 14, TypeScript, and integrated with multiple Azure services.

## 🚀 Features

- **AI-Powered Classification**: Uses Azure Custom Vision for accurate skin condition analysis
- **Secure Authentication**: Azure AD B2C integration for user management
- **Cloud Storage**: Azure Blob Storage for secure image storage
- **Data Persistence**: Azure Cosmos DB for classification history
- **Production Ready**: Docker containerization and Azure deployment pipeline
- **Real-time Analytics**: Azure Application Insights integration
- **Rate Limiting**: Built-in API protection and monitoring

## 🏗️ Architecture

\`\`\`
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App   │────│   Azure Services │────│   Monitoring    │
│                 │    │                  │    │                 │
│ • Frontend UI   │    │ • Custom Vision  │    │ • App Insights  │
│ • API Routes    │    │ • Blob Storage   │    │ • Key Vault     │
│ • Authentication│    │ • Cosmos DB      │    │ • Rate Limiting │
└─────────────────┘    └──────────────────┘    └─────────────────┘
\`\`\`

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Node.js
- **AI/ML**: Azure Custom Vision API
- **Storage**: Azure Blob Storage, Azure Cosmos DB
- **Authentication**: Azure AD B2C
- **Monitoring**: Azure Application Insights
- **Security**: Azure Key Vault
- **Deployment**: Docker, Azure Container Instances/AKS
- **CI/CD**: GitHub Actions

## 📋 Prerequisites

- Node.js 18+ 
- Azure subscription
- Azure CLI installed
- Docker (for containerization)

## 🚀 Quick Start

### 1. Clone and Install

\`\`\`bash
git clone <repository-url>
cd qodda
npm install
\`\`\`

### 2. Environment Setup

Copy the example environment file:

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Fill in your Azure service credentials in `.env.local`.

### 3. Azure Services Setup

You'll need to set up the following Azure services:

#### Custom Vision
1. Create a Custom Vision resource in Azure Portal
2. Train a model for skin condition classification
3. Get the prediction endpoint and key

#### Blob Storage
1. Create a Storage Account
2. Create a container named `skin-images`
3. Get the connection string

#### Cosmos DB
1. Create a Cosmos DB account with MongoDB API
2. Create database `qodda` and container `classifications`

#### Azure AD B2C
1. Create an Azure AD B2C tenant
2. Register your application
3. Create sign-up/sign-in user flow

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🧪 Testing

Run the test suite:

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
\`\`\`

## 🐳 Docker Deployment

### Build Docker Image

\`\`\`bash
npm run docker:build
\`\`\`

### Run Container

\`\`\`bash
npm run docker:run
\`\`\`

## ☁️ Azure Deployment

### Prerequisites

1. Azure CLI logged in
2. Azure Container Registry created
3. GitHub secrets configured

### GitHub Secrets Required

- `AZURE_CREDENTIALS`: Service principal credentials
- `AZURE_ACR_USERNAME`: Container registry username
- `AZURE_ACR_PASSWORD`: Container registry password
- All Azure service credentials (Custom Vision, Storage, etc.)

### Deploy

Push to main branch to trigger automatic deployment via GitHub Actions.

## 📊 Monitoring

The application includes comprehensive monitoring:

- **Application Insights**: Performance and error tracking
- **Custom Metrics**: Classification accuracy and usage stats
- **Rate Limiting**: API protection with configurable limits
- **Health Checks**: Endpoint monitoring

## 🔒 Security

- **Authentication**: Azure AD B2C integration
- **Authorization**: Role-based access control
- **Data Encryption**: At rest and in transit
- **API Security**: Rate limiting and input validation
- **Secret Management**: Azure Key Vault integration

## 📁 Project Structure

\`\`\`
qodda/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── classify/          # Classification interface
│   └── dashboard/         # User dashboard
├── components/            # React components
├── lib/                   # Utility functions and services
│   ├── services/          # Azure service integrations
│   ├── types/             # TypeScript definitions
│   └── utils/             # Helper functions
├── public/                # Static assets
├── __tests__/             # Test files
├── .github/workflows/     # CI/CD pipelines
└── docs/                  # Documentation
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in this repository
- Check the documentation in the `/docs` folder
- Review Azure service documentation

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.
