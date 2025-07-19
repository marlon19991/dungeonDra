import React, { useState, useEffect } from 'react';
import { storyApiService } from '../services/storyApi';

interface AIConfigurationProps {
  onConfigured?: () => void;
}

export const AIConfiguration: React.FC<AIConfigurationProps> = ({ onConfigured }) => {
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const existingKey = storyApiService.getGeminiApiKey();
    if (existingKey) {
      setApiKey(existingKey);
      setIsConfigured(true);
    }
  }, []);

  const handleSaveApiKey = async (skipTest = false) => {
    if (!apiKey.trim()) {
      setError('API key cannot be empty');
      return;
    }

    setTesting(true);
    setError('');
    setSuccess('');

    try {
      storyApiService.setGeminiApiKey(apiKey.trim());
      
      if (skipTest) {
        setIsConfigured(true);
        setSuccess('Gemini API key saved! (Connection not tested)');
        onConfigured?.();
        return;
      }
      
      // Test the connection with timeout
      const testPromise = storyApiService.testAIConnection();
      const timeoutPromise = new Promise<boolean>((_, reject) =>
        setTimeout(() => reject(new Error('Connection test timed out')), 10000)
      );
      
      const isConnected = await Promise.race([testPromise, timeoutPromise]);
      
      if (isConnected) {
        setIsConfigured(true);
        setSuccess('Gemini API key configured successfully!');
        onConfigured?.();
      } else {
        setError('Failed to connect to Gemini API. Please check your API key or try skipping the test.');
        // Don't clear API key on failed test, let user decide
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to configure API key. You can skip the test if you\'re sure the key is correct.');
      // Don't clear API key on failed test, let user decide
    } finally {
      setTesting(false);
    }
  };

  const handleClearApiKey = () => {
    storyApiService.clearGeminiApiKey();
    setApiKey('');
    setIsConfigured(false);
    setSuccess('');
    setError('');
  };

  if (isConfigured) {
    return (
      <div className="card">
        <h3>🤖 AI Configuration</h3>
        <div className="success">
          Gemini AI is configured and ready to generate stories!
        </div>
        
        <div style={{ marginTop: '15px' }}>
          <strong>API Key:</strong> {'*'.repeat(Math.min(apiKey.length, 20))}...
        </div>

        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
          <button className="button secondary" onClick={handleClearApiKey}>
            🗑️ Clear API Key
          </button>
          <button className="button" onClick={() => setIsConfigured(false)}>
            ⚙️ Edit Configuration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>🤖 Configure Gemini AI</h3>
      <p>
        To generate AI-powered stories, you need to provide your Gemini API key. 
        Get yours at{' '}
        <a 
          href="https://aistudio.google.com/app/apikey" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: '#ffd700' }}
        >
          Google AI Studio
        </a>
      </p>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="form-group">
        <label htmlFor="gemini-api-key">Gemini API Key</label>
        <input
          type="password"
          id="gemini-api-key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Gemini API key"
          disabled={testing}
        />
        <small style={{ opacity: 0.8, marginTop: '5px', display: 'block' }}>
          Your API key is stored locally and never sent to our servers.
        </small>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
        <button 
          className="button" 
          onClick={() => handleSaveApiKey(false)}
          disabled={testing || !apiKey.trim()}
        >
{testing ? '🔄 Testing connection...' : '🔗 Test & Connect'}
        </button>
        
        <button 
          className="button secondary" 
          onClick={() => handleSaveApiKey(true)}
          disabled={testing || !apiKey.trim()}
        >
          💾 Save Without Test
        </button>
        
        {apiKey && (
          <button 
            className="button secondary" 
            onClick={() => setApiKey('')}
            disabled={testing}
          >
            Clear
          </button>
        )}
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: 'rgba(255, 255, 255, 0.1)', 
        borderRadius: '8px',
        fontSize: '0.9rem'
      }}>
        <h4>📋 Setup Instructions:</h4>
        <ol style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#ffd700' }}>Google AI Studio</a></li>
          <li>Sign in with your Google account</li>
          <li>Click "Create API Key"</li>
          <li>Copy the generated API key</li>
          <li>Paste it in the field above</li>
        </ol>
        
        <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}>
          <strong>💡 Troubleshooting:</strong>
          <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
            <li>If connection test fails, try "Save Without Test"</li>
            <li>Make sure your API key has Gemini API access enabled</li>
            <li>Check your internet connection</li>
            <li>API key should start with "AIza..."</li>
          </ul>
        </div>
      </div>
    </div>
  );
};