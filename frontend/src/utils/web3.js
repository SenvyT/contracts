import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import contractConfig from './contractConfig';

class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.isConnected = false;
    this.contractAddress = null;
    this.contractABI = null;
    this.connectionKey = 'zerotheft_wallet_connection';
  }

  // Save connection state to localStorage
  saveConnectionState(address) {
    try {
      const connectionState = {
        address: address,
        timestamp: Date.now(),
        isConnected: true
      };
      localStorage.setItem(this.connectionKey, JSON.stringify(connectionState));
    } catch (error) {
      console.error('Failed to save connection state:', error);
    }
  }

  // Load connection state from localStorage
  loadConnectionState() {
    try {
      const savedState = localStorage.getItem(this.connectionKey);
      return savedState ? JSON.parse(savedState) : null;
    } catch (error) {
      console.error('Failed to load connection state:', error);
      return null;
    }
  }

  // Clear connection state from localStorage
  clearConnectionState() {
    try {
      localStorage.removeItem(this.connectionKey);
    } catch (error) {
      console.error('Failed to clear connection state:', error);
    }
  }

  // Check if there's a valid saved connection
  async checkSavedConnection() {
    const savedState = this.loadConnectionState();
    if (!savedState) return null;

    // Check if the saved connection is not too old (24 hours)
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    if (Date.now() - savedState.timestamp > maxAge) {
      this.clearConnectionState();
      return null;
    }

    try {
      const provider = await detectEthereumProvider();
      if (!provider) return null;

      // Check if the same account is still connected
      const accounts = await provider.request({ method: 'eth_accounts' });
      if (accounts.length === 0) return null;

      const currentAddress = accounts[0];
      if (currentAddress.toLowerCase() !== savedState.address.toLowerCase()) {
        this.clearConnectionState();
        return null;
      }

      // Re-establish connection
      this.provider = new ethers.BrowserProvider(provider);
      this.signer = await this.provider.getSigner();
      this.isConnected = true;

      // Load contract configuration
      await this.loadContractConfig();

      // Check network
      const network = await this.provider.getNetwork();
      const networkConfig = contractConfig.getNetworkConfig();
      if (network.chainId.toString() !== networkConfig.chainId) {
        // Try to automatically switch network
        const switchSuccess = await this.switchNetwork();
        
        if (!switchSuccess) {
          this.disconnect();
          return null;
        }
        
        // Re-initialize provider after network switch
        this.provider = new ethers.BrowserProvider(provider);
        this.signer = await this.provider.getSigner();
      }

      // Initialize contract
      this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.signer);

      return {
        success: true,
        address: currentAddress
      };
    } catch (error) {
      console.error('Failed to restore saved connection:', error);
      this.clearConnectionState();
      return null;
    }
  }

  // Switch to the correct network
  async switchNetwork() {
    try {
      const provider = await detectEthereumProvider();
      if (!provider) return false;

      const networkConfig = contractConfig.getNetworkConfig();
      const targetChainId = networkConfig.chainId;

      // Check current network
      const currentNetwork = await provider.request({ method: 'eth_chainId' });
      
      if (currentNetwork === targetChainId) {
        return true; // Already on correct network
      }

      // Try to switch network
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${parseInt(targetChainId).toString(16)}` }],
        });
        return true;
      } catch (switchError) {
        // If the network doesn't exist in MetaMask, add it
        if (switchError.code === 4902) {
          try {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${parseInt(targetChainId).toString(16)}`,
                chainName: networkConfig.chainName,
                nativeCurrency: {
                  name: 'Ether',
                  symbol: networkConfig.currencySymbol,
                  decimals: 18
                },
                rpcUrls: [networkConfig.rpcUrl],
                blockExplorerUrls: networkConfig.blockExplorer ? [networkConfig.blockExplorer] : []
              }],
            });
            return true;
          } catch (addError) {
            console.error('Failed to add network:', addError);
            return false;
          }
        } else {
          console.error('Failed to switch network:', switchError);
          return false;
        }
      }
    } catch (error) {
      console.error('Network switching error:', error);
      return false;
    }
  }

  // Connect to MetaMask
  async connect() {
    try {
      const provider = await detectEthereumProvider();
      
      if (!provider) {
        throw new Error('Please install MetaMask!');
      }

      // Request account access
      await provider.request({ method: 'eth_requestAccounts' });
      
      this.provider = new ethers.BrowserProvider(provider);
      this.signer = await this.provider.getSigner();
      this.isConnected = true;

      const address = await this.signer.getAddress();
      
      // Save connection state
      this.saveConnectionState(address);

      // Load contract configuration
      await this.loadContractConfig();

      // Check if we're on the correct network and switch if needed
      const network = await this.provider.getNetwork();
      const networkConfig = contractConfig.getNetworkConfig();
      
      if (network.chainId.toString() !== networkConfig.chainId) {
        // Try to automatically switch network
        const switchSuccess = await this.switchNetwork();
        
        if (!switchSuccess) {
          throw new Error(`Please connect to the correct network. Expected: ${networkConfig.chainName} (${networkConfig.chainId}), Got: ${network.chainId}`);
        }
        
        // Re-initialize provider after network switch
        this.provider = new ethers.BrowserProvider(provider);
        this.signer = await this.provider.getSigner();
      }

      // Initialize contract
      this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.signer);

      return {
        success: true,
        address: address
      };
    } catch (error) {
      console.error('Connection error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Load contract configuration
  async loadContractConfig() {
    try {
      const deploymentInfo = await contractConfig.getDeploymentInfo();
      this.contractAddress = deploymentInfo.address;
      this.contractABI = deploymentInfo.abi;
      
      console.log('Contract configuration loaded:', {
        address: this.contractAddress,
        network: deploymentInfo.network,
        isDeployed: deploymentInfo.isDeployed
      });
    } catch (error) {
      console.error('Failed to load contract configuration:', error);
      throw new Error('Failed to load contract configuration. Please ensure the contract is deployed.');
    }
  }

  // Get current account
  async getCurrentAccount() {
    if (!this.signer) return null;
    return await this.signer.getAddress();
  }

  // Get account balance
  async getBalance(address) {
    if (!this.provider) return '0';
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  // Get contract balance
  async getContractBalance() {
    if (!this.provider || !this.contractAddress) return '0';
    const balance = await this.provider.getBalance(this.contractAddress);
    return ethers.formatEther(balance);
  }

  // Get contract owner
  async getContractOwner() {
    if (!this.contract) return null;
    return await this.contract.owner();
  }

  // Get unlock time
  async getUnlockTime() {
    if (!this.contract) return 0;
    return await this.contract.unlockTime();
  }



  // Withdraw funds
  async withdraw() {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const tx = await this.contract.withdraw();
    const receipt = await tx.wait();
    
    return {
      success: true,
      hash: receipt.hash,
      gasUsed: receipt.gasUsed.toString()
    };
  }

  // Check if withdrawal is possible
  async canWithdraw() {
    if (!this.contract || !this.provider) return false;
    
    try {
      const unlockTime = await this.contract.unlockTime();
      const currentTime = Math.floor(Date.now() / 1000);
      const owner = await this.contract.owner();
      const currentAccount = await this.getCurrentAccount();
      
      return currentTime >= unlockTime && owner.toLowerCase() === currentAccount.toLowerCase();
    } catch (error) {
      console.error('Error checking withdrawal status:', error);
      return false;
    }
  }

  // Listen for events
  async listenToEvents(callback) {
    if (!this.contract) return () => {};
    
    this.contract.on('Withdrawal', (amount, when) => {
      callback({
        type: 'Withdrawal',
        amount: ethers.formatEther(amount),
        when: new Date(when * 1000).toLocaleString()
      });
    });

    // Return cleanup function
    return () => {
      if (this.contract) {
        this.contract.removeAllListeners('Withdrawal');
      }
    };
  }

  // Remove event listeners
  removeEventListeners() {
    if (this.contract) {
      this.contract.removeAllListeners('Withdrawal');
    }
  }

  // Disconnect
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.isConnected = false;
    this.clearConnectionState();
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      hasProvider: !!this.provider,
      hasSigner: !!this.signer,
      hasContract: !!this.contract
    };
  }
}

// Create and export the instance
const web3Service = new Web3Service();
export default web3Service; 