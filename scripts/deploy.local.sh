#!/bin/bash

# Local deployment script for development
set -e

echo "🚀 Starting local deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t qodda-app:local .

# Stop existing container if running
echo "🛑 Stopping existing container..."
docker stop qodda-local 2>/dev/null || true
docker rm qodda-local 2>/dev/null || true

# Run the container
echo "🏃 Starting container..."
docker run -d \
  --name qodda-local \
  -p 3000:3000 \
  --env-file .env.local \
  qodda-app:local

echo "✅ Local deployment complete!"
echo "🌐 Application is running at http://localhost:3000"
echo "🔍 Health check: http://localhost:3000/api/health"

# Wait for the application to start
echo "⏳ Waiting for application to start..."
sleep 10

# Run health check
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed. Check the logs:"
    docker logs qodda-local
    exit 1
fi
