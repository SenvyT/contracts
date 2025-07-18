import React, { useState, useEffect, useCallback } from 'react';
import web3Service from '../utils/web3';
import contractConfig from '../utils/contractConfig';

const WalletConnect = ({ onConnect, onDisconnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const disconnectWallet = useCallback(() => {
    try {
      web3Service.disconnect();
      setError('');
      
      if (onDisconnect) {
        onDisconnect();
      }
    } catch (error) {
      console.error('WalletConnect: Error in disconnectWallet:', error);
    }
  }, [onDisconnect]);

  useEffect(() => {
    checkConnection();
    
    // Listen for MetaMask account changes
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // User disconnected
        disconnectWallet();
      } else {
        // User switched accounts
        const newAddress = accounts[0];
        web3Service.saveConnectionState(newAddress);
        // Notify parent component about account change
        onConnect && onConnect();
      }
    };

    // Listen for chain changes
    const handleChainChanged = (chainId) => {
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
    // Check if there's a valid saved connection
    const savedConnection = await web3Service.checkSavedConnection();
    if (savedConnection && savedConnection.success) {
      onConnect && onConnect();
      return;
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError('');

    try {
      const result = await web3Service.connect();
      
      if (result.success) {
        onConnect && onConnect();
      } else {
        setError(result.error);
      }
    } catch (err) {
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

  // Get connection status from web3Service
  const connectionStatus = web3Service.getConnectionStatus();
  const [accountInfo, setAccountInfo] = useState(null);
  
  // Fetch account info when connected
  useEffect(() => {
    if (connectionStatus.isConnected) {
      web3Service.getCurrentAccountInfo().then(setAccountInfo);
    } else {
      setAccountInfo(null);
    }
  }, [connectionStatus.isConnected]);
  
  if (connectionStatus.isConnected && accountInfo) {
    const networkInfo = getNetworkInfo();
    return (
      <div className="card">
        <h3>Wallet Connected</h3>
        <div className="flex-column">
          <div className="flex">
            <strong>Address:</strong>
            <span>{formatAddress(accountInfo.address)}</span>
          </div>
          <div className="flex">
            <strong>Balance:</strong>
            <span>{parseFloat(accountInfo.balance).toFixed(4)} {networkInfo.currencySymbol}</span>
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