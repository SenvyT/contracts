import React, { useState, useEffect } from 'react';
import walletService from '../utils/walletService';
import contractConfig from '../utils/contractConfig';

const WalletConnect = ({ onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('0');
  const [error, setError] = useState('');

  useEffect(() => {
    checkConnection();
  }, [onConnect]);

  const checkConnection = async () => {
    // First try to restore saved connection
    const savedConnection = await walletService.checkSavedConnection();
    if (savedConnection && savedConnection.success) {
      setAccount(savedConnection.address);
      const accountBalance = await walletService.getBalance(savedConnection.address);
      setBalance(accountBalance);
      onConnect && onConnect();
      return;
    }

    // Fallback to checking current connection status
    const status = walletService.getConnectionStatus();
    if (status.isConnected) {
      const currentAccount = await walletService.getCurrentAccount();
      if (currentAccount) {
        setAccount(currentAccount);
        const accountBalance = await walletService.getBalance(currentAccount);
        setBalance(accountBalance);
        onConnect && onConnect();
      }
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError('');

    try {
      const result = await walletService.connect();
      
      if (result.success) {
        setAccount(result.address);
        const accountBalance = await walletService.getBalance(result.address);
        setBalance(accountBalance);
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

  const disconnectWallet = () => {
    walletService.disconnect();
    setAccount(null);
    setBalance('0');
    setError('');
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
            onClick={disconnectWallet}
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