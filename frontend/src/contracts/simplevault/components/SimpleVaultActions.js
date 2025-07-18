import React, { useState, useEffect } from 'react';
import { web3Service } from '../../../common';
import { ethers } from 'ethers';

const SimpleVaultActions = ({ onActionComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    depositAmount: '',
    withdrawAmount: '',
    newVaultName: ''
  });
  const [vaultInfo, setVaultInfo] = useState({
    isOwner: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    initializeContract();
  }, []);

  const initializeContract = async () => {
    try {
      const status = web3Service.getConnectionStatus();
      if (!status.isConnected) return;

      // Get vault info to check if user is owner
      const vaultData = await web3Service.getSimpleVaultInfo();
      if (vaultData) {
        setVaultInfo({ isOwner: vaultData.isOwner });
      }
    } catch (error) {
      console.error('Error initializing contract:', error);
    }
  };

  const handleDeposit = async () => {
    if (!formData.depositAmount) return;

    try {
      setIsProcessing(true);
      setError('');
      setSuccess('');

      const amount = ethers.parseEther(formData.depositAmount);
      const result = await web3Service.simpleVaultDeposit(amount);

      setSuccess(`Successfully deposited ${formData.depositAmount} ETH`);
      setFormData(prev => ({ ...prev, depositAmount: '' }));
      onActionComplete && onActionComplete();
    } catch (error) {
      console.error('Error depositing:', error);
      setError('Failed to deposit. Please check your balance and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!formData.withdrawAmount || !vaultInfo.isOwner) return;

    try {
      setIsProcessing(true);
      setError('');
      setSuccess('');

      const amount = ethers.parseEther(formData.withdrawAmount);
      const result = await web3Service.simpleVaultWithdraw(amount);

      setSuccess(`Successfully withdrew ${formData.withdrawAmount} ETH`);
      setFormData(prev => ({ ...prev, withdrawAmount: '' }));
      onActionComplete && onActionComplete();
    } catch (error) {
      console.error('Error withdrawing:', error);
      setError('Failed to withdraw. Please check the amount and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChangeVaultName = async () => {
    if (!formData.newVaultName || !vaultInfo.isOwner) return;

    try {
      setIsProcessing(true);
      setError('');
      setSuccess('');

      const result = await web3Service.simpleVaultChangeName(formData.newVaultName);

      setSuccess(`Vault name changed to "${formData.newVaultName}"`);
      setFormData(prev => ({ ...prev, newVaultName: '' }));
      onActionComplete && onActionComplete();
    } catch (error) {
      console.error('Error changing vault name:', error);
      setError('Failed to change vault name. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (error) {
    return (
      <div className="card">
        <h3>Vault Actions</h3>
        <div className="status error">
          {error}
        </div>
        <button className="button" onClick={() => setError('')}>
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Vault Actions</h3>

      {success && (
        <div className="status success">
          {success}
          <button className="close-button" onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      <div className="grid">
        {/* Deposit Section */}
        <div className="flex-column">
          <h4>Deposit Funds</h4>
          <p>Deposit ETH into the vault to earn rewards.</p>
          
          <div className="form-group">
            <label htmlFor="depositAmount">Amount (ETH):</label>
            <input
              type="number"
              id="depositAmount"
              value={formData.depositAmount}
              onChange={(e) => handleInputChange('depositAmount', e.target.value)}
              placeholder="0.0"
              step="0.001"
              min="0"
              disabled={isProcessing}
            />
          </div>
          
          <button 
            className="button"
            onClick={handleDeposit}
            disabled={!formData.depositAmount || isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="loading"></span>
                Depositing...
              </>
            ) : (
              'Deposit'
            )}
          </button>
        </div>

        {/* Withdraw Section */}
        <div className="flex-column">
          <h4>Withdraw Funds</h4>
          <p>Withdraw funds from the vault (Owner only).</p>
          
          <div className="form-group">
            <label htmlFor="withdrawAmount">Amount (ETH):</label>
            <input
              type="number"
              id="withdrawAmount"
              value={formData.withdrawAmount}
              onChange={(e) => handleInputChange('withdrawAmount', e.target.value)}
              placeholder="0.0"
              step="0.001"
              min="0"
              disabled={isProcessing || !vaultInfo.isOwner}
            />
          </div>
          
          <button 
            className="button danger"
            onClick={handleWithdraw}
            disabled={!formData.withdrawAmount || isProcessing || !vaultInfo.isOwner}
          >
            {isProcessing ? (
              <>
                <span className="loading"></span>
                Withdrawing...
              </>
            ) : (
              'Withdraw'
            )}
          </button>
          
          {!vaultInfo.isOwner && (
            <div className="status warning">
              Only the vault owner can withdraw funds.
            </div>
          )}
        </div>

        {/* Change Vault Name Section */}
        <div className="flex-column">
          <h4>Change Vault Name</h4>
          <p>Change the vault name (Owner only).</p>
          
          <div className="form-group">
            <label htmlFor="newVaultName">New Vault Name:</label>
            <input
              type="text"
              id="newVaultName"
              value={formData.newVaultName}
              onChange={(e) => handleInputChange('newVaultName', e.target.value)}
              placeholder="Enter new vault name"
              disabled={isProcessing || !vaultInfo.isOwner}
            />
          </div>
          
          <button 
            className="button secondary"
            onClick={handleChangeVaultName}
            disabled={!formData.newVaultName || isProcessing || !vaultInfo.isOwner}
          >
            {isProcessing ? (
              <>
                <span className="loading"></span>
                Changing...
              </>
            ) : (
              'Change Name'
            )}
          </button>
          
          {!vaultInfo.isOwner && (
            <div className="status warning">
              Only the vault owner can change the vault name.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleVaultActions; 