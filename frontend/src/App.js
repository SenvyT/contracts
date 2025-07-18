import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import LockContractPage from './components/LockContractPage';
import SimpleVaultPage from './components/SimpleVaultPage';

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