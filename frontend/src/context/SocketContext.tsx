import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import io from 'socket.io-client';
import { Poll, Student, ChatMessage, PollResult } from '../types';

interface SocketContextType {
  socket: any | null;
  isConnected: boolean;
  currentPoll: Poll | null;
  students: Student[];
  chatMessages: ChatMessage[];
  error: string | null;
  isKickedOut: boolean;
  
  // Actions
  joinAsStudent: (name: string) => void;
  createPoll: (question: string, options: string[], timeLimit: number) => void;
  submitAnswer: (optionIndex: number) => void;
  endPoll: () => void;
  removeStudent: (studentId: string) => void;
  sendMessage: (message: string, isTeacher: boolean) => void;
  clearError: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isKickedOut, setIsKickedOut] = useState(false);

  useEffect(() => {
    const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setIsKickedOut(false);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('currentPoll', (poll: Poll | null) => {
      setCurrentPoll(poll);
    });

    newSocket.on('newPoll', (poll: Poll) => {
      setCurrentPoll(poll);
      setError(null);
    });

    newSocket.on('pollResults', (result: PollResult) => {
      setCurrentPoll(prev => prev ? {
        ...prev,
        options: result.options,
        active: result.active
      } : null);
    });

    newSocket.on('pollEnded', (result: PollResult) => {
      setCurrentPoll(prev => prev ? {
        ...prev,
        options: result.options,
        active: false
      } : null);
    });

    newSocket.on('studentsUpdate', (studentsList: Student[]) => {
      setStudents(studentsList);
    });

    newSocket.on('newMessage', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
    });

    newSocket.on('error', (errorData: { message: string }) => {
      setError(errorData.message);
    });

    newSocket.on('removed', () => {
      setIsKickedOut(true);
      setError('You have been removed from the poll by the teacher');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinAsStudent = (name: string) => {
    if (socket) {
      socket.emit('joinAsStudent', { name });
    }
  };

  const createPoll = (question: string, options: string[], timeLimit: number) => {
    console.log('SocketContext createPoll called:', { question, options, timeLimit });
    if (socket) {
      console.log('Socket exists, emitting createPoll event');
      socket.emit('createPoll', { question, options, timeLimit });
    } else {
      console.error('Socket is null, cannot create poll');
    }
  };

  const submitAnswer = (optionIndex: number) => {
    if (socket) {
      socket.emit('submitAnswer', { optionIndex });
    }
  };

  const endPoll = () => {
    if (socket) {
      socket.emit('endPoll');
    }
  };

  const removeStudent = (studentId: string) => {
    if (socket) {
      socket.emit('removeStudent', { studentId });
    }
  };

  const sendMessage = (message: string, isTeacher: boolean) => {
    if (socket && message.trim()) {
      socket.emit('sendMessage', { message: message.trim(), isTeacher });
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    currentPoll,
    students,
    chatMessages,
    error,
    isKickedOut,
    joinAsStudent,
    createPoll,
    submitAnswer,
    endPoll,
    removeStudent,
    sendMessage,
    clearError
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
