#!/bin/bash

# TrustAid Backend - Quick Start Script
# This script sets up the development environment and starts the server

set -e

echo "🚀 TrustAid Backend - Quick Start"
echo "=================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file from template..."
  cp .env.example .env
  echo "✓ .env created. Please edit it with your MongoDB URI and JWT_SECRET"
  echo ""
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo "✓ Dependencies installed"
  echo ""
fi

# Check if MongoDB is running
echo "🔍 Checking MongoDB connection..."
if mongod --version > /dev/null 2>&1; then
  echo "✓ MongoDB is available"
else
  echo "⚠ MongoDB not found. Make sure MongoDB is installed and running:"
  echo "  mongod --dbpath ./data"
  echo ""
fi

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Edit .env with your MongoDB URI and JWT_SECRET"
echo "2. Start MongoDB: mongod --dbpath ./data"
echo "3. Start the server:"
echo "   npm run dev    (development with auto-reload)"
echo "   npm start      (production)"
echo ""
echo "The server will run at http://localhost:5000"
echo "API endpoint: http://localhost:5000/api"
echo ""
echo "For testing the API, see API_TESTING.md"
echo ""
