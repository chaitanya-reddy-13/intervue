import React, { useEffect, useState } from 'react';
import { Poll } from '../types';

interface PollHistoryProps {
  onBack?: () => void;
}

const PollHistory: React.FC<PollHistoryProps> = ({ onBack }) => {
  const [pollHistory, setPollHistory] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPollHistory();
  }, []);

  const fetchPollHistory = async () => {
    try {
      const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
      const response = await fetch(`${serverUrl}/api/poll-history`);
      const data = await response.json();
      setPollHistory(data.history || []);
    } catch (error) {
      console.error('Failed to fetch poll history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="card">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="card wide-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 className="title" style={{ marginBottom: 0 }}>View Poll History</h1>
          {onBack && (
            <button className="secondary-button" onClick={onBack}>
              ← Back
            </button>
          )}
        </div>

        {pollHistory.length === 0 ? (
          <div className="waiting-message">
            <h3>No polls yet</h3>
            <p>Poll history will appear here once you create some polls.</p>
          </div>
        ) : (
          <div>
            {pollHistory.map((poll, pollIndex) => {
              const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
              
              return (
                <div key={poll.id} className="history-item">
                  <div className="history-question">
                    Question {pollIndex + 1}
                  </div>
                  
                  <div className="question-header" style={{ marginBottom: '16px' }}>
                    {poll.question}
                  </div>

                  <div>
                    {poll.options.map((option, index) => {
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PollHistory;
