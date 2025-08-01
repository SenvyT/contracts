import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './common';
import { LockContractPage } from './contracts/lock';
import { SimpleVaultPage } from './contracts/simplevault';
import { MyTokenPage } from './contracts/mytoken';
import { MyNFTPage } from './contracts/mynft';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/contract/lock" element={<LockContractPage />} />
        <Route path="/contract/simplevault" element={<SimpleVaultPage />} />
        <Route path="/contract/mytoken" element={<MyTokenPage />} />
        <Route path="/contract/mynft" element={<MyNFTPage />} />
      </Routes>
    </Router>
  );
}

export default App; 