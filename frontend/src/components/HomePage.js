import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WalletConnect from './WalletConnect';
import walletService from '../utils/walletService';

const HomePage = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);

  const contracts = [
    {
      id: 'lock',
      name: 'Lock Smart Contract',
      status: 'active',
      icon: '🔒'
    },
    {
      id: 'simplevault',
      name: 'SimpleVault Contract',
      status: 'active',
      icon: '🏦'
    },
    // Future contracts can be added here
    // {
    //   id: 'token',
    //   name: 'Token Contract',
    //   status: 'coming-soon',
    //   icon: '🪙'
    // }
  ];

  useEffect(() => {
    checkInitialConnection();
  }, []);

  const checkInitialConnection = async () => {
    try {
      // Check for saved connection
      const savedConnection = await walletService.checkSavedConnection();
      if (savedConnection && savedConnection.success) {
        setIsWalletConnected(true);
      }
    } catch (error) {
      console.error('Error checking initial connection:', error);
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const handleWalletConnect = () => {
    setIsWalletConnected(true);
  };

  if (isCheckingConnection) {
    return (
      <div className="container">
        <div className="header">
          <h1>🚀 Smart Contract Hub</h1>
          <p>Checking wallet connection...</p>
        </div>
        <div className="card">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🚀 Smart Contract Hub</h1>
        <p>Connect your wallet to explore and interact with our collection of smart contracts</p>
      </div>

      {/* MetaMask Connect Header */}
      <div className="wallet-section">
        <WalletConnect onConnect={handleWalletConnect} />
      </div>

      {/* Contracts List - Only shown after wallet connection */}
      {isWalletConnected && (
        <div className="card">
          <h2>Available Contracts</h2>
          <div className="contracts-list">
            {contracts.map((contract) => (
              <div key={contract.id} className="contract-item">
                <div className="contract-info">
                  <span className="contract-icon">{contract.icon}</span>
                  <span className="contract-name">{contract.name}</span>
                  <span className={`status-badge ${contract.status}`}>
                    {contract.status === 'active' ? 'Active' : 'Coming Soon'}
                  </span>
                </div>
                
                {contract.status === 'active' ? (
                  <Link to={`/contract/${contract.id}`} className="button">
                    Open
                  </Link>
                ) : (
                  <button className="button secondary" disabled>
                    Coming Soon
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage; 