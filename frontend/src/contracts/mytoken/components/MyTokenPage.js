import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WalletConnect, web3Service, contractConfig } from '../../../common';
import MyTokenInfo from './MyTokenInfo';
import MyTokenActions from './MyTokenActions';

const MyTokenPage = () => {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
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

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
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
          <Link to="/" className="back-link">← Back to Home</Link>
          <h1>🪙 MyToken Dashboard</h1>
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
        <Link to="/" className="back-link">← Back to Home</Link>
        <h1>🪙 MyToken Dashboard</h1>
        <p>Manage your advanced ERC-20 token with minting, burning, and admin features</p>
      </div>

      <WalletConnect onConnect={handleConnect} onDisconnect={handleDisconnect} />

      <MyTokenInfo key={refreshKey} onRefresh={handleRefresh} />
      <MyTokenActions onActionComplete={handleActionComplete} />

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

export default MyTokenPage; 