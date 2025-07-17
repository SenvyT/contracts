# Smart Contract Demo

This project demonstrates a time-locked Ethereum smart contract with support for multiple environments (local, testing, production) and automatic network switching.

## Features

- 🔒 **Time-locked Smart Contract** - Deposit ETH and withdraw after unlock time
- 🌐 **Multi-Environment Support** - Local, Testing (Sepolia), and Production
- 🔍 **Contract Verification** - Support for Etherscan verification
- 📦 **Hardhat Ignition** - Modern deployment system
- 🔄 **Automatic Network Switching** - Seamless MetaMask integration
- 💰 **Network-Specific Amounts** - Different locked amounts per environment

## Quick Start

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start local blockchain**
   ```bash
   npm run node
   ```

3. **Deploy contract**
   ```bash
   npm run deploy
   ```

4. **Start frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Sepolia Testnet Deployment

For deploying to Sepolia testnet, see [SEPOLIA_DEPLOYMENT.md](./SEPOLIA_DEPLOYMENT.md)

## Available Scripts

### Local Development
- `npm run node` - Start Hardhat node
- `npm run compile` - Compile contracts
- `npm run deploy` - Deploy to localhost (1000 ETH)
- `npm run test` - Run tests

### Sepolia Deployment
- `npm run deploy:sepolia` - Deploy to Sepolia (0.001 ETH)
- `npm run verify:sepolia` - Verify contract on Etherscan
- `npm run console:sepolia` - Open Hardhat console on Sepolia

### Utilities
- `npm run clean` - Clean build artifacts
- `npm run reset` - Reset and recompile everything

## Project Structure

```
demo_contracts/
├── contracts/          # Smart contracts
├── ignition/           # Deployment modules
│   └── modules/
│       ├── Lock.ts     # Generic deployment
│       ├── LockLocal.ts # Local deployment (1000 ETH)
│       └── LockSepolia.ts # Sepolia deployment (0.001 ETH)
├── frontend/           # React application
├── test/               # Contract tests
└── scripts/            # Deployment scripts
```

## Environment Configuration

The project supports three environments:

### Local (Development)
- **Network**: Hardhat Local (Chain ID: 31337)
- **Locked Amount**: 1000 ETH
- **Deployment**: `LockLocal.ts`
- **Use Case**: Development and testing

### Testing (Sepolia)
- **Network**: Sepolia Testnet (Chain ID: 11155111)
- **Locked Amount**: 0.001 ETH
- **Deployment**: `LockSepolia.ts`
- **Use Case**: Testnet deployment

### Production (Mainnet)
- **Network**: Ethereum Mainnet (Chain ID: 1)
- **Locked Amount**: Configurable
- **Deployment**: `LockMainnet.ts` (future)
- **Use Case**: Production deployment

## Frontend Configuration

The frontend uses environment-based configuration:

```env
# Frontend Environment
REACT_APP_ENVIRONMENT=local  # local, testing, or production

# RPC URLs (optional - defaults provided)
REACT_APP_LOCAL_RPC_URL=http://127.0.0.1:8545
REACT_APP_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-project-id
REACT_APP_MAINNET_RPC_URL=https://mainnet.infura.io/v3/your-project-id
```

## Deployment Details

### Local Deployment
```bash
npm run deploy
# Deploys LockLocal.ts with 1000 ETH locked
```

### Sepolia Deployment
```bash
npm run deploy:sepolia
# Deploys LockSepolia.ts with 0.001 ETH locked
```

### Contract Addresses
- Contract addresses are automatically detected from deployment files
- Frontend adapts to different module names per environment
- No manual configuration required

## Technologies Used

- **Smart Contracts**: Solidity, Hardhat
- **Deployment**: Hardhat Ignition
- **Testing**: Hardhat Test
- **Verification**: Etherscan API
- **Frontend**: React, Ethers.js, MetaMask
- **Networks**: Hardhat Local, Sepolia Testnet

## Contract Details

The `Lock` contract allows users to:
- Deposit ETH with a time lock
- Withdraw funds after the unlock time has passed
- Only the contract owner can withdraw before the unlock time

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
