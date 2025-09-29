import React, { useState } from 'react';
import ChatPanel from './ChatPanel';

interface FloatingChatProps {
  isTeacher: boolean;
}

const FloatingChat: React.FC<FloatingChatProps> = ({ isTeacher }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="floating-chat">
      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '0',
            width: '350px',
            background: 'var(--white)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 20px rgba(119, 101, 218, 0.2)',
            border: '1px solid var(--light-gray)'
          }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '16px' 
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Chat</h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: 'var(--medium-gray)'
              }}
            >
              ×
            </button>
          </div>
          <ChatPanel isTeacher={isTeacher} />
        </div>
      )}
      
      <button
        className="chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        💬
      </button>
    </div>
  );
};

export default FloatingChat;
