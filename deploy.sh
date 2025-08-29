#!/bin/bash

# GitHub Deployment Script for learning.chrispeterkins.com
# This script pulls the latest code from GitHub and rebuilds the application

echo "🚀 Starting deployment for learning.chrispeterkins.com"

# Navigate to project directory
cd /var/www/learning.chrispeterkins.com

# Pull latest code from GitHub
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install

# Since this is a Vite dev project, we don't need to build
# If you want to build for production later, uncomment:
# echo "🔨 Building the project..."
# npm run build

# Restart the application with PM2
echo "🔄 Restarting application..."
pm2 restart learning.chrispeterkins.com

echo "✅ Deployment complete!"
echo "🌐 Site should be available at http://learning.chrispeterkins.com"