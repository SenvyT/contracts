# Sepolia Testnet Deployment Guide

This guide will help you deploy the Lock smart contract to the Sepolia testnet.

## Prerequisites

1. **MetaMask Wallet** with Sepolia testnet configured
2. **Sepolia ETH** for gas fees (get from [Sepolia Faucet](https://sepoliafaucet.com/))
3. **Infura Account** (or other RPC provider) for Sepolia access
4. **Etherscan API Key** for contract verification

## Setup

### 1. Environment Variables

Create a `.env` file in the root directory:

```bash
# Sepolia Testnet Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your-private-key-here
ETHERSCAN_API_KEY=your-etherscan-api-key-here
```

### 2. Get Required Keys

#### Infura Project ID
1. Go to [Infura](https://infura.io/)
2. Create an account and new project
3. Copy your project ID
4. Use: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

#### Private Key
1. Open MetaMask
2. Go to Account Details → Export Private Key
3. **⚠️ Never share your private key!**

#### Etherscan API Key
1. Go to [Etherscan](https://etherscan.io/)
2. Create an account
3. Go to API Keys section
4. Create a new API key

### 3. Get Sepolia ETH

Visit [Sepolia Faucet](https://sepoliafaucet.com/) to get test ETH for gas fees.

## Deployment

### 1. Compile Contracts

```bash
npm run compile
```

### 2. Deploy to Sepolia

```bash
npm run deploy:sepolia
```

### 3. Verify Contract (Optional)

```bash
npm run verify:sepolia
```

### 4. Get Contract Address

After deployment, note the deployed contract address from the console output. You'll need this for your frontend configuration.

## Network Configuration

The contract deployment supports:

- **Hardhat Local**: `31337` (for development)
- **Sepolia Testnet**: `11155111` (for testing)

## MetaMask Configuration

### Add Sepolia Network

If Sepolia is not in your MetaMask:

1. Open MetaMask
2. Go to Settings → Networks → Add Network
3. Add manually:
   - **Network Name**: Sepolia Testnet
   - **RPC URL**: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`
   - **Chain ID**: `11155111`
   - **Currency Symbol**: ETH
   - **Block Explorer URL**: `https://sepolia.etherscan.io`

## Testing

1. Connect your MetaMask wallet to Sepolia
2. Ensure you have Sepolia ETH for gas fees
3. Test contract interactions:
   - Deposit ETH to the contract
   - Wait for unlock time
   - Withdraw funds

## Troubleshooting

### Common Issues

1. **Insufficient Gas**: Make sure you have enough Sepolia ETH
2. **Wrong Network**: Ensure MetaMask is connected to Sepolia
3. **RPC Errors**: Check your Infura project ID and URL
4. **Verification Failed**: Ensure Etherscan API key is correct

### Reset Deployment

To redeploy the contract:

```bash
npm run deploy:sepolia:reset
```

## Security Notes

- ⚠️ **Never commit your `.env` file**
- ⚠️ **Never share your private key**
- ⚠️ **Use test accounts only for development**
- ✅ **Always verify contracts on Etherscan**
- ✅ **Test thoroughly before mainnet deployment**

## Frontend Integration

After deploying the contract, you'll need to configure your frontend with:

1. **Contract Address**: The deployed contract address
2. **Network ID**: `11155111` for Sepolia
3. **RPC URL**: Your Infura Sepolia endpoint

## Useful Links

- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Sepolia Etherscan](https://sepolia.etherscan.io/)
- [Infura Sepolia](https://infura.io/docs/ethereum/add-ons/sepolia)
- [Hardhat Networks](https://hardhat.org/hardhat-runner/docs/config#networks-configuration) 