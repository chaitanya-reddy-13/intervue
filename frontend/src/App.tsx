import React, { useState, useEffect } from 'react';
import { SocketProvider, useSocket } from './context/SocketContext';
import WelcomeScreen from './components/WelcomeScreen';
import StudentNameEntry from './components/StudentNameEntry';
import StudentWaiting from './components/StudentWaiting';
import StudentPollView from './components/StudentPollView';
import TeacherPollCreation from './components/TeacherPollCreation';
import TeacherPollView from './components/TeacherPollView';
import PollHistory from './components/PollHistory';
import KickedOut from './components/KickedOut';
import FloatingChat from './components/FloatingChat';
import { UserRole } from './types';
import './App.css';

const AppContent: React.FC = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [studentName, setStudentName] = useState('');
  const [isStudentJoined, setIsStudentJoined] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPollCreation, setShowPollCreation] = useState(false);
  const { currentPoll, isKickedOut, students, socket } = useSocket();

  // Store socket ID globally for student identification
  useEffect(() => {
    if (socket) {
      (window as any).socketId = socket.id;
    }
  }, [socket]);

  // Handle student joining
  useEffect(() => {
    if (socket && role === 'student' && studentName && !isStudentJoined) {
      const handleStudentJoined = () => {
        setIsStudentJoined(true);
      };

      socket.on('studentJoined', handleStudentJoined);
      return () => {
        socket.off('studentJoined', handleStudentJoined);
      };
    }
  }, [socket, role, studentName, isStudentJoined]);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
  };

  const handleStudentNameSubmit = (name: string) => {
    setStudentName(name);
  };

  const handleShowHistory = () => {
    setShowHistory(true);
  };

  const handleBackFromHistory = () => {
    setShowHistory(false);
  };

  const handleCreateNewPoll = () => {
    console.log('App: handleCreateNewPoll called, setting showPollCreation to true');
    setShowPollCreation(true);
  };

  const handleBackToPollView = () => {
    setShowPollCreation(false);
  };

  // Reset poll creation state when a new poll is created
  useEffect(() => {
    if (currentPoll && showPollCreation) {
      setShowPollCreation(false);
    }
  }, [currentPoll, showPollCreation]);

  // Show kicked out screen if student was removed
  if (isKickedOut && role === 'student') {
    return <KickedOut />;
  }

  // Show poll history if requested
  if (showHistory) {
    return <PollHistory onBack={handleBackFromHistory} />;
  }

  // Role selection screen
  if (!role) {
    return <WelcomeScreen onRoleSelect={handleRoleSelect} />;
  }

  // Student flow
  if (role === 'student') {
    if (!studentName || !isStudentJoined) {
      return <StudentNameEntry onNameSubmitted={handleStudentNameSubmit} />;
    }

    if (!currentPoll || !currentPoll.active) {
      return (
        <>
          <StudentWaiting />
          <FloatingChat isTeacher={false} />
        </>
      );
    }

    return (
      <>
        <StudentPollView />
        <FloatingChat isTeacher={false} />
      </>
    );
  }

  // Teacher flow
  if (role === 'teacher') {
    console.log('App: Teacher flow - showPollCreation:', showPollCreation, 'currentPoll:', !!currentPoll);
    // If showing poll creation (either no poll exists or user wants to create new one)
    if (showPollCreation || !currentPoll) {
      console.log('App: Showing TeacherPollCreation component');
      return (
        <>
          <TeacherPollCreation onBack={handleBackToPollView} />
          <FloatingChat isTeacher={true} />
          <button
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              background: 'var(--secondary-purple)',
              color: 'var(--white)',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
            onClick={handleShowHistory}
          >
            📊 View Poll History
          </button>
        </>
      );
    }

    // Show poll results/management view
    console.log('App: Showing TeacherPollView component');
    return (
      <>
        <TeacherPollView onCreateNewPoll={handleCreateNewPoll} />
        <FloatingChat isTeacher={true} />
        <button
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'var(--secondary-purple)',
            color: 'var(--white)',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
          onClick={handleShowHistory}
        >
          📊 View Poll History
        </button>
      </>
    );
  }

  return null;
};

const App: React.FC = () => {
  return (
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  );
};

export default App;