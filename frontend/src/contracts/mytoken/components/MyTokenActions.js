import React, { useState, useEffect } from 'react';
import { web3Service } from '../../../common';

const MyTokenActions = ({ onActionComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    transferTo: '',
    transferAmount: '',
    burnAmount: '',
    mintTo: '',
    mintAmount: ''
  });
  const [tokenInfo, setTokenInfo] = useState({
    isOwner: false,
    isPaused: false
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

      const tokenData = await web3Service.getMyTokenInfo();
      if (tokenData) {
        setTokenInfo({ 
          isOwner: tokenData.isOwner,
          isPaused: tokenData.isPaused
        });
      }
    } catch (error) {
      console.error('Error initializing contract:', error);
    }
  };

  const handleTransfer = async () => {
    if (!formData.transferTo || !formData.transferAmount) return;

    try {
      setIsProcessing(true);
      setError('');
      setSuccess('');

      const result = await web3Service.transferMyToken(formData.transferTo, formData.transferAmount);

      setSuccess(`Successfully transferred ${formData.transferAmount} tokens to ${formData.transferTo}`);
      setFormData(prev => ({ ...prev, transferTo: '', transferAmount: '' }));
      onActionComplete && onActionComplete();
    } catch (error) {
      console.error('Error transferring:', error);
      
      let errorMessage = 'Failed to transfer tokens. Please check the address and amount.';
      
      if (error.message) {
        if (error.message.includes('paused')) {
          errorMessage = 'Transfer failed: Contract is paused';
        } else if (error.message.includes('exceeds balance')) {
          errorMessage = 'Transfer failed: Insufficient balance';
        } else if (error.message.includes('execution reverted')) {
          const revertMatch = error.message.match(/execution reverted: (.+)/);
          if (revertMatch) {
            errorMessage = revertMatch[1];
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBurn = async () => {
    if (!formData.burnAmount) return;

    try {
      setIsProcessing(true);
      setError('');
      setSuccess('');

      const result = await web3Service.burnMyToken(formData.burnAmount);

      setSuccess(`Successfully burned ${formData.burnAmount} tokens`);
      setFormData(prev => ({ ...prev, burnAmount: '' }));
      onActionComplete && onActionComplete();
    } catch (error) {
      console.error('Error burning:', error);
      
      let errorMessage = 'Failed to burn tokens. Please check the amount.';
      
      if (error.message) {
        if (error.message.includes('paused')) {
          errorMessage = 'Burn failed: Contract is paused';
        } else if (error.message.includes('exceeds balance')) {
          errorMessage = 'Burn failed: Insufficient balance';
        } else if (error.message.includes('execution reverted')) {
          const revertMatch = error.message.match(/execution reverted: (.+)/);
          if (revertMatch) {
            errorMessage = revertMatch[1];
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMint = async () => {
    if (!formData.mintTo || !formData.mintAmount) return;

    try {
      setIsProcessing(true);
      setError('');
      setSuccess('');

      const result = await web3Service.mintMyToken(formData.mintTo, formData.mintAmount);

      setSuccess(`Successfully minted ${formData.mintAmount} tokens to ${formData.mintTo}`);
      setFormData(prev => ({ ...prev, mintTo: '', mintAmount: '' }));
      onActionComplete && onActionComplete();
    } catch (error) {
      console.error('Error minting:', error);
      
      let errorMessage = 'Failed to mint tokens. Please check the address and amount.';
      
      if (error.message) {
        if (error.message.includes('Only owner')) {
          errorMessage = 'Mint failed: Only owner can mint tokens';
        } else if (error.message.includes('paused')) {
          errorMessage = 'Mint failed: Contract is paused';
        } else if (error.message.includes('blacklisted')) {
          errorMessage = 'Mint failed: Cannot mint to blacklisted address';
        } else if (error.message.includes('exceed max supply')) {
          errorMessage = 'Mint failed: Would exceed max supply';
        } else if (error.message.includes('execution reverted')) {
          const revertMatch = error.message.match(/execution reverted: (.+)/);
          if (revertMatch) {
            errorMessage = revertMatch[1];
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTogglePause = async () => {
    try {
      setIsProcessing(true);
      setError('');
      setSuccess('');

      const result = await web3Service.togglePauseMyToken();

      setSuccess(`Contract successfully ${result.action}`);
      onActionComplete && onActionComplete();
    } catch (error) {
      console.error('Error toggling pause:', error);
      
      let errorMessage = 'Failed to toggle pause status.';
      
      if (error.message) {
        if (error.message.includes('Only owner')) {
          errorMessage = 'Pause failed: Only owner can pause/unpause';
        } else if (error.message.includes('execution reverted')) {
          const revertMatch = error.message.match(/execution reverted: (.+)/);
          if (revertMatch) {
            errorMessage = revertMatch[1];
          }
        }
      }
      
      setError(errorMessage);
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
        <h3>Token Actions</h3>
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
      <h3>Token Actions</h3>

      {success && (
        <div className="status success">
          {success}
          <button className="close-button" onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      <div className="grid">
        {/* Transfer Section */}
        <div className="flex-column">
          <h4>Transfer Tokens</h4>
          <p>Transfer tokens to another address.</p>
          
          <div className="form-group">
            <label htmlFor="transferTo">Recipient Address:</label>
            <input
              type="text"
              id="transferTo"
              value={formData.transferTo}
              onChange={(e) => handleInputChange('transferTo', e.target.value)}
              placeholder="0x..."
              disabled={isProcessing || tokenInfo.isPaused}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="transferAmount">Amount:</label>
            <input
              type="number"
              id="transferAmount"
              value={formData.transferAmount}
              onChange={(e) => handleInputChange('transferAmount', e.target.value)}
              placeholder="0"
              step="0.001"
              min="0"
              disabled={isProcessing || tokenInfo.isPaused}
            />
          </div>
          
          <button 
            className="button"
            onClick={handleTransfer}
            disabled={!formData.transferTo || !formData.transferAmount || isProcessing || tokenInfo.isPaused}
          >
            {isProcessing ? (
              <>
                <span className="loading"></span>
                Transferring...
              </>
            ) : (
              'Transfer'
            )}
          </button>
          
          {tokenInfo.isPaused && (
            <div className="status warning">
              Transfers are paused. Contract is currently inactive.
            </div>
          )}
        </div>

        {/* Burn Section */}
        <div className="flex-column">
          <h4>Burn Tokens</h4>
          <p>Burn tokens from your balance (permanent).</p>
          
          <div className="form-group">
            <label htmlFor="burnAmount">Amount to Burn:</label>
            <input
              type="number"
              id="burnAmount"
              value={formData.burnAmount}
              onChange={(e) => handleInputChange('burnAmount', e.target.value)}
              placeholder="0"
              step="0.001"
              min="0"
              disabled={isProcessing || tokenInfo.isPaused}
            />
          </div>
          
          <button 
            className="button danger"
            onClick={handleBurn}
            disabled={!formData.burnAmount || isProcessing || tokenInfo.isPaused}
          >
            {isProcessing ? (
              <>
                <span className="loading"></span>
                Burning...
              </>
            ) : (
              'Burn Tokens'
            )}
          </button>
          
          {tokenInfo.isPaused && (
            <div className="status warning">
              Burning is paused. Contract is currently inactive.
            </div>
          )}
        </div>

        {/* Owner Actions */}
        {tokenInfo.isOwner && (
          <>
            {/* Mint Section */}
            <div className="flex-column">
              <h4>Mint Tokens (Owner Only)</h4>
              <p>Mint new tokens to an address.</p>
              
              <div className="form-group">
                <label htmlFor="mintTo">Recipient Address:</label>
                <input
                  type="text"
                  id="mintTo"
                  value={formData.mintTo}
                  onChange={(e) => handleInputChange('mintTo', e.target.value)}
                  placeholder="0x..."
                  disabled={isProcessing || tokenInfo.isPaused}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="mintAmount">Amount to Mint:</label>
                <input
                  type="number"
                  id="mintAmount"
                  value={formData.mintAmount}
                  onChange={(e) => handleInputChange('mintAmount', e.target.value)}
                  placeholder="0"
                  step="0.001"
                  min="0"
                  disabled={isProcessing || tokenInfo.isPaused}
                />
              </div>
              
              <button 
                className="button secondary"
                onClick={handleMint}
                disabled={!formData.mintTo || !formData.mintAmount || isProcessing || tokenInfo.isPaused}
              >
                {isProcessing ? (
                  <>
                    <span className="loading"></span>
                    Minting...
                  </>
                ) : (
                  'Mint Tokens'
                )}
              </button>
            </div>

            {/* Pause/Unpause Section */}
            <div className="flex-column">
              <h4>Contract Control (Owner Only)</h4>
              <p>Pause or unpause all token operations.</p>
              
              <button 
                className={`button ${tokenInfo.isPaused ? 'success' : 'warning'}`}
                onClick={handleTogglePause}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="loading"></span>
                    Processing...
                  </>
                ) : (
                  tokenInfo.isPaused ? 'Unpause Contract' : 'Pause Contract'
                )}
              </button>
            </div>


          </>
        )}
      </div>
    </div>
  );
};

export default MyTokenActions; 