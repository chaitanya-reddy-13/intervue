import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';

interface TeacherPollCreationProps {
  onBack?: () => void;
}

interface PollOption {
  text: string;
  isCorrect: boolean;
}

const TeacherPollCreation: React.FC<TeacherPollCreationProps> = ({ onBack }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<PollOption[]>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]);
  const [timeLimit, setTimeLimit] = useState(60);
  const { createPoll, error, clearError, currentPoll } = useSocket();

  const handleAddOption = () => {
    setOptions([...options, { text: '', isCorrect: false }]);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], text: value };
    setOptions(newOptions);
  };

  const handleCorrectnessChange = (index: number, isCorrect: boolean) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], isCorrect };
    setOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
    console.log('Question:', question);
    console.log('Options:', options);
    
    const validOptions = options.filter(opt => opt.text.trim());
    console.log('Valid options:', validOptions);
    
    if (question.trim() && validOptions.length >= 2) {
      console.log('Creating poll with:', {
        question: question.trim(),
        options: validOptions.map(opt => opt.text.trim()),
        timeLimit: timeLimit * 1000
      });
      clearError();
      const optionTexts = validOptions.map(opt => opt.text.trim());
      createPoll(question.trim(), optionTexts, timeLimit * 1000);
    } else {
      console.log('Form validation failed:', {
        hasQuestion: !!question.trim(),
        validOptionsCount: validOptions.length
      });
    }
  };

  return (
    <div className="app-container">
      <div className="card wide-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div className="logo">🎯 Intervue Poll</div>
          {onBack && currentPoll && (
            <button
              onClick={onBack}
              style={{
                background: 'transparent',
                border: '2px solid var(--primary-purple)',
                color: 'var(--primary-purple)',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              ← Back to Results
            </button>
          )}
        </div>
        
        <h1 className="title">Let's Get Started</h1>
        <p className="subtitle">
          You'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Enter your question</label>
            <div className="time-selector">
              <span>{timeLimit} seconds</span>
              <select 
                value={timeLimit} 
                onChange={(e) => setTimeLimit(Number(e.target.value))}
              >
                <option value={30}>30 seconds</option>
                <option value={60}>60 seconds</option>
                <option value={90}>90 seconds</option>
                <option value={120}>2 minutes</option>
                <option value={300}>5 minutes</option>
              </select>
            </div>
            <textarea
              className="input-field"
              placeholder="What is your favorite programming language?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              style={{ resize: 'vertical', minHeight: '80px' }}
              required
            />
            <div style={{ fontSize: '12px', color: 'var(--medium-gray)', marginTop: '4px' }}>
              {question.length}/100
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Edit Options</label>
            {options.map((option, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                marginBottom: '16px',
                padding: '16px',
                border: '1px solid var(--border-gray)',
                borderRadius: '8px',
                background: 'var(--white)'
              }}>
                <div className="option-indicator">{index + 1}</div>
                <input
                  type="text"
                  className="option-input"
                  placeholder="Enter option text"
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  style={{ flex: 1, marginBottom: 0 }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '120px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    Is it Correct?
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                      <input 
                        type="radio" 
                        name={`correct-${index}`}
                        checked={option.isCorrect}
                        onChange={() => handleCorrectnessChange(index, true)}
                        style={{ accentColor: 'var(--primary-purple)' }}
                      />
                      <span>Yes</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                      <input 
                        type="radio" 
                        name={`correct-${index}`}
                        checked={!option.isCorrect}
                        onChange={() => handleCorrectnessChange(index, false)}
                        style={{ accentColor: 'var(--primary-purple)' }}
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    style={{
                      background: 'var(--red)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            
            {options.length < 6 && (
              <button
                type="button"
                className="add-option-button"
                onClick={handleAddOption}
              >
                + Add More option
              </button>
            )}
          </div>

          <button 
            type="submit" 
            className="primary-button"
            disabled={!question.trim() || options.filter(opt => opt.text.trim()).length < 2}
          >
            Ask Question
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherPollCreation;