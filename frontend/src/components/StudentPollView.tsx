import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import UserAvatar from './UserAvatar';

const StudentPollView: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { currentPoll, submitAnswer, students } = useSocket();

  useEffect(() => {
    if (currentPoll && currentPoll.active) {
      const endTime = currentPoll.startTime + currentPoll.timeLimit;
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        setTimeLeft(Math.ceil(remaining / 1000));
        
        if (remaining <= 0) {
          setHasSubmitted(true);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [currentPoll]);

  const handleSubmit = () => {
    if (selectedOption !== null && currentPoll && !hasSubmitted) {
      submitAnswer(selectedOption);
      setHasSubmitted(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentPoll) {
    return (
      <div className="app-container">
        <div className="card">
          <div className="waiting-message">
            <h3>No active poll</h3>
            <p>Wait for the teacher to start a new poll.</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if current user has already answered
  const currentStudent = students.find(s => s.socketId === (window as any).socketId);
  const userHasAnswered = currentStudent?.hasAnswered || hasSubmitted;

  if (userHasAnswered || !currentPoll.active) {
    // Show results after answering or when poll ends
    const totalVotes = currentPoll.options.reduce((sum, option) => sum + option.votes, 0);
    
    return (
      <div className="app-container">
        <div className="card wide-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '18px', fontWeight: '600' }}>Question 1</span>
              <span className="timer">⏰ {formatTime(timeLeft)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {students.slice(0, 3).map((student) => (
                <UserAvatar key={student.id} name={student.name} size="small" />
              ))}
              {students.length > 3 && (
                <div style={{ 
                  fontSize: '14px', 
                  color: 'var(--medium-gray)',
                  fontWeight: '600' 
                }}>
                  +{students.length - 3}
                </div>
              )}
            </div>
          </div>

          <div className="question-header">
            {currentPoll.question}
          </div>

          <div style={{ marginBottom: '32px' }}>
            {currentPoll.options.map((option, index) => {
              const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
              return (
                <div key={index} className="option" style={{ cursor: 'default' }}>
                  <div className="option-indicator">{index + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div className="option-text">{option.text}</div>
                    <div className="result-bar">
                      <div 
                        className="result-fill" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="percentage">{percentage}%</div>
                </div>
              );
            })}
          </div>

          <div className="waiting-message">
            <h3>Wait for the teacher to ask a new question.</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="card wide-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '18px', fontWeight: '600' }}>Question 1</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="timer">⏰ {formatTime(timeLeft)}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {students.slice(0, 3).map((student) => (
                <UserAvatar key={student.id} name={student.name} size="small" />
              ))}
              {students.length > 3 && (
                <div style={{ 
                  fontSize: '14px', 
                  color: 'var(--medium-gray)',
                  fontWeight: '600' 
                }}>
                  +{students.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="question-header">
          {currentPoll.question}
        </div>

        <div style={{ marginBottom: '32px' }}>
          {currentPoll.options.map((option, index) => (
            <div 
              key={index} 
              className={`option ${selectedOption === index ? 'selected' : ''}`}
              onClick={() => setSelectedOption(index)}
            >
              <div className="option-indicator">{index + 1}</div>
              <div className="option-text">{option.text}</div>
            </div>
          ))}
        </div>

        <button 
          className="primary-button"
          onClick={handleSubmit}
          disabled={selectedOption === null || timeLeft <= 0}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default StudentPollView;
