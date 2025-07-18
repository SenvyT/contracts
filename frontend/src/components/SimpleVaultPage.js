import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WalletConnect from './WalletConnect';
import walletService from '../utils/walletService';
import simpleVaultConfig from '../utils/simpleVaultConfig';
import { ethers } from 'ethers';

const SimpleVaultPage = () => {
  const navigate = useNavigate();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [contract, setContract] = useState(null);
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
  const [formData, setFormData] = useState({
    depositAmount: '',
    withdrawAmount: '',
    newVaultName: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    try {
      setIsLoading(true);
      
      // Check wallet connection
      const savedConnection = await walletService.checkSavedConnection();
      if (savedConnection && savedConnection.success) {
        setIsWalletConnected(true);
        await initializeContract();
      }
    } catch (error) {
      console.error('Error initializing page:', error);
      setError('Failed to initialize page');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeContract = async () => {
    try {
      const deploymentInfo = await simpleVaultConfig.getDeploymentInfo();
      if (!deploymentInfo.isDeployed) {
        setError('SimpleVault contract is not deployed on this network');
        return;
      }

      // Get the provider and signer from walletService
      const provider = walletService.provider;
      const signer = walletService.signer;
      
      if (!provider || !signer) {
        setError('Wallet not connected properly');
        return;
      }

      const contractInstance = new ethers.Contract(
        deploymentInfo.address,
        deploymentInfo.abi,
        signer
      );
      setContract(contractInstance);

      await loadVaultInfo(contractInstance);
      await loadUserInfo(contractInstance);
    } catch (error) {
      console.error('Error initializing contract:', error);
      setError('Failed to load contract');
    }
  };

  const loadVaultInfo = async (contractInstance) => {
    try {
      const [name, totalDeposits, totalWithdrawals, vaultBalance, owner] = await Promise.all([
        contractInstance.vaultName(),
        contractInstance.totalDeposits(),
        contractInstance.totalWithdrawals(),
        contractInstance.getVaultBalance(),
        contractInstance.owner()
      ]);

      const currentAccount = await walletService.getCurrentAccount();
      const isOwner = currentAccount && currentAccount.toLowerCase() === owner.toLowerCase();

      setVaultInfo({
        name,
        totalDeposits: ethers.formatEther(totalDeposits),
        totalWithdrawals: ethers.formatEther(totalWithdrawals),
        vaultBalance: ethers.formatEther(vaultBalance),
        owner,
        isOwner
      });
    } catch (error) {
      console.error('Error loading vault info:', error);
    }
  };

  const loadUserInfo = async (contractInstance) => {
    try {
      const currentAccount = await walletService.getCurrentAccount();
      if (!currentAccount) return;

      const userInfo = await contractInstance.getUserInfo(currentAccount);
      setUserInfo({
        totalDeposited: ethers.formatEther(userInfo.totalDeposited),
        totalWithdrawn: ethers.formatEther(userInfo.totalWithdrawn),
        remainingBalance: ethers.formatEther(userInfo.remainingBalance),
        isActive: userInfo.isActive
      });
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const handleWalletConnect = async () => {
    try {
      // Connect wallet using walletService
      const connectionResult = await walletService.connect();
      
      if (connectionResult.success) {
        setIsWalletConnected(true);
        await initializeContract();
      } else {
        setError(connectionResult.error || 'Failed to connect wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Failed to connect wallet');
    }
  };

  const handleWalletDisconnect = () => {
    setIsWalletConnected(false);
    setContract(null);
    setVaultInfo({
      name: '',
      totalDeposits: '0',
      totalWithdrawals: '0',
      vaultBalance: '0',
      owner: '',
      isOwner: false
    });
    setUserInfo({
      totalDeposited: '0',
      totalWithdrawn: '0',
      remainingBalance: '0',
      isActive: false
    });
    setFormData({
      depositAmount: '',
      withdrawAmount: '',
      newVaultName: ''
    });
    setError('');
    setSuccess('');
  };

  const handleDeposit = async () => {
    if (!contract || !formData.depositAmount) return;

    try {
      setIsProcessing(true);
      setError('');
      setSuccess('');

      const amount = ethers.parseEther(formData.depositAmount);
      const currentAccount = await walletService.getCurrentAccount();

      const tx = await contract.deposit({ value: amount });
      await tx.wait();

      setSuccess(`Successfully deposited ${formData.depositAmount} ETH`);
      setFormData(prev => ({ ...prev, depositAmount: '' }));
      await loadVaultInfo(contract);
      await loadUserInfo(contract);
    } catch (error) {
      console.error('Error depositing:', error);
      setError('Failed to deposit. Please check your balance and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!contract || !formData.withdrawAmount || !vaultInfo.isOwner) return;

    try {
      setIsProcessing(true);
      setError('');
      setSuccess('');

      const amount = ethers.parseEther(formData.withdrawAmount);
      const currentAccount = await walletService.getCurrentAccount();

      const tx = await contract.withdraw(amount);
      await tx.wait();

      setSuccess(`Successfully withdrew ${formData.withdrawAmount} ETH`);
      setFormData(prev => ({ ...prev, withdrawAmount: '' }));
      await loadVaultInfo(contract);
      await loadUserInfo(contract);
    } catch (error) {
      console.error('Error withdrawing:', error);
      setError('Failed to withdraw. Please check the amount and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChangeVaultName = async () => {
    if (!contract || !formData.newVaultName || !vaultInfo.isOwner) return;

    try {
      setIsProcessing(true);
      setError('');
      setSuccess('');

      const currentAccount = await walletService.getCurrentAccount();

      const tx = await contract.changeVaultName(formData.newVaultName);
      await tx.wait();

      setSuccess(`Vault name changed to "${formData.newVaultName}"`);
      setFormData(prev => ({ ...prev, newVaultName: '' }));
      await loadVaultInfo(contract);
    } catch (error) {
      console.error('Error changing vault name:', error);
      setError('Failed to change vault name. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefresh = async () => {
    if (contract) {
      await loadVaultInfo(contract);
      await loadUserInfo(contract);
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="header">
          <h1>🏦 SimpleVault</h1>
          <p>Loading...</p>
        </div>
        <div className="card">
          <div className="loading">Initializing...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <button onClick={() => navigate('/')} className="back-button">
          ← Back to Hub
        </button>
        <h1>🏦 SimpleVault</h1>
        <p>Session 1: Foundation - Basic Vault Operations</p>
      </div>

      {/* MetaMask Connect Header */}
      <div className="wallet-section">
        <WalletConnect onConnect={handleWalletConnect} onDisconnect={handleWalletDisconnect} />
      </div>

      {error && (
        <div className="alert error">
          <strong>Error:</strong> {error}
          <button onClick={() => setError('')} className="close-button">×</button>
        </div>
      )}

      {success && (
        <div className="alert success">
          <strong>Success:</strong> {success}
          <button onClick={() => setSuccess('')} className="close-button">×</button>
        </div>
      )}

      {!isWalletConnected ? (
        <div className="card">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your MetaMask wallet to interact with the SimpleVault contract.</p>
          <div className="status info">
            <strong>Note:</strong> You need to connect your wallet to view vault information and perform transactions.
          </div>
        </div>
      ) : !contract ? (
        <div className="card">
          <h2>Contract Not Available</h2>
          <p>{error || 'The SimpleVault contract is not deployed on this network.'}</p>
        </div>
      ) : (
        <>
          {/* Vault Information */}
          <div className="card">
            <div className="card-header">
              <h2>Vault Information</h2>
              <button onClick={handleRefresh} className="refresh-button" disabled={isProcessing}>
                🔄 Refresh
              </button>
            </div>
            
            <div className="info-grid">
              <div className="info-item">
                <label>Vault Name:</label>
                <span className="value">{vaultInfo.name}</span>
              </div>
              <div className="info-item">
                <label>Owner:</label>
                <span className="value address">{vaultInfo.owner}</span>
              </div>
              <div className="info-item">
                <label>Total Deposits:</label>
                <span className="value">{vaultInfo.totalDeposits} ETH</span>
              </div>
              <div className="info-item">
                <label>Total Withdrawals:</label>
                <span className="value">{vaultInfo.totalWithdrawals} ETH</span>
              </div>
              <div className="info-item">
                <label>Current Balance:</label>
                <span className="value highlight">{vaultInfo.vaultBalance} ETH</span>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="card">
            <h2>Your Activity</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Total Deposited:</label>
                <span className="value">{userInfo.totalDeposited} ETH</span>
              </div>
              <div className="info-item">
                <label>Total Withdrawn:</label>
                <span className="value">{userInfo.totalWithdrawn} ETH</span>
              </div>
              <div className="info-item">
                <label>Remaining Balance:</label>
                <span className="value highlight">{userInfo.remainingBalance} ETH</span>
              </div>
              <div className="info-item">
                <label>Status:</label>
                <span className={`status-badge ${userInfo.isActive ? 'active' : 'inactive'}`}>
                  {userInfo.isActive ? 'Active User' : 'No Activity'}
                </span>
              </div>
            </div>
          </div>

          {/* Deposit Section */}
          <div className="card">
            <h2>Deposit ETH</h2>
            <p>Anyone can deposit ETH into the vault. Deposits are tracked per user.</p>
            
            <div className="form-group">
              <label htmlFor="depositAmount">Amount (ETH):</label>
              <input
                type="number"
                id="depositAmount"
                value={formData.depositAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, depositAmount: e.target.value }))}
                placeholder="0.1"
                step="0.001"
                min="0.001"
                disabled={isProcessing}
              />
            </div>
            
            <button 
              onClick={handleDeposit} 
              className="button primary"
              disabled={!formData.depositAmount || isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Deposit ETH'}
            </button>
          </div>

          {/* Owner Functions */}
          {vaultInfo.isOwner && (
            <>
              {/* Withdraw Section */}
              <div className="card">
                <h2>Withdraw ETH (Owner Only)</h2>
                <p>Only the vault owner can withdraw ETH from the vault.</p>
                
                <div className="form-group">
                  <label htmlFor="withdrawAmount">Amount (ETH):</label>
                  <input
                    type="number"
                    id="withdrawAmount"
                    value={formData.withdrawAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, withdrawAmount: e.target.value }))}
                    placeholder="0.1"
                    step="0.001"
                    min="0.001"
                    max={vaultInfo.vaultBalance}
                    disabled={isProcessing}
                  />
                </div>
                
                <button 
                  onClick={handleWithdraw} 
                  className="button warning"
                  disabled={!formData.withdrawAmount || isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Withdraw ETH'}
                </button>
              </div>

              {/* Change Vault Name Section */}
              <div className="card">
                <h2>Change Vault Name (Owner Only)</h2>
                <p>Only the vault owner can change the vault name.</p>
                
                <div className="form-group">
                  <label htmlFor="newVaultName">New Vault Name:</label>
                  <input
                    type="text"
                    id="newVaultName"
                    value={formData.newVaultName}
                    onChange={(e) => setFormData(prev => ({ ...prev, newVaultName: e.target.value }))}
                    placeholder="Enter new vault name"
                    disabled={isProcessing}
                  />
                </div>
                
                <button 
                  onClick={handleChangeVaultName} 
                  className="button secondary"
                  disabled={!formData.newVaultName || isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Change Name'}
                </button>
              </div>
            </>
          )}

          {/* Contract Address */}
          <div className="card">
            <h2>Contract Details</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Contract Address:</label>
                <span className="value address">{contract._address}</span>
              </div>
              <div className="info-item">
                <label>Network:</label>
                <span className="value">{simpleVaultConfig.getNetworkConfig().chainName}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SimpleVaultPage; 