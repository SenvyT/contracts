import React, { useState, useEffect } from 'react';
import { web3Service } from '../../../common';

const MyNFTInfo = () => {
  const [collectionInfo, setCollectionInfo] = useState(null);
  const [userTokens, setUserTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNFTInfo();
  }, []);

  const loadNFTInfo = async () => {
    setIsLoading(true);
    setError('');

    try {
      const status = web3Service.getConnectionStatus();
      
      if (!status.isConnected) {
        setError('Please connect your wallet first');
        setIsLoading(false);
        return;
      }

      // Load contract config if not already loaded
      if (!web3Service.myNFTContract) {
        const configLoaded = await web3Service.loadContractConfigs();
        if (!configLoaded) {
          setError('Failed to load contract configuration');
          setIsLoading(false);
          return;
        }
        web3Service.initializeContracts();
      }

      const [info, tokens] = await Promise.all([
        web3Service.getMyNFTInfo(),
        web3Service.getMyNFTUserTokens()
      ]);

      setCollectionInfo(info);
      setUserTokens(tokens || []);
    } catch (err) {
      console.error('Error loading NFT info:', err);
      setError('Failed to load NFT information: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (priceWei) => {
    if (!priceWei) return '0 ETH';
    const priceEth = parseFloat(priceWei) / 1e18;
    return `${priceEth} ETH`;
  };

  const formatPercentage = (current, max) => {
    if (!current || !max) return '0%';
    const percentage = (current / max) * 100;
    return `${percentage.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="card">
        <h3>NFT Collection Information</h3>
        <div className="text-center">
          <span className="loading"></span>
          <p>Loading NFT collection information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h3>NFT Collection Information</h3>
        <div className="status error">
          {error}
        </div>
        <button className="button" onClick={loadNFTInfo}>
          Retry
        </button>
      </div>
    );
  }

  if (!collectionInfo) {
    return (
      <div className="card">
        <h3>NFT Collection Information</h3>
        <div className="status warning">
          NFT contract not deployed or not accessible
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>🎨 NFT Collection Information</h3>
      
      <div className="collection-header">
        <div className="collection-icon">🖼️</div>
        <div className="collection-details">
          <h2>{collectionInfo.name}</h2>
          <p className="collection-symbol">{collectionInfo.symbol}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-label">Total Supply</div>
          <div className="stat-value">{collectionInfo.maxSupply}</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">Minted</div>
          <div className="stat-value">{collectionInfo.currentSupply}</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">Remaining</div>
          <div className="stat-value">{collectionInfo.remainingSupply}</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">Mint Price</div>
          <div className="stat-value">{formatPrice(collectionInfo.mintPrice)}</div>
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-label">
          Collection Progress: {formatPercentage(collectionInfo.currentSupply, collectionInfo.maxSupply)}
        </div>
        <div className="progress-track">
          <div 
            className="progress-fill" 
            style={{ width: `${(collectionInfo.currentSupply / collectionInfo.maxSupply) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="contract-status">
        <div className={`status-badge ${collectionInfo.isPaused ? 'paused' : 'active'}`}>
          {collectionInfo.isPaused ? '⏸️ Paused' : '✅ Active'}
        </div>
        <div className="owner-info">
          <strong>Owner:</strong> {collectionInfo.owner ? `${collectionInfo.owner.slice(0, 6)}...${collectionInfo.owner.slice(-4)}` : 'Unknown'}
        </div>
      </div>

      {userTokens.length > 0 && (
        <div className="user-tokens">
          <h4>Your NFTs ({userTokens.length})</h4>
          <div className="tokens-grid">
            {userTokens.map((token) => (
              <div key={token.id} className="token-card">
                <div className="token-id">#{token.id}</div>
                <div className="token-uri">{token.uri}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="button secondary" onClick={loadNFTInfo}>
        Refresh Information
      </button>
    </div>
  );
};

export default MyNFTInfo; 