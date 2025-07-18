import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

class WalletService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.isConnected = false;
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
      if (accounts.length === 0) {
        console.log('No accounts found in MetaMask');
        return null;
      }

      const currentAddress = accounts[0];
      console.log('Current MetaMask address:', currentAddress);
      console.log('Saved address:', savedState.address);
      
      if (currentAddress.toLowerCase() !== savedState.address.toLowerCase()) {
        console.log('Address mismatch, clearing saved state');
        this.clearConnectionState();
        return null;
      }

      // Re-establish connection
      this.provider = new ethers.BrowserProvider(provider);
      this.signer = await this.provider.getSigner();
      this.isConnected = true;

      console.log('Successfully restored wallet connection');

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

  // Disconnect
  disconnect() {
    console.log('WalletService: Disconnecting wallet');
    this.provider = null;
    this.signer = null;
    this.isConnected = false;
    this.clearConnectionState();
    console.log('WalletService: Wallet disconnected successfully');
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      hasProvider: !!this.provider,
      hasSigner: !!this.signer
    };
  }

  // Check if MetaMask is already connected (without requesting accounts)
  async checkMetaMaskConnection() {
    try {
      const provider = await detectEthereumProvider();
      if (!provider) return null;

      // Check if already connected without requesting accounts
      const accounts = await provider.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        return accounts[0];
      }
      return null;
    } catch (error) {
      console.error('Error checking MetaMask connection:', error);
      return null;
    }
  }
}

// Create and export the instance
const walletService = new WalletService();
export default walletService; 