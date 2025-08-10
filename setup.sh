#!/bin/bash

echo "🚀 Setting up File Upload Application..."
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js version 14 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Setup Backend
echo ""
echo "📦 Setting up Backend (Express.js)..."
cd server

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install backend dependencies"
        exit 1
    fi
else
    echo "✅ Backend dependencies already installed"
fi

# Create uploads directory if it doesn't exist
mkdir -p uploads
echo "✅ Uploads directory created"

cd ..

# Setup Frontend
echo ""
echo "📦 Setting up Frontend (Nuxt.js)..."
cd client

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies"
        exit 1
    fi
else
    echo "✅ Frontend dependencies already installed"
fi

cd ..

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🚀 To start the application:"
echo ""
echo "1. Start the backend server:"
echo "   cd server && npm run dev"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd client && npm run dev"
echo ""
echo "3. Open your browser and navigate to:"
echo "   http://localhost:3000"
echo ""
echo "📖 For more information, see the README.md files in each directory." 