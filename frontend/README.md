# Smart Contract Frontend

A React frontend for interacting with the Lock smart contract across multiple environments with automatic network switching and connection persistence.

## Features

- 🔗 **MetaMask Integration** - Connect your wallet seamlessly
- 🔄 **Connection Persistence** - Wallet connection persists across page refreshes
- 🌐 **Multi-Environment Support** - Local, Testing (Sepolia), and Production
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔒 **Smart Contract Interaction** - Deposit and withdraw ETH with time locks
- 🔄 **Automatic Network Switching** - Seamlessly switch networks in MetaMask
- 💰 **Environment-Specific Amounts** - Different locked amounts per environment

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the frontend directory:

```bash
# Frontend Environment
# Set to 'local' for Hardhat, 'testing' for Sepolia, 'production' for Mainnet
REACT_APP_ENVIRONMENT=local

# RPC URLs (optional - defaults provided)
REACT_APP_LOCAL_RPC_URL=http://127.0.0.1:8545
REACT_APP_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-project-id
REACT_APP_MAINNET_RPC_URL=https://mainnet.infura.io/v3/your-project-id
```

### 3. Start Development Server

```bash
npm start
```

## Environment Configuration

### Local (Development)
- **Environment**: `REACT_APP_ENVIRONMENT=local`
- **Network**: Hardhat Local (Chain ID: 31337)
- **Locked Amount**: 1000 ETH
- **Setup**: Run `npm run deploy` in parent directory

### Testing (Sepolia)
- **Environment**: `REACT_APP_ENVIRONMENT=testing`
- **Network**: Sepolia Testnet (Chain ID: 11155111)
- **Locked Amount**: 0.001 ETH
- **Setup**: Run `npm run deploy:sepolia` in parent directory

### Production (Mainnet)
- **Environment**: `REACT_APP_ENVIRONMENT=production`
- **Network**: Ethereum Mainnet (Chain ID: 1)
- **Locked Amount**: Configurable
- **Setup**: Deploy to mainnet (future)

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_ENVIRONMENT` | Environment setting | `local`, `testing`, or `production` |
| `REACT_APP_LOCAL_RPC_URL` | Local RPC endpoint | `http://127.0.0.1:8545` |
| `REACT_APP_SEPOLIA_RPC_URL` | Sepolia RPC endpoint | `https://sepolia.infura.io/v3/YOUR_PROJECT_ID` |
| `REACT_APP_MAINNET_RPC_URL` | Mainnet RPC endpoint | `https://mainnet.infura.io/v3/YOUR_PROJECT_ID` |

## MetaMask Setup

### Automatic Network Switching

The frontend automatically handles network switching:
1. **Connect Wallet** - Click "Connect MetaMask"
2. **Automatic Detection** - System detects current network
3. **Network Switch** - MetaMask prompts to switch if needed
4. **Network Addition** - Adds network to MetaMask if not present

### Manual Network Addition (if needed)

#### Add Sepolia Network
1. Open MetaMask
2. Go to Settings → Networks → Add Network
3. Add manually:
   - **Network Name**: Sepolia Testnet
   - **RPC URL**: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`
   - **Chain ID**: `11155111`
   - **Currency Symbol**: ETH
   - **Block Explorer URL**: `https://sepolia.etherscan.io`

#### Add Hardhat Local Network
1. Open MetaMask
2. Go to Settings → Networks → Add Network
3. Add manually:
   - **Network Name**: Hardhat Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: ETH

### Get Test ETH

- **Sepolia**: Visit [Sepolia Faucet](https://sepoliafaucet.com/)
- **Local**: Import accounts from Hardhat output

## Usage

### 1. Connect Wallet

1. Click "Connect MetaMask" button
2. Approve the connection in MetaMask
3. System automatically switches to correct network
4. Connection persists across page refreshes

### 2. Interact with Contract

1. Navigate to the Lock Contract page
2. View contract information (balance, owner, unlock time)
3. Deposit ETH to the contract (if needed)
4. Wait for unlock time
5. Withdraw funds

### 3. Environment Switching

1. Update `REACT_APP_ENVIRONMENT` in `.env`
2. Restart the development server
3. Reconnect wallet (automatic network switching)

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run copy-artifacts` - Copy contract artifacts from parent directory

## Project Structure

```
frontend/
├── public/              # Static assets
│   ├── artifacts/       # Contract artifacts
│   └── ignition/        # Deployment files
├── src/
│   ├── components/      # React components
│   │   ├── HomePage.js
│   │   ├── LockContractPage.js
│   │   └── WalletConnect.js
│   ├── utils/           # Web3 utilities
│   │   ├── web3.js
│   │   └── contractConfig.js
│   └── contracts/       # Contract ABIs
└── .env                 # Environment configuration
```

## Troubleshooting

### Common Issues

1. **"Contract not found"**: Ensure contract is deployed and artifacts are copied
2. **"Wrong network"**: Check MetaMask is connected to correct network
3. **"RPC error"**: Verify your Infura project ID and RPC URL
4. **"Insufficient gas"**: Get more test ETH from faucet
5. **"Invalid contract target"**: Check deployment artifacts are copied to frontend

### Reset Connection

If you encounter connection issues:

1. Disconnect wallet in the app
2. Clear browser cache
3. Reconnect MetaMask

### Deployment Issues

1. **Deploy contract first**:
   ```bash
   # For local
   npm run deploy
   
   # For Sepolia
   npm run deploy:sepolia
   ```

2. **Copy artifacts**:
   ```bash
   cp -r ignition frontend/public/
   cp -r artifacts frontend/public/
   ```

3. **Restart frontend**:
   ```bash
   npm start
   ```

## Development

### Adding New Environments

1. Create deployment module in parent directory
2. Update `contractConfig.js` with new environment
3. Add environment variables to `.env`
4. Update this README

### Adding New Contracts

1. Deploy contract using Hardhat
2. Copy artifacts to `public/artifacts/`
3. Update contract configuration
4. Add contract to HomePage contracts list

## Security Notes

- ⚠️ **Never commit `.env` files**
- ⚠️ **Use test accounts only for development**
- ✅ **Always verify contracts on Etherscan**
- ✅ **Test thoroughly before mainnet deployment**

## License

This project is open source and available under the [MIT License](../LICENSE). 