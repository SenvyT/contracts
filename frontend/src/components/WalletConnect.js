import React, { useState, useEffect, useCallback } from 'react';
import web3Service from '../utils/web3';
import contractConfig from '../utils/contractConfig';

const WalletConnect = ({ onConnect, onDisconnect }) => {
  console.log('WalletConnect: onDisconnect prop:', !!onDisconnect);
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('0');
  const [error, setError] = useState('');

  const disconnectWallet = useCallback(() => {
    console.log('WalletConnect: Disconnecting wallet...');
    
    try {
      web3Service.disconnect();
      setAccount(null);
      setBalance('0');
      setError('');
      
      if (onDisconnect) {
        onDisconnect();
      }
      
      console.log('WalletConnect: Wallet disconnected successfully');
    } catch (error) {
      console.error('WalletConnect: Error in disconnectWallet:', error);
    }
  }, [onDisconnect]);

  useEffect(() => {
    checkConnection();
    
    // Listen for MetaMask account changes
    const handleAccountsChanged = (accounts) => {
      console.log('MetaMask accounts changed:', accounts);
      if (accounts.length === 0) {
        // User disconnected
        disconnectWallet();
      } else {
        // User switched accounts
        const newAddress = accounts[0];
        web3Service.saveConnectionState(newAddress);
        setAccount(newAddress);
        web3Service.getBalance(newAddress).then(setBalance);
        // Notify parent component about account change
        onConnect && onConnect();
      }
    };

    // Listen for chain changes
    const handleChainChanged = (chainId) => {
      console.log('MetaMask chain changed:', chainId);
      // Reload the page when chain changes
      window.location.reload();
    };

    // Add event listeners
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    // Cleanup
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [onConnect, onDisconnect, disconnectWallet]);

  const checkConnection = async () => {
    console.log('Checking wallet connection...');
    
    // Check if there's a valid saved connection
    const savedConnection = await web3Service.checkSavedConnection();
    if (savedConnection && savedConnection.success) {
      console.log('Restored connection from localStorage');
      setAccount(savedConnection.address);
      const accountBalance = await web3Service.getBalance(savedConnection.address);
      setBalance(accountBalance);
      onConnect && onConnect();
      return;
    }

    console.log('No wallet connection found');
  };

  const connectWallet = async () => {
    console.log('Connecting wallet...');
    setIsConnecting(true);
    setError('');

    try {
      const result = await web3Service.connect();
      
      if (result.success) {
        console.log('Wallet connected successfully:', result.address);
        setAccount(result.address);
        const accountBalance = await web3Service.getBalance(result.address);
        setBalance(accountBalance);
        onConnect && onConnect();
      } else {
        console.error('Wallet connection failed:', result.error);
        setError(result.error);
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkInfo = () => {
    const networkConfig = contractConfig.getNetworkConfig();
    return networkConfig;
  };

  if (account) {
    const networkInfo = getNetworkInfo();
    return (
      <div className="card">
        <h3>Wallet Connected</h3>
        <div className="flex-column">
          <div className="flex">
            <strong>Address:</strong>
            <span>{formatAddress(account)}</span>
          </div>
          <div className="flex">
            <strong>Balance:</strong>
            <span>{parseFloat(balance).toFixed(4)} {networkInfo.currencySymbol}</span>
          </div>
          <div className="flex">
            <strong>Network:</strong>
            <span>{networkInfo.chainName}</span>
          </div>
          <button 
            className="button secondary" 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Disconnect button clicked!');
              try {
                disconnectWallet();
              } catch (error) {
                console.error('Error in disconnectWallet:', error);
              }
            }}
            style={{ cursor: 'pointer' }}
            data-testid="disconnect-button"
          >
            Disconnect Wallet
          </button>
        </div>
      </div>
    );
  }

  const networkInfo = getNetworkInfo();
  return (
    <div className="card">
      <h3>Connect Your Wallet</h3>
      <p className="mb-16">
        Connect your MetaMask wallet to interact with smart contracts.
      </p>
      
      {error && (
        <div className="status error">
          {error}
        </div>
      )}
      
      <button 
        className="button" 
        onClick={connectWallet}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <>
            <span className="loading"></span>
            Connecting...
          </>
        ) : (
          'Connect MetaMask'
        )}
      </button>
      
      <div className="status info">
        <strong>Note:</strong> Make sure you're connected to the {networkInfo.chainName} (Chain ID: {networkInfo.chainId})
      </div>
    </div>
  );
};

export default WalletConnect; 