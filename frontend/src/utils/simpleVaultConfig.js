// SimpleVault contract configuration utility
// Reads contract addresses from Hardhat deployment files

class SimpleVaultConfig {
  constructor() {
    this.environment = process.env.REACT_APP_ENVIRONMENT || 'local';
    this.contractAddress = null;
    this.abi = null;
  }

  // Map environment to networkId
  getNetworkId() {
    const env = this.environment;
    if (env === 'local') return '31337';
    if (env === 'testing') return '11155111';
    if (env === 'production') return '1'; // Mainnet (optional)
    return '31337';
  }

  // Get contract address from deployment files
  async getContractAddress() {
    if (this.contractAddress) {
      return this.contractAddress;
    }

    try {
      // Try to read from ignition deployment based on network
      const chainId = this.getNetworkConfig().chainId;
      const response = await fetch(`/ignition/deployments/chain-${chainId}/deployed_addresses.json`);
      if (response.ok) {
        const deployedAddresses = await response.json();
        
        // Get the correct module name based on environment
        let moduleName = 'SimpleVaultModule#SimpleVault'; // default for local
        if (this.environment === 'testing') {
          moduleName = 'SimpleVaultSepoliaModule#SimpleVault';
        } else if (this.environment === 'production') {
          moduleName = 'SimpleVaultMainnetModule#SimpleVault'; // if you create this later
        }
        
        this.contractAddress = deployedAddresses[moduleName];
        console.log('SimpleVault address loaded from deployment:', this.contractAddress);
        return this.contractAddress;
      }
    } catch (error) {
      console.warn('Could not load SimpleVault from ignition deployment:', error);
    }

    try {
      // Fallback: try to read from artifacts networks
      const response = await fetch('/artifacts/contracts/SimpleVault.sol/SimpleVault.json');
      if (response.ok) {
        const artifact = await response.json();
        const networkId = this.getNetworkId();
        if (artifact.networks && artifact.networks[networkId]) {
          this.contractAddress = artifact.networks[networkId].address;
          console.log('SimpleVault address loaded from artifacts:', this.contractAddress);
          return this.contractAddress;
        }
      }
    } catch (error) {
      console.warn('Could not load SimpleVault from artifacts networks:', error);
    }

    // Final fallback: use default
    this.contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    console.log('Using fallback SimpleVault address:', this.contractAddress);
    return this.contractAddress;
  }

  // Get contract ABI
  async getContractABI() {
    if (this.abi) {
      return this.abi;
    }
    
    try {
      // Load ABI from the copied artifacts in public folder
      const response = await fetch('/artifacts/contracts/SimpleVault.sol/SimpleVault.json');
      if (response.ok) {
        const artifact = await response.json();
        this.abi = artifact.abi;
        return this.abi;
      }
    } catch (error) {
      console.warn('Could not load SimpleVault ABI from artifacts:', error);
      throw new Error('Failed to load SimpleVault ABI. Please ensure artifacts are copied to public folder.');
    }
  }

  // Get network configuration
  getNetworkConfig() {
    const env = this.environment;
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
    return configs[env] || configs['local'];
  }

  // Check if contract is deployed
  async isContractDeployed() {
    const address = await this.getContractAddress();
    return address && address !== '0x0000000000000000000000000000000000000000';
  }

  // Get deployment info
  async getDeploymentInfo() {
    const address = await this.getContractAddress();
    const abi = await this.getContractABI();
    const network = this.getNetworkConfig();

    return {
      address,
      abi,
      network,
      isDeployed: await this.isContractDeployed()
    };
  }
}

// Create and export the instance
const simpleVaultConfig = new SimpleVaultConfig();
export default simpleVaultConfig; 