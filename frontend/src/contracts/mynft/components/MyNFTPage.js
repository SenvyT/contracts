import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MyNFTInfo from './MyNFTInfo';
import MyNFTActions from './MyNFTActions';
import MyNFTGallery from './MyNFTGallery';

const MyNFTPage = () => {
  const [activeTab, setActiveTab] = useState('info');

  const tabs = [
    { id: 'info', label: '📊 Collection Info', component: MyNFTInfo },
    { id: 'actions', label: '🎨 Mint & Actions', component: MyNFTActions },
    { id: 'gallery', label: '🖼️ Gallery', component: MyNFTGallery }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="container">
      <div className="header">
        <Link to="/" className="back-link">
          ← Back to Home
        </Link>
        <h1>🎨 MyNFT Collection</h1>
        <p>Create, mint, and manage your NFT collection</p>
      </div>

      <div className="tab-navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {ActiveComponent && <ActiveComponent />}
      </div>

      <div className="help-section">
        <h3>💡 How to Use</h3>
        <div className="help-grid">
          <div className="help-item">
            <h4>📊 Collection Info</h4>
            <p>View collection statistics, progress, and your owned NFTs</p>
          </div>
          <div className="help-item">
            <h4>🎨 Mint & Actions</h4>
            <p>Mint new NFTs, burn tokens, and manage collection settings (owner only)</p>
          </div>
          <div className="help-item">
            <h4>🖼️ Gallery</h4>
            <p>Browse all NFTs in the collection with metadata and images</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyNFTPage; 