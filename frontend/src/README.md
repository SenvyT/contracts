# Frontend Project Structure

This directory contains the React frontend for the smart contract demo project.

## Directory Structure

```
frontend/src/
├── common/                    # Shared components and utilities
│   ├── components/           # Common React components
│   │   ├── HomePage.js       # Main homepage component
│   │   └── WalletConnect.js  # MetaMask wallet connection component
│   ├── utils/                # Shared utilities
│   │   ├── contractConfig.js # Contract configuration management
│   │   └── web3.js          # Web3 service for blockchain interactions
│   └── index.js             # Common exports
├── contracts/                # Contract-specific directories
│   ├── lock/                # Lock smart contract
│   │   ├── components/      # Lock contract components
│   │   │   ├── LockContractPage.js  # Main lock contract page
│   │   │   ├── ContractInfo.js      # Contract information display
│   │   │   └── ContractActions.js   # Contract interaction actions
│   │   └── index.js         # Lock contract exports
│   └── simplevault/         # SimpleVault smart contract
│       ├── components/      # SimpleVault contract components
│       │   ├── SimpleVaultPage.js    # Main vault page
│       │   ├── SimpleVaultInfo.js    # Vault information display
│       │   └── SimpleVaultActions.js # Vault interaction actions
│       └── index.js         # SimpleVault contract exports
├── App.js                   # Main React application component
├── index.js                 # React application entry point
└── README.md               # This file
```

## Import Patterns

### From App.js
```javascript
import { HomePage } from './common';
import { LockContractPage } from './contracts/lock';
import { SimpleVaultPage } from './contracts/simplevault';
```

### From Contract Components
```javascript
import { WalletConnect, web3Service, contractConfig } from '../../../common';
```

### From Common Components
```javascript
import web3Service from '../utils/web3';
import contractConfig from '../utils/contractConfig';
```

## Benefits of This Structure

1. **Modularity**: Each contract has its own directory with dedicated components
2. **Reusability**: Common components and utilities are shared across contracts
3. **Scalability**: Easy to add new contracts by creating new directories
4. **Maintainability**: Clear separation of concerns and organized imports
5. **Clean Imports**: Index files provide clean import paths

## Adding New Contracts

To add a new contract:

1. Create a new directory under `contracts/` (e.g., `contracts/token/`)
2. Create a `components/` subdirectory
3. Add contract-specific components
4. Create an `index.js` file to export components
5. Update `App.js` to import and route to the new contract 