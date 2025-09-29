import React, { useState } from 'react';
import { UserRole } from '../types';

interface WelcomeScreenProps {
  onRoleSelect: (role: UserRole) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onRoleSelect }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  const handleContinue = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole);
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <div className="logo">🎯 Intervue Poll</div>
        
        <h1 className="title">Welcome to the Live Polling System</h1>
        <p className="subtitle">
          Please select the role that best describes you to begin using the live polling system
        </p>

        <div className="role-selection">
          <div 
            className={`role-card ${selectedRole === 'student' ? 'selected' : ''}`}
            onClick={() => setSelectedRole('student')}
          >
            <h3>I'm a Student</h3>
            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
          </div>

          <div 
            className={`role-card ${selectedRole === 'teacher' ? 'selected' : ''}`}
            onClick={() => setSelectedRole('teacher')}
          >
            <h3>I'm a Teacher</h3>
            <p>Submit answers and view live poll results in real-time.</p>
          </div>
        </div>

        <button 
          className="primary-button"
          onClick={handleContinue}
          disabled={!selectedRole}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
