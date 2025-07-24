import React, { useState, useEffect } from 'react';
import { web3Service } from '../../../common';

const MyTokenInfo = ({ onRefresh }) => {
  const [tokenInfo, setTokenInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTokenInfo();
  }, []);

  const loadTokenInfo = async () => {
    try {
      setLoading(true);
      setError('');
      
      const info = await web3Service.getMyTokenInfo();
      setTokenInfo(info);
    } catch (error) {
      console.error('Error loading token info:', error);
      setError('Failed to load token information');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadTokenInfo();
    onRefresh && onRefresh();
  };

  if (loading) {
    return (
      <div className="card">
        <h3>Token Information</h3>
        <div className="loading">Loading token information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h3>Token Information</h3>
        <div className="status error">
          {error}
          <button className="button" onClick={handleRefresh}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!tokenInfo) {
    return (
      <div className="card">
        <h3>Token Information</h3>
        <div className="status warning">
          MyToken contract is not deployed. Please deploy the contract first.
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Token Information</h3>
        <button className="refresh-button" onClick={handleRefresh}>
          ↻ Refresh
        </button>
      </div>

      <div className="info-grid">
        <div className="info-item">
          <label>Token Name:</label>
          <span className="value highlight">{tokenInfo.name}</span>
        </div>

        <div className="info-item">
          <label>Token Symbol:</label>
          <span className="value highlight">{tokenInfo.symbol}</span>
        </div>

        <div className="info-item">
          <label>Decimals:</label>
          <span className="value">{tokenInfo.decimals}</span>
        </div>

        <div className="info-item">
          <label>Total Supply:</label>
          <span className="value">{parseFloat(tokenInfo.totalSupply).toLocaleString()} {tokenInfo.symbol}</span>
        </div>

        <div className="info-item">
          <label>Max Supply:</label>
          <span className="value">{parseFloat(tokenInfo.maxSupply).toLocaleString()} {tokenInfo.symbol}</span>
        </div>

        <div className="info-item">
          <label>Token Price:</label>
          <span className="value">{parseFloat(tokenInfo.price).toFixed(6)} ETH</span>
        </div>

        <div className="info-item">
          <label>Your Balance:</label>
          <span className="value highlight">{parseFloat(tokenInfo.userBalance).toLocaleString()} {tokenInfo.symbol}</span>
        </div>

        <div className="info-item">
          <label>Contract Owner:</label>
          <span className="value address">{tokenInfo.owner}</span>
        </div>

        <div className="info-item">
          <label>Contract Status:</label>
          <span className={`value ${tokenInfo.isPaused ? 'error' : 'success'}`}>
            {tokenInfo.isPaused ? '⏸️ Paused' : '✅ Active'}
          </span>
        </div>

        <div className="info-item">
          <label>Your Role:</label>
          <span className={`value ${tokenInfo.isOwner ? 'success' : 'info'}`}>
            {tokenInfo.isOwner ? '👑 Owner' : '👤 User'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MyTokenInfo; 