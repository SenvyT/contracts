import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WalletConnect from './WalletConnect';
import ContractInfo from './ContractInfo';
import ContractActions from './ContractActions';
import web3Service from '../utils/web3';
import contractConfig from '../utils/contractConfig';

const LockContractPage = () => {
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
          <h1>🔒 Lock Smart Contract</h1>
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
        <h1>🔒 Lock Smart Contract</h1>
        <p>A time-locked Ethereum smart contract with a modern React frontend</p>
      </div>

      <WalletConnect onConnect={handleConnect} onDisconnect={handleDisconnect} />

      {isConnected ? (
        <>
          <ContractInfo />
          <ContractActions onActionComplete={handleActionComplete} />
        </>
      ) : (
        <div className="card">
          <h2>Wallet Required</h2>
          <p>Please connect your MetaMask wallet to interact with the Lock smart contract.</p>
          <div className="status info">
            <strong>Note:</strong> You need to connect your wallet to view contract information and perform actions.
          </div>
        </div>
      )}

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

export default LockContractPage; 