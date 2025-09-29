import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';

interface StudentNameEntryProps {
  onNameSubmitted: (name: string) => void;
}

const StudentNameEntry: React.FC<StudentNameEntryProps> = ({ onNameSubmitted }) => {
  const [name, setName] = useState('');
  const { joinAsStudent, error, clearError } = useSocket();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      clearError();
      joinAsStudent(name.trim());
      onNameSubmitted(name.trim());
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <div className="logo">🎯 Intervue Poll</div>
        
        <h1 className="title">Let's Get Started</h1>
        <p className="subtitle">
          If you're a student, you'll be able to <strong>submit your answers</strong>, participate in live polls, and see how your responses compare with your classmates
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Enter your Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="Rahul Bajaj"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="primary-button" disabled={!name.trim()}>
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentNameEntry;
