// Contract configuration utility
// Reads contract addresses from Hardhat deployment files

// We'll load the artifact dynamically instead of importing it

class ContractConfig {
  constructor() {
    this.environment = process.env.REACT_APP_ENVIRONMENT || 'local';
    this.contractAddress = null;
    this.abi = null;
    // Register contracts with artifact paths and module names
    this.contracts = {
      lock: {
        artifactPath: '/artifacts/contracts/Lock.sol/Lock.json',
        moduleNames: {
          local: 'LockLocalModule#Lock',
          testing: 'LockSepoliaModule#Lock',
          production: 'LockModule#Lock' // adjust if needed
        },
        address: null,
        abi: null
      },
      simplevault: {
        artifactPath: '/artifacts/contracts/SimpleVault.sol/SimpleVault.json',
        moduleNames: {
          local: 'SimpleVaultModule#SimpleVault',
          testing: 'SimpleVaultSepoliaModule#SimpleVault',
          production: 'SimpleVaultModule#SimpleVault' // adjust if needed
        },
        address: null,
        abi: null
      }
    };
  }

  // Map environment to networkId
  getNetworkId() {
    const env = this.environment;
    if (env === 'local') return '31337';
    if (env === 'testing') return '11155111';
    if (env === 'production') return '1'; // Mainnet (optional)
    return '31337';
  }

  // Get contract address for a specific contract
  async getContractAddress(contractName) {
    if (this.contracts[contractName].address) {
      return this.contracts[contractName].address;
    }

    try {
      // Try to read from ignition deployment based on network
      const chainId = this.getNetworkConfig().chainId;
      const deploymentUrl = `/ignition/deployments/chain-${chainId}/deployed_addresses.json`;
      const response = await fetch(deploymentUrl);
      if (response.ok) {
        const deployedAddresses = await response.json();
        
        // Get the correct module name based on environment and contract
        const moduleName = this.contracts[contractName].moduleNames[this.environment];
        
        if (deployedAddresses[moduleName]) {
          this.contracts[contractName].address = deployedAddresses[moduleName];
          return this.contracts[contractName].address;
        }
      }
    } catch (error) {
      console.warn(`Could not load ${contractName} from ignition deployment:`, error);
    }

    try {
      // Fallback: try to read from artifacts networks
      const response = await fetch(this.contracts[contractName].artifactPath);
      if (response.ok) {
        const artifact = await response.json();
        const networkId = this.getNetworkId();
        if (artifact.networks && artifact.networks[networkId]) {
          this.contracts[contractName].address = artifact.networks[networkId].address;
          return this.contracts[contractName].address;
        }
      }
    } catch (error) {
      console.warn(`Could not load ${contractName} from artifacts networks:`, error);
    }

    // If we get here, the contract is not deployed
    console.warn(`${contractName} contract not found in deployment files or artifacts`);
    return null;
  }

  // Get contract ABI for a specific contract
  async getContractABI(contractName) {
    if (this.contracts[contractName].abi) {
      return this.contracts[contractName].abi;
    }
    
    try {
      // Load ABI from the copied artifacts in public folder
      const artifactPath = this.contracts[contractName].artifactPath;
      const response = await fetch(artifactPath);
      if (response.ok) {
        const artifact = await response.json();
        this.contracts[contractName].abi = artifact.abi;
        return this.contracts[contractName].abi;
      }
    } catch (error) {
      console.warn(`Could not load ${contractName} ABI from artifacts:`, error);
      throw new Error(`Failed to load ${contractName} contract ABI. Please ensure artifacts are copied to public folder.`);
    }
  }

  // Get network configuration
  getNetworkConfig() {
    const env = this.environment;
    console.log('Getting network config for environment:', env);
    const configs = {
      local: {
        chainId: '31337',
        chainName: 'Hardhat Local',
        rpcUrl: process.env.REACT_APP_LOCAL_RPC_URL || 'http://127.0.0.1:8545',
        currencySymbol: 'ETH',
        blockExplorer: null
      },
      testing: {
        chainId: '11155111',
        chainName: 'Sepolia Testnet',
        rpcUrl: process.env.REACT_APP_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/your-project-id',
        currencySymbol: 'ETH',
        blockExplorer: 'https://sepolia.etherscan.io'
      },
      production: {
        chainId: '1',
        chainName: 'Ethereum Mainnet',
        rpcUrl: process.env.REACT_APP_MAINNET_RPC_URL || 'https://mainnet.infura.io/v3/your-project-id',
        currencySymbol: 'ETH',
        blockExplorer: 'https://etherscan.io'
      }
    };
    const config = configs[env] || configs['local'];
    console.log('Network config:', config);
    return config;
  }

  // Check if contract is deployed
  async isContractDeployed(contractName) {
    const address = await this.getContractAddress(contractName);
    return address && address !== '0x0000000000000000000000000000000000000000' && address !== null;
  }

  // Get deployment info for a specific contract
  async getDeploymentInfo(contractName) {
    const address = await this.getContractAddress(contractName);
    const abi = await this.getContractABI(contractName);
    const network = this.getNetworkConfig();

    return {
      address,
      abi,
      network,
      isDeployed: await this.isContractDeployed(contractName)
    };
  }

  // Get deployment info for all contracts (backward compatibility)
  async getAllDeploymentInfo() {
    // For backward compatibility, return SimpleVault info
    return await this.getDeploymentInfo('simplevault');
  }
}

// Create and export the instance
const contractConfig = new ContractConfig();
export default contractConfig; 