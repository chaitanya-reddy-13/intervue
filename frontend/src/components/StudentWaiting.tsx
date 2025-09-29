import React from 'react';

const StudentWaiting: React.FC = () => {
  return (
    <div className="app-container">
      <div className="card">
        <div className="logo">🎯 Intervue Poll</div>
        
        <div className="waiting-message">
          <div className="loading-spinner"></div>
          <h3>Wait for the teacher to ask questions..</h3>
        </div>
      </div>
    </div>
  );
};

export default StudentWaiting;
