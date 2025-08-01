import React, { useState, useEffect } from 'react';
import { web3Service } from '../../../common';

const MyNFTGallery = () => {
  const [allTokens, setAllTokens] = useState([]);
  const [userTokens, setUserTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedToken, setSelectedToken] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'owned', 'available'

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
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

      const [all, user] = await Promise.all([
        web3Service.getAllMyNFTTokens(),
        web3Service.getMyNFTUserTokens()
      ]);

      setAllTokens(all || []);
      setUserTokens(user || []);
    } catch (err) {
      console.error('Error loading gallery:', err);
      setError('Failed to load NFT gallery: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenClick = (token) => {
    setSelectedToken(token);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedToken(null);
  };

  const getFilteredTokens = () => {
    switch (filter) {
      case 'owned':
        return userTokens;
      case 'available':
        return allTokens.filter(token => !userTokens.find(ut => ut.id === token.id));
      default:
        return allTokens;
    }
  };

  const renderTokenCard = (token) => {
    const isOwned = userTokens.find(ut => ut.id === token.id);
    
    return (
      <div 
        key={token.id} 
        className={`token-card ${isOwned ? 'owned' : ''}`}
        onClick={() => handleTokenClick(token)}
      >
        <div className="token-image">
          {token.metadata?.image ? (
            <img 
              src={token.metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')} 
              alt={`NFT #${token.id}`}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2Qzc1N0QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
              }}
            />
          ) : (
            <div className="token-placeholder">
              <span>🖼️</span>
              <p>No Image</p>
            </div>
          )}
        </div>
        
        <div className="token-info">
          <div className="token-id">#{token.id}</div>
          <div className="token-name">
            {token.metadata?.name || `NFT #${token.id}`}
          </div>
          <div className="token-owner">
            {isOwned ? '👤 You own this' : `👤 ${token.owner?.slice(0, 6)}...${token.owner?.slice(-4)}`}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="card">
        <h3>🖼️ NFT Gallery</h3>
        <div className="text-center">
          <span className="loading"></span>
          <p>Loading NFT gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h3>🖼️ NFT Gallery</h3>
        <div className="status error">
          {error}
        </div>
        <button className="button" onClick={loadGallery}>
          Retry
        </button>
      </div>
    );
  }

  const filteredTokens = getFilteredTokens();

  return (
    <div className="card">
      <h3>🖼️ NFT Gallery</h3>
      
      <div className="gallery-controls">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({allTokens.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'owned' ? 'active' : ''}`}
            onClick={() => setFilter('owned')}
          >
            Your NFTs ({userTokens.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'available' ? 'active' : ''}`}
            onClick={() => setFilter('available')}
          >
            Available ({allTokens.length - userTokens.length})
          </button>
        </div>
        
        <button className="button secondary" onClick={loadGallery}>
          Refresh Gallery
        </button>
      </div>

      {filteredTokens.length === 0 ? (
        <div className="empty-gallery">
          <div className="empty-icon">🖼️</div>
          <h4>No NFTs Found</h4>
          <p>
            {filter === 'owned' 
              ? "You don't own any NFTs from this collection yet."
              : filter === 'available'
              ? "All NFTs in this collection have been minted."
              : "No NFTs have been minted yet."
            }
          </p>
        </div>
      ) : (
        <div className="gallery-grid">
          {filteredTokens.map(renderTokenCard)}
        </div>
      )}

      {/* Token Detail Modal */}
      {showModal && selectedToken && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            
            <div className="token-detail">
              <div className="token-detail-image">
                {selectedToken.metadata?.image ? (
                  <img 
                    src={selectedToken.metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')} 
                    alt={`NFT #${selectedToken.id}`}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2Qzc1N0QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
                    }}
                  />
                ) : (
                  <div className="token-placeholder-large">
                    <span>🖼️</span>
                    <p>No Image Available</p>
                  </div>
                )}
              </div>
              
              <div className="token-detail-info">
                <h2>{selectedToken.metadata?.name || `NFT #${selectedToken.id}`}</h2>
                <p className="token-description">
                  {selectedToken.metadata?.description || 'No description available'}
                </p>
                
                <div className="token-details">
                  <div className="detail-item">
                    <strong>Token ID:</strong> #{selectedToken.id}
                  </div>
                  <div className="detail-item">
                    <strong>Owner:</strong> {selectedToken.owner}
                  </div>
                  <div className="detail-item">
                    <strong>Token URI:</strong> 
                    <a href={selectedToken.uri} target="_blank" rel="noopener noreferrer">
                      {selectedToken.uri}
                    </a>
                  </div>
                </div>

                {selectedToken.metadata?.attributes && (
                  <div className="token-attributes">
                    <h4>Attributes</h4>
                    <div className="attributes-grid">
                      {selectedToken.metadata.attributes.map((attr, index) => (
                        <div key={index} className="attribute-item">
                          <div className="attribute-type">{attr.trait_type}</div>
                          <div className="attribute-value">{attr.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyNFTGallery; 