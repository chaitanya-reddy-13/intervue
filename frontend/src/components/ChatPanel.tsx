import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import UserAvatar from './UserAvatar';

interface ChatPanelProps {
  isTeacher: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isTeacher }) => {
  const [message, setMessage] = useState('');
  const { chatMessages, sendMessage } = useSocket();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message.trim(), isTeacher);
      setMessage('');
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="chat-container" ref={chatContainerRef}>
        {chatMessages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--medium-gray)', padding: '20px' }}>
            No messages yet
          </div>
        ) : (
          chatMessages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.isTeacher ? 'teacher' : 'student'}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <UserAvatar name={msg.sender} size="small" />
                <div className="chat-sender">
                  {msg.sender} • {formatTime(msg.timestamp)}
                </div>
              </div>
              <div style={{ marginLeft: '32px' }}>{msg.message}</div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" className="chat-send-button" disabled={!message.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
