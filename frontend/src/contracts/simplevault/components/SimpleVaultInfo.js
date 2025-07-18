import React, { useState, useEffect } from 'react';
import { web3Service } from '../../../common';
import contractConfig from '../../../common/utils/contractConfig';

const SimpleVaultInfo = () => {
  const [vaultInfo, setVaultInfo] = useState({
    name: '',
    totalDeposits: '0',
    totalWithdrawals: '0',
    vaultBalance: '0',
    owner: '',
    isOwner: false
  });
  const [userInfo, setUserInfo] = useState({
    totalDeposited: '0',
    totalWithdrawn: '0',
    remainingBalance: '0',
    isActive: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadVaultInfo();
  }, []);

  const loadVaultInfo = async () => {
    setIsLoading(true);
    setError('');

    try {
      const status = web3Service.getConnectionStatus();
      if (!status.isConnected) {
        setError('Please connect your wallet first');
        setIsLoading(false);
        return;
      }

      // Check if SimpleVault is deployed
      const isDeployed = await contractConfig.isContractDeployed('simplevault');
      
      if (!isDeployed) {
        setError('SimpleVault contract is not deployed. Please deploy the contract first.');
        setIsLoading(false);
        return;
      }

      // Load vault and user data using web3Service
      const [vaultData, userData] = await Promise.all([
        web3Service.getSimpleVaultInfo(),
        web3Service.getSimpleVaultUserInfo()
      ]);

      if (vaultData) {
        setVaultInfo(vaultData);
      }

      if (userData) {
        setUserInfo(userData);
      }
    } catch (err) {
      setError('Failed to load vault information: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };



  if (isLoading) {
    return (
      <div className="card">
        <h3>Vault Information</h3>
        <div className="text-center">
          <span className="loading"></span>
          <p>Loading vault information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h3>Vault Information</h3>
        <div className="status error">
          {error}
        </div>
        <button className="button" onClick={loadVaultInfo}>
          Retry
        </button>
      </div>
    );
  }



  return (
    <div className="card">
      <h3>Vault Information</h3>
      
      <div className="balance-display">
        <h3>Vault Balance</h3>
        <div className="amount">{parseFloat(vaultInfo.vaultBalance).toFixed(4)} ETH</div>
      </div>

      <div className="grid">
        <div className="flex-column">
          <div className="flex">
            <strong>Vault Name:</strong>
            <span>{vaultInfo.name || 'Unnamed Vault'}</span>
          </div>
          
          <div className="flex">
            <strong>Owner:</strong>
            <span>{vaultInfo.owner ? `${vaultInfo.owner.slice(0, 6)}...${vaultInfo.owner.slice(-4)}` : 'Not set'}</span>
          </div>

          <div className="flex">
            <strong>Total Deposits:</strong>
            <span>{parseFloat(vaultInfo.totalDeposits).toFixed(4)} ETH</span>
          </div>

          <div className="flex">
            <strong>Total Withdrawals:</strong>
            <span>{parseFloat(vaultInfo.totalWithdrawals).toFixed(4)} ETH</span>
          </div>
        </div>

        <div className="flex-column">
          <h4>Your Activity</h4>
          <div className="flex">
            <strong>Total Deposited:</strong>
            <span>{parseFloat(userInfo.totalDeposited).toFixed(4)} ETH</span>
          </div>
          
          <div className="flex">
            <strong>Total Withdrawn:</strong>
            <span>{parseFloat(userInfo.totalWithdrawn).toFixed(4)} ETH</span>
          </div>
          
          <div className="flex">
            <strong>Remaining Balance:</strong>
            <span>{parseFloat(userInfo.remainingBalance).toFixed(4)} ETH</span>
          </div>
          
          <div className="flex">
            <strong>Status:</strong>
            <span className={userInfo.isActive ? 'status-badge active' : 'status-badge inactive'}>
              {userInfo.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      <button className="button secondary" onClick={loadVaultInfo}>
        Refresh Information
      </button>
    </div>
  );
};

export default SimpleVaultInfo; 