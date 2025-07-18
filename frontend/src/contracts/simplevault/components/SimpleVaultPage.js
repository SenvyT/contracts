import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletConnect, web3Service, contractConfig } from '../../../common';
import SimpleVaultInfo from './SimpleVaultInfo';
import SimpleVaultActions from './SimpleVaultActions';

const SimpleVaultPage = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);

  useEffect(() => {
    checkInitialConnection();
  }, []);

  const checkInitialConnection = async () => {
    try {
      // Check for saved connection
      const savedConnection = await web3Service.checkSavedConnection();
      if (savedConnection && savedConnection.success) {
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error checking initial connection:', error);
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const handleConnect = () => {
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    navigate('/');
  };

  const handleActionComplete = () => {
    // Refresh contract info after actions
    window.location.reload();
  };

  const getNetworkInfo = () => {
    const networkConfig = contractConfig.getNetworkConfig();
    return networkConfig;
  };

  if (isCheckingConnection) {
    return (
      <div className="container">
        <div className="header">
          <button onClick={() => navigate('/')} className="back-link">← Back to Home</button>
          <h1>🏦 SimpleVault</h1>
          <p>Checking wallet connection...</p>
        </div>
        <div className="card">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  const networkInfo = getNetworkInfo();

  return (
    <div className="container">
      <div className="header">
        <button onClick={() => navigate('/')} className="back-link">← Back to Home</button>
        <h1>🏦 SimpleVault</h1>
        <p>Session 1: Foundation - Basic Vault Operations</p>
      </div>

      <WalletConnect onConnect={handleConnect} onDisconnect={handleDisconnect} />

      <SimpleVaultInfo />
      <SimpleVaultActions onActionComplete={handleActionComplete} />

      {/* Footer */}
      <div className="card text-center">
        <p>
          <strong>Built with:</strong> React, Ethers.js, MetaMask, Hardhat
        </p>
        <p>
          <strong>Network:</strong> {networkInfo.chainName} (Chain ID: {networkInfo.chainId})
        </p>
        {networkInfo.blockExplorer && (
          <p>
            <strong>Block Explorer:</strong> <a href={networkInfo.blockExplorer} target="_blank" rel="noopener noreferrer">{networkInfo.blockExplorer}</a>
          </p>
        )}
      </div>
    </div>
  );
};

export default SimpleVaultPage; 