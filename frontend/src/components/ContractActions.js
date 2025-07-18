import React, { useState, useEffect } from 'react';
import web3Service from '../utils/web3';

const ContractActions = ({ onActionComplete }) => {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [canWithdraw, setCanWithdraw] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    checkWithdrawalStatus();
    const interval = setInterval(checkWithdrawalStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkWithdrawalStatus = async () => {
    try {
      const status = web3Service.getConnectionStatus();
      if (status.isConnected) {
        const canWithdrawStatus = await web3Service.canWithdraw();
        setCanWithdraw(canWithdrawStatus);
      }
    } catch (error) {
      console.error('Error checking withdrawal status:', error);
    }
  };

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    setMessage('');
    setMessageType('');

    try {
      const result = await web3Service.withdraw();
      
      setMessage(`Withdrawal successful! Transaction hash: ${result.hash}`);
      setMessageType('success');
      
      onActionComplete && onActionComplete();
    } catch (error) {
      setMessage('Withdrawal failed: ' + error.message);
      setMessageType('error');
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="card">
      <h3>Contract Actions</h3>

      {message && (
        <div className={`status ${messageType}`}>
          {message}
        </div>
      )}

      <div className="flex-column">
        <h4>Withdraw Funds</h4>
        <p>
          Withdraw funds from the contract if you are the owner and the unlock time has passed.
        </p>
        
        <div className="status info">
          <strong>Status:</strong> {canWithdraw ? 'Ready to withdraw' : 'Cannot withdraw yet'}
        </div>
        
        <button 
          className="button danger"
          onClick={handleWithdraw}
          disabled={!canWithdraw || isWithdrawing}
        >
          {isWithdrawing ? (
            <>
              <span className="loading"></span>
              Withdrawing...
            </>
          ) : (
            'Withdraw Funds'
          )}
        </button>
      </div>
    </div>
  );
};

export default ContractActions; 