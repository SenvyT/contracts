import React, { useState, useEffect } from 'react';
import web3Service from '../utils/web3';

const ContractInfo = () => {
  const [contractBalance, setContractBalance] = useState('0');
  const [owner, setOwner] = useState('');
  const [unlockTime, setUnlockTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadContractInfo();
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadContractInfo = async () => {
    setIsLoading(true);
    setError('');

    try {
      const status = web3Service.getConnectionStatus();
      if (!status.isConnected) {
        setError('Please connect your wallet first');
        setIsLoading(false);
        return;
      }

      const [balance, contractOwner, unlock] = await Promise.all([
        web3Service.getContractBalance(),
        web3Service.getContractOwner(),
        web3Service.getUnlockTime()
      ]);

      setContractBalance(balance);
      setOwner(contractOwner);
      setUnlockTime(Number(unlock));
      setCurrentTime(Math.floor(Date.now() / 1000));
    } catch (err) {
      setError('Failed to load contract information: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (timestamp === 0) return 'Not set';
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getTimeRemaining = () => {
    if (unlockTime === 0) return 'No unlock time set';
    
    const remaining = unlockTime - currentTime;
    if (remaining <= 0) return 'Unlocked!';
    
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const isUnlocked = currentTime >= unlockTime && unlockTime > 0;

  if (isLoading) {
    return (
      <div className="card">
        <h3>Contract Information</h3>
        <div className="text-center">
          <span className="loading"></span>
          <p>Loading contract information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h3>Contract Information</h3>
        <div className="status error">
          {error}
        </div>
        <button className="button" onClick={loadContractInfo}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Contract Information</h3>
      
      <div className="balance-display">
        <h3>Contract Balance</h3>
        <div className="amount">{parseFloat(contractBalance).toFixed(4)} ETH</div>
      </div>

      <div className="grid">
        <div className="flex-column">
          <div className="flex">
            <strong>Owner:</strong>
            <span>{owner ? `${owner.slice(0, 6)}...${owner.slice(-4)}` : 'Not set'}</span>
          </div>
          
          <div className="flex">
            <strong>Unlock Time:</strong>
            <span>{formatTime(unlockTime)}</span>
          </div>
        </div>

        <div className={`timer ${isUnlocked ? 'unlocked' : 'locked'}`}>
          <div className="status-text">
            {isUnlocked ? '🔓 Unlocked' : '🔒 Locked'}
          </div>
          <div className="time">
            {getTimeRemaining()}
          </div>
        </div>
      </div>

      <button className="button secondary" onClick={loadContractInfo}>
        Refresh Information
      </button>
    </div>
  );
};

export default ContractInfo; 