import React, { useState } from 'react';
import MyTokenInfo from './MyTokenInfo';
import MyTokenActions from './MyTokenActions';

const MyTokenPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🪙 MyToken Dashboard</h1>
        <p>Manage your advanced ERC-20 token with minting, burning, and admin features</p>
      </div>

      <MyTokenInfo key={refreshKey} onRefresh={handleRefresh} />
      <MyTokenActions onActionComplete={handleRefresh} />
    </div>
  );
};

export default MyTokenPage; 