import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import ChatPanel from './ChatPanel';
import UserAvatar from './UserAvatar';

interface TeacherPollViewProps {
  onCreateNewPoll?: () => void;
}

const TeacherPollView: React.FC<TeacherPollViewProps> = ({ onCreateNewPoll }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('participants');
  const { currentPoll, students, removeStudent, endPoll } = useSocket();

  useEffect(() => {
    if (currentPoll && currentPoll.active) {
      const endTime = currentPoll.startTime + currentPoll.timeLimit;
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        setTimeLeft(Math.ceil(remaining / 1000));
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [currentPoll]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRemoveStudent = (studentId: string) => {
    removeStudent(studentId);
  };

  const handleNewQuestion = () => {
    console.log('Ask new question clicked');
    console.log('onCreateNewPoll function:', onCreateNewPoll);
    if (onCreateNewPoll) {
      onCreateNewPoll();
    } else {
      console.error('onCreateNewPoll prop not provided');
    }
  };

  const handleViewHistory = () => {
    // This could be handled better with proper state management
    window.open('/history', '_blank');
  };

  if (!currentPoll) {
    return (
      <div className="app-container">
        <div className="card">
          <div className="waiting-message">
            <h3>No active poll</h3>
            <p>Create a new poll to get started.</p>
          </div>
        </div>
      </div>
    );
  }

  const totalVotes = currentPoll.options.reduce((sum, option) => sum + option.votes, 0);
  const allStudentsAnswered = students.length > 0 && students.every(student => student.hasAnswered);
  
  console.log('TeacherPollView render:', {
    currentPoll: currentPoll?.active,
    allStudentsAnswered,
    timeLeft,
    studentsCount: students.length,
    onCreateNewPoll: !!onCreateNewPoll
  });

  return (
    <div className="app-container">
      <button
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'var(--secondary-purple)',
          color: 'var(--white)',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '25px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          zIndex: 10
        }}
        onClick={handleViewHistory}
      >
        📊 View Poll History
      </button>
      <div className="card extra-wide-card" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Main Poll Content */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '24px', textAlign: 'left' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>Question</h2>
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

          <button 
            className="primary-button"
            onClick={handleNewQuestion}
          >
            + Ask a new question
          </button>
        </div>

        {/* Side Panel */}
        <div className="participants-panel">
          <div className="tabs">
            <div 
              className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </div>
            <div 
              className={`tab ${activeTab === 'participants' ? 'active' : ''}`}
              onClick={() => setActiveTab('participants')}
            >
              Participants
            </div>
          </div>

          {activeTab === 'chat' ? (
            <ChatPanel isTeacher={true} />
          ) : (
            <div>
              <div style={{ marginBottom: '16px', fontSize: '14px', fontWeight: '600', color: 'var(--medium-gray)' }}>
                Name
              </div>
              {students.map((student) => (
                <div key={student.id} className="participant-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <UserAvatar name={student.name} size="small" />
                    <div>
                      <div className="participant-name">{student.name}</div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: student.hasAnswered ? 'var(--green)' : 'var(--medium-gray)' 
                      }}>
                        {student.hasAnswered ? 'Answered' : 'Waiting...'}
                      </div>
                    </div>
                  </div>
                  <button
                    className="kick-button"
                    onClick={() => handleRemoveStudent(student.id)}
                  >
                    Kick out
                  </button>
                </div>
              ))}
              {students.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--medium-gray)', padding: '20px' }}>
                  No students connected
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherPollView;
