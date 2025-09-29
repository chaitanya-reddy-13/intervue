import React from 'react';

const KickedOut: React.FC = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="app-container">
      <div className="card">
        <div className="logo">🎯 Intervue Poll</div>
        
        <div className="waiting-message">
          <h1 className="title">You've been Kicked out !</h1>
          <p className="subtitle">
            Looks like the teacher had removed you from the poll system. Please try again sometime.
          </p>
          
          <button className="primary-button" onClick={handleRetry} style={{ marginTop: '20px' }}>
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default KickedOut;
