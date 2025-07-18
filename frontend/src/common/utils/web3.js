import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import contractConfig from './contractConfig';

class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.lockContract = null;
    this.simpleVaultContract = null;
    this.isConnected = false;
    this.lockContractAddress = null;
    this.lockContractABI = null;
    this.simpleVaultContractAddress = null;
    this.simpleVaultContractABI = null;
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

      // Initialize contracts
      this.initializeContracts();

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

  // Load contract configurations
  async loadContractConfigs() {
    try {
      console.log('Loading contract configs...');
      
      // Load Lock contract configuration
      const lockDeploymentInfo = await contractConfig.getDeploymentInfo('lock');
      console.log('Lock deployment info:', lockDeploymentInfo);
      this.lockContractAddress = lockDeploymentInfo.address;
      this.lockContractABI = lockDeploymentInfo.abi;
      console.log('Lock contract address set to:', this.lockContractAddress);
      
      // Test the Lock contract
      if (this.lockContractAddress) {
        await this.testLockContract();
      }
      
      // Try to load SimpleVault contract configuration (may not be deployed)
      try {
        const simpleVaultDeploymentInfo = await contractConfig.getDeploymentInfo('simplevault');
        this.simpleVaultContractAddress = simpleVaultDeploymentInfo.address;
        this.simpleVaultContractABI = simpleVaultDeploymentInfo.abi;
      } catch (simpleVaultError) {
        console.warn('SimpleVault contract not deployed:', simpleVaultError.message);
        this.simpleVaultContractAddress = null;
        this.simpleVaultContractABI = null;
      }

      return true;
    } catch (error) {
      console.error('Failed to load contract configuration:', error);
      return false;
    }
  }

  // Initialize contracts
  initializeContracts() {
    if (this.signer && this.lockContractAddress && this.lockContractABI) {
      console.log('Initializing Lock contract with address:', this.lockContractAddress);
      this.lockContract = new ethers.Contract(this.lockContractAddress, this.lockContractABI, this.signer);
      console.log('Lock contract initialized successfully');
    } else {
      console.log('Cannot initialize Lock contract - missing:', {
        signer: !!this.signer,
        address: this.lockContractAddress,
        abi: !!this.lockContractABI
      });
    }
    
    if (this.signer && this.simpleVaultContractAddress && this.simpleVaultContractABI) {
      console.log('Initializing SimpleVault contract with address:', this.simpleVaultContractAddress);
      this.simpleVaultContract = new ethers.Contract(this.simpleVaultContractAddress, this.simpleVaultContractABI, this.signer);
      console.log('SimpleVault contract initialized successfully');
    } else {
      console.log('Cannot initialize SimpleVault contract - missing:', {
        signer: !!this.signer,
        address: this.simpleVaultContractAddress,
        abi: !!this.simpleVaultContractABI
      });
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
    if (!this.provider) return '0';
    
    // Load contract config if not already loaded
    if (!this.lockContractAddress) {
      const configLoaded = await this.loadContractConfigs();
      if (!configLoaded) return '0';
    }
    
    const balance = await this.provider.getBalance(this.lockContractAddress);
    return ethers.formatEther(balance);
  }

  // Get contract owner
  async getContractOwner() {
    if (!this.signer) return null;
    
    // Load contract config if not already loaded
    if (!this.lockContract) {
      const configLoaded = await this.loadContractConfigs();
      if (!configLoaded) return null;
      this.initializeContracts();
    }
    
    try {
      console.log('Calling owner() on contract at:', this.lockContractAddress);
      const owner = await this.lockContract.owner();
      console.log('Owner result:', owner);
      return owner;
    } catch (error) {
      console.error('Error calling owner():', error);
      throw error;
    }
  }

  // Get unlock time
  async getUnlockTime() {
    if (!this.signer) return 0;
    
    // Load contract config if not already loaded
    if (!this.lockContract) {
      const configLoaded = await this.loadContractConfigs();
      if (!configLoaded) return 0;
      this.initializeContracts();
    }
    
    try {
      console.log('Calling unlockTime() on contract at:', this.lockContractAddress);
      const unlockTime = await this.lockContract.unlockTime();
      console.log('Unlock time result:', unlockTime);
      return unlockTime;
    } catch (error) {
      console.error('Error calling unlockTime():', error);
      throw error;
    }
  }



  // Withdraw funds
  async withdraw() {
    if (!this.signer) throw new Error('Wallet not connected');
    
    // Load contract config if not already loaded
    if (!this.lockContract) {
      const configLoaded = await this.loadContractConfigs();
      if (!configLoaded) throw new Error('Failed to load contract configuration. Please ensure the contract is deployed.');
      this.initializeContracts();
    }
    
    const tx = await this.lockContract.withdraw();
    const receipt = await tx.wait();
    
    return {
      success: true,
      hash: receipt.hash,
      gasUsed: receipt.gasUsed.toString()
    };
  }

  // Check if withdrawal is possible
  async canWithdraw() {
    if (!this.signer || !this.provider) return false;
    
    try {
      console.log('Checking withdrawal status...');
      
      // Load contract config if not already loaded
      if (!this.lockContract) {
        const configLoaded = await this.loadContractConfigs();
        if (!configLoaded) return false;
        this.initializeContracts();
      }
      
      console.log('Getting unlock time...');
      const unlockTime = await this.lockContract.unlockTime();
      console.log('Unlock time:', unlockTime);
      
      const currentTime = Math.floor(Date.now() / 1000);
      console.log('Current time:', currentTime);
      
      console.log('Getting owner...');
      const owner = await this.lockContract.owner();
      console.log('Owner:', owner);
      
      const currentAccount = await this.getCurrentAccount();
      console.log('Current account:', currentAccount);
      
      const canWithdraw = currentTime >= unlockTime && owner.toLowerCase() === currentAccount.toLowerCase();
      console.log('Can withdraw:', canWithdraw);
      
      return canWithdraw;
    } catch (error) {
      console.error('Error checking withdrawal status:', error);
      return false;
    }
  }

  // ===== SimpleVault Contract Methods =====

  // Get SimpleVault contract balance
  async getSimpleVaultBalance() {
    if (!this.provider) return '0';
    
    // Load contract config if not already loaded
    if (!this.simpleVaultContractAddress) {
      const configLoaded = await this.loadContractConfigs();
      if (!configLoaded || !this.simpleVaultContractAddress) {
        console.warn('SimpleVault contract not deployed');
        return '0';
      }
    }
    
    const balance = await this.provider.getBalance(this.simpleVaultContractAddress);
    return ethers.formatEther(balance);
  }

  // Get SimpleVault vault info
  async getSimpleVaultInfo() {
    if (!this.signer) return null;
    
    // Load contract config if not already loaded
    if (!this.simpleVaultContract) {
      const configLoaded = await this.loadContractConfigs();
      if (!configLoaded || !this.simpleVaultContractAddress) {
        console.warn('SimpleVault contract not deployed');
        return null;
      }
      this.initializeContracts();
    }
    
    try {
      const [name, totalDeposits, totalWithdrawals, vaultBalance, owner] = await Promise.all([
        this.simpleVaultContract.vaultName(),
        this.simpleVaultContract.totalDeposits(),
        this.simpleVaultContract.totalWithdrawals(),
        this.simpleVaultContract.getVaultBalance(),
        this.simpleVaultContract.owner()
      ]);

      const currentAccount = await this.getCurrentAccount();
      const isOwner = currentAccount && currentAccount.toLowerCase() === owner.toLowerCase();

      return {
        name,
        totalDeposits: ethers.formatEther(totalDeposits),
        totalWithdrawals: ethers.formatEther(totalWithdrawals),
        vaultBalance: ethers.formatEther(vaultBalance),
        owner,
        isOwner
      };
    } catch (error) {
      console.error('Error getting SimpleVault info:', error);
      return null;
    }
  }

  // Get SimpleVault user info
  async getSimpleVaultUserInfo() {
    if (!this.signer) return null;
    
    // Load contract config if not already loaded
    if (!this.simpleVaultContract) {
      const configLoaded = await this.loadContractConfigs();
      if (!configLoaded || !this.simpleVaultContractAddress) {
        console.warn('SimpleVault contract not deployed');
        return null;
      }
      this.initializeContracts();
    }
    
    try {
      const currentAccount = await this.getCurrentAccount();
      if (!currentAccount) return null;

      console.log('Getting SimpleVault user info for account:', currentAccount);
      console.log('SimpleVault contract address:', this.simpleVaultContractAddress);
      
      const userInfo = await this.simpleVaultContract.getUserInfo(currentAccount);
      console.log('User info result:', userInfo);
      
      return {
        totalDeposited: ethers.formatEther(userInfo.totalDeposited),
        totalWithdrawn: ethers.formatEther(userInfo.totalWithdrawn),
        remainingBalance: ethers.formatEther(userInfo.remainingBalance),
        isActive: userInfo.isActive
      };
    } catch (error) {
      console.error('Error getting SimpleVault user info:', error);
      return null;
    }
  }

  // SimpleVault deposit
  async simpleVaultDeposit(amount) {
    if (!this.signer) throw new Error('Wallet not connected');
    
    // Load contract config if not already loaded
    if (!this.simpleVaultContract) {
      const configLoaded = await this.loadContractConfigs();
      if (!configLoaded || !this.simpleVaultContractAddress) {
        throw new Error('SimpleVault contract is not deployed. Please deploy the contract first.');
      }
      this.initializeContracts();
    }
    
    const tx = await this.simpleVaultContract.deposit({ value: amount });
    const receipt = await tx.wait();
    
    return {
      success: true,
      hash: receipt.hash,
      gasUsed: receipt.gasUsed.toString()
    };
  }

  // SimpleVault withdraw
  async simpleVaultWithdraw(amount) {
    if (!this.signer) throw new Error('Wallet not connected');
    
    // Load contract config if not already loaded
    if (!this.simpleVaultContract) {
      const configLoaded = await this.loadContractConfigs();
      if (!configLoaded || !this.simpleVaultContractAddress) {
        throw new Error('SimpleVault contract is not deployed. Please deploy the contract first.');
      }
      this.initializeContracts();
    }
    
    const tx = await this.simpleVaultContract.withdraw(amount);
    const receipt = await tx.wait();
    
    return {
      success: true,
      hash: receipt.hash,
      gasUsed: receipt.gasUsed.toString()
    };
  }

  // SimpleVault change vault name
  async simpleVaultChangeName(newName) {
    if (!this.signer) throw new Error('Wallet not connected');
    
    // Load contract config if not already loaded
    if (!this.simpleVaultContract) {
      const configLoaded = await this.loadContractConfigs();
      if (!configLoaded || !this.simpleVaultContractAddress) {
        throw new Error('SimpleVault contract is not deployed. Please deploy the contract first.');
      }
      this.initializeContracts();
    }
    
    const tx = await this.simpleVaultContract.changeVaultName(newName);
    const receipt = await tx.wait();
    
    return {
      success: true,
      hash: receipt.hash,
      gasUsed: receipt.gasUsed.toString()
    };
  }

  // Listen for events
  async listenToEvents(callback) {
    if (!this.lockContract) return () => {};
    
    this.lockContract.on('Withdrawal', (amount, when) => {
      callback({
        type: 'Withdrawal',
        amount: ethers.formatEther(amount),
        when: new Date(when * 1000).toLocaleString()
      });
    });

    // Return cleanup function
    return () => {
      if (this.lockContract) {
        this.lockContract.removeAllListeners('Withdrawal');
      }
    };
  }

  // Remove event listeners
  removeEventListeners() {
    if (this.lockContract) {
      this.lockContract.removeAllListeners('Withdrawal');
    }
  }

  // Disconnect
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.lockContract = null;
    this.simpleVaultContract = null;
    this.isConnected = false;
    this.clearConnectionState();
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      hasProvider: !!this.provider,
      hasSigner: !!this.signer,
      hasLockContract: !!this.lockContract,
      hasSimpleVaultContract: !!this.simpleVaultContract
    };
  }

  // Check if contract is deployed and has code
  async isContractDeployed(address) {
    if (!this.provider) return false;
    
    try {
      const code = await this.provider.getCode(address);
      return code !== '0x';
    } catch (error) {
      console.error('Error checking contract deployment:', error);
      return false;
    }
  }

  // Test contract deployment and functions
  async testLockContract() {
    if (!this.lockContractAddress) {
      console.log('No Lock contract address available');
      return false;
    }

    console.log('Testing Lock contract at:', this.lockContractAddress);
    
    // Check if contract has code
    const hasCode = await this.isContractDeployed(this.lockContractAddress);
    console.log('Contract has code:', hasCode);
    
    if (!hasCode) {
      console.log('Contract is not deployed at this address');
      return false;
    }

    // Try to call basic functions
    try {
      const owner = await this.lockContract.owner();
      console.log('Owner function works, owner:', owner);
      
      const unlockTime = await this.lockContract.unlockTime();
      console.log('UnlockTime function works, unlock time:', unlockTime);
      
      return true;
    } catch (error) {
      console.error('Contract functions failed:', error);
      return false;
    }
  }

  // Get current account info (address and balance)
  async getCurrentAccountInfo() {
    if (!this.signer) return null;
    
    try {
      const address = await this.signer.getAddress();
      const balance = await this.getBalance(address);
      
      return {
        address,
        balance
      };
    } catch (error) {
      console.error('Error getting account info:', error);
      return null;
    }
  }
}

// Create and export the instance
const web3Service = new Web3Service();
export default web3Service; 