#!/bin/bash

echo "🔒 Setting up Lock Smart Contract Frontend..."
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cat > .env << EOF
REACT_APP_NETWORK_ID=31337
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Copy contract artifacts
echo "📋 Copying contract artifacts..."
node public/copy-artifacts.js

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start Hardhat network: npx hardhat node"
echo "2. Deploy contract: npx hardhat run scripts/deploy.js --network localhost"
echo "3. Start frontend: npm start"
echo ""
echo "Make sure to:"
echo "- Install MetaMask browser extension"
echo "- Add Hardhat network to MetaMask (Chain ID: 31337)"
echo "- Import test accounts with ETH"
echo ""
echo "Happy coding! 🚀" 