import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './common';
import { LockContractPage } from './contracts/lock';
import { SimpleVaultPage } from './contracts/simplevault';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/contract/lock" element={<LockContractPage />} />
        <Route path="/contract/simplevault" element={<SimpleVaultPage />} />
      </Routes>
    </Router>
  );
}

export default App; 