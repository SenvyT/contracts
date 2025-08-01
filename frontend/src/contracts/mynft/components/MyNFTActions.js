import React, { useState, useEffect } from 'react';
import { web3Service } from '../../../common';

const MyNFTActions = () => {
  const [mintForm, setMintForm] = useState({
    tokenURI: '',
    recipient: ''
  });
  const [burnForm, setBurnForm] = useState({
    tokenId: ''
  });
  const [ownerForm, setOwnerForm] = useState({
    newMintPrice: '',
    newMaxSupply: '',
    tokenURI: '',
    recipient: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [mintPrice, setMintPrice] = useState('0');

  useEffect(() => {
    checkOwnerStatus();
    loadMintPrice();
  }, []);

  const checkOwnerStatus = async () => {
    try {
      const status = web3Service.getConnectionStatus();
      if (status.isConnected && web3Service.myNFTContract) {
        const owner = await web3Service.myNFTContract.owner();
        const currentAccount = await web3Service.getCurrentAccount();
        setIsOwner(owner.toLowerCase() === currentAccount.toLowerCase());
      }
    } catch (error) {
      console.error('Error checking owner status:', error);
    }
  };

  const loadMintPrice = async () => {
    try {
      if (web3Service.myNFTContract) {
        const price = await web3Service.myNFTContract.mintPrice();
        setMintPrice(price.toString());
      }
    } catch (error) {
      console.error('Error loading mint price:', error);
    }
  };

  const handleMint = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const recipient = mintForm.recipient || await web3Service.getCurrentAccount();
      const result = await web3Service.mintMyNFT(recipient, mintForm.tokenURI);
      
      setSuccess(`✅ NFT minted successfully! Token ID: ${result.tokenId}`);
      setMintForm({ tokenURI: '', recipient: '' });
    } catch (err) {
      setError('Failed to mint NFT: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };



  const handleBurn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await web3Service.burnMyNFT(parseInt(burnForm.tokenId));
      setSuccess(`✅ NFT #${burnForm.tokenId} burned successfully!`);
      setBurnForm({ tokenId: '' });
    } catch (err) {
      setError('Failed to burn NFT: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOwnerMint = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const recipient = ownerForm.recipient || await web3Service.getCurrentAccount();
      const result = await web3Service.ownerMintMyNFT(recipient, ownerForm.tokenURI);
      
      setSuccess(`✅ Owner mint successful! Token ID: ${result.tokenId}`);
      setOwnerForm({ ...ownerForm, tokenURI: '', recipient: '' });
    } catch (err) {
      setError('Failed to owner mint: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetMintPrice = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const newPrice = web3Service.ethers.parseEther(ownerForm.newMintPrice);
      await web3Service.setMyNFTMintPrice(newPrice);
      setSuccess('✅ Mint price updated successfully!');
      setOwnerForm({ ...ownerForm, newMintPrice: '' });
      loadMintPrice();
    } catch (err) {
      setError('Failed to update mint price: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetMaxSupply = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await web3Service.setMyNFTMaxSupply(parseInt(ownerForm.newMaxSupply));
      setSuccess('✅ Max supply updated successfully!');
      setOwnerForm({ ...ownerForm, newMaxSupply: '' });
    } catch (err) {
      setError('Failed to update max supply: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePause = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const isPaused = await web3Service.myNFTContract.isPaused();
      await web3Service.setMyNFTPaused(!isPaused);
      setSuccess(`✅ Contract ${!isPaused ? 'paused' : 'unpaused'} successfully!`);
    } catch (err) {
      setError('Failed to toggle pause: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await web3Service.withdrawMyNFT();
      setSuccess('✅ Funds withdrawn successfully!');
    } catch (err) {
      setError('Failed to withdraw funds: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (priceWei) => {
    if (!priceWei) return '0 ETH';
    const priceEth = parseFloat(priceWei) / 1e18;
    return `${priceEth} ETH`;
  };

  return (
    <div className="card">
      <h3>🎨 NFT Actions</h3>

      {error && (
        <div className="alert error">
          {error}
          <button className="close-button" onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="alert success">
          {success}
          <button className="close-button" onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      <div className="current-price">
        <strong>Current Mint Price:</strong> {formatPrice(mintPrice)}
      </div>

      {/* Public Minting */}
      <div className="action-section">
        <h4>🪙 Public Minting</h4>
        
        <form onSubmit={handleMint} className="form-group">
          <label>Token URI (IPFS):</label>
          <input
            type="text"
            placeholder="ipfs://QmYourTokenURI"
            value={mintForm.tokenURI}
            onChange={(e) => setMintForm({...mintForm, tokenURI: e.target.value})}
            required
          />
          
          <label>Recipient Address (optional - defaults to your address):</label>
          <input
            type="text"
            placeholder="0x..."
            value={mintForm.recipient}
            onChange={(e) => setMintForm({...mintForm, recipient: e.target.value})}
          />
          
          <button type="submit" className="button" disabled={isLoading}>
            {isLoading ? 'Minting...' : `Mint NFT (${formatPrice(mintPrice)})`}
          </button>
        </form>


      </div>

      {/* Burning */}
      <div className="action-section">
        <h4>🔥 Burn NFT</h4>
        
        <form onSubmit={handleBurn} className="form-group">
          <label>Token ID:</label>
          <input
            type="number"
            placeholder="1"
            value={burnForm.tokenId}
            onChange={(e) => setBurnForm({tokenId: e.target.value})}
            required
          />
          
          <button type="submit" className="button danger" disabled={isLoading}>
            {isLoading ? 'Burning...' : 'Burn NFT'}
          </button>
        </form>
      </div>

      {/* Owner Functions */}
      {isOwner && (
        <div className="action-section owner-section">
          <h4>👑 Owner Functions</h4>
          
          <form onSubmit={handleOwnerMint} className="form-group">
            <label>Owner Mint (Free):</label>
            <input
              type="text"
              placeholder="ipfs://QmYourTokenURI"
              value={ownerForm.tokenURI}
              onChange={(e) => setOwnerForm({...ownerForm, tokenURI: e.target.value})}
              required
            />
            
            <label>Recipient Address (optional):</label>
            <input
              type="text"
              placeholder="0x..."
              value={ownerForm.recipient}
              onChange={(e) => setOwnerForm({...ownerForm, recipient: e.target.value})}
            />
            
            <button type="submit" className="button" disabled={isLoading}>
              {isLoading ? 'Owner Minting...' : 'Owner Mint (Free)'}
            </button>
          </form>

          <form onSubmit={handleSetMintPrice} className="form-group">
            <label>New Mint Price (ETH):</label>
            <input
              type="number"
              step="0.001"
              placeholder="0.01"
              value={ownerForm.newMintPrice}
              onChange={(e) => setOwnerForm({...ownerForm, newMintPrice: e.target.value})}
              required
            />
            
            <button type="submit" className="button warning" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Mint Price'}
            </button>
          </form>

          <form onSubmit={handleSetMaxSupply} className="form-group">
            <label>New Max Supply:</label>
            <input
              type="number"
              placeholder="1000"
              value={ownerForm.newMaxSupply}
              onChange={(e) => setOwnerForm({...ownerForm, newMaxSupply: e.target.value})}
              required
            />
            
            <button type="submit" className="button warning" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Max Supply'}
            </button>
          </form>

          <div className="button-group">
            <button onClick={handleTogglePause} className="button warning" disabled={isLoading}>
              {isLoading ? 'Toggling...' : 'Toggle Pause'}
            </button>
            
            <button onClick={handleWithdraw} className="button primary" disabled={isLoading}>
              {isLoading ? 'Withdrawing...' : 'Withdraw Funds'}
            </button>
          </div>
        </div>
      )}

      {!isOwner && (
        <div className="owner-notice">
          <p>🔒 Owner functions are only available to the contract owner</p>
        </div>
      )}
    </div>
  );
};

export default MyNFTActions; 