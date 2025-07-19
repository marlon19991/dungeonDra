import React, { useState, useEffect } from 'react';
import { Character } from '../types/Character';
import { Story, CreateStoryData } from '../types/Story';
import { apiService } from '../services/api';
import { storyApiService } from '../services/storyApi';
import { AIConfiguration } from '../components/AIConfiguration';

export const StoryMode: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentView, setCurrentView] = useState<'config' | 'create' | 'list' | 'play'>('config');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [customAction, setCustomAction] = useState('');

  useEffect(() => {
    loadCharacters();
    loadStories();
    
    // Check if AI is already configured
    if (storyApiService.hasApiKey()) {
      setCurrentView('list');
    }
  }, []);

  const loadCharacters = async () => {
    try {
      const charactersData = await apiService.getCharacters();
      const aliveCharacters = charactersData.filter(char => char.isAlive);
      setCharacters(aliveCharacters);
    } catch (err) {
      setError('Failed to load characters');
    }
  };

  const loadStories = async () => {
    try {
      const storiesData = await storyApiService.getStories();
      setStories(storiesData);
    } catch (err) {
      // Stories might not load if AI not configured yet
      console.log('Could not load stories:', err);
    }
  };

  const handleAIConfigured = () => {
    setCurrentView('list');
    loadStories();
  };

  const handleCreateStory = async () => {
    if (selectedCharacters.length === 0) {
      setError('Please select at least one character');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const createData: CreateStoryData = {
        characterIds: selectedCharacters
      };

      const newStory = await storyApiService.createStory(createData);
      setStories(prev => [newStory, ...prev]);
      setSelectedStory(newStory);
      setCurrentView('play');
      setSuccess('Story created successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create story');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueStory = async (selectedOption?: string) => {
    if (!selectedStory) return;

    const action = selectedOption || customAction.trim();
    if (!action) {
      setError('Please select an option or enter a custom action');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const continueData = {
        storyId: selectedStory.id,
        selectedOption: selectedOption,
        customAction: selectedOption ? undefined : customAction.trim()
      };

      const updatedStory = await storyApiService.continueStory(continueData);
      setSelectedStory(updatedStory);
      setCustomAction('');
      
      // Update stories list
      setStories(prev => 
        prev.map(story => story.id === updatedStory.id ? updatedStory : story)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to continue story');
    } finally {
      setLoading(false);
    }
  };

  const renderConfiguration = () => (
    <AIConfiguration onConfigured={handleAIConfigured} />
  );

  const renderStoryCreation = () => (
    <div className="card">
      <h2>📖 Create New Adventure</h2>
      <p>Select characters to start a new AI-generated story adventure.</p>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {characters.length === 0 ? (
        <div className="error">
          No living characters available. Create some characters first!
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h3>Select Characters for the Adventure:</h3>
            <div className="character-grid">
              {characters.map(character => (
                <div
                  key={character.id}
                  className={`character-card ${selectedCharacters.includes(character.id) ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedCharacters(prev => 
                      prev.includes(character.id)
                        ? prev.filter(id => id !== character.id)
                        : [...prev, character.id]
                    );
                  }}
                  style={{ 
                    cursor: 'pointer',
                    border: selectedCharacters.includes(character.id) 
                      ? '2px solid #ffd700' 
                      : '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <div className="character-name">{character.name}</div>
                  <div className="character-class">{character.characterClass}</div>
                  <div className="stat-row">
                    <span>Level {character.level}</span>
                    <span>{character.hitPoints.current}/{character.hitPoints.max} HP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="button" 
              onClick={handleCreateStory}
              disabled={loading || selectedCharacters.length === 0}
            >
              {loading ? 'Generating...' : '🎭 Start Adventure'}
            </button>
            <button 
              className="button secondary" 
              onClick={() => setSelectedCharacters([])}
              disabled={loading}
            >
              Clear Selection
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderStoryList = () => (
    <div>
      <div className="card">
        <h2>📚 Adventure Stories</h2>
        <p>Manage your AI-generated adventure stories.</p>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button 
            className="button" 
            onClick={() => setCurrentView('create')}
          >
            ➕ New Adventure
          </button>
          <button 
            className="button secondary" 
            onClick={loadStories}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {stories.length === 0 ? (
        <div className="card">
          <p>No stories yet. Create your first adventure!</p>
        </div>
      ) : (
        <div className="character-grid">
          {stories.map(story => (
            <div key={story.id} className="character-card">
              <div className="character-name">{story.title}</div>
              <div className="stat-row">
                <span>Chapters: {story.chapterCount}</span>
                <span>{story.isActive ? '🟢 Active' : '🔴 Ended'}</span>
              </div>
              <div className="stat-row">
                <span>Characters: {story.characterIds.length}</span>
                <span>Created: {new Date(story.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button 
                  className="button" 
                  onClick={() => {
                    setSelectedStory(story);
                    setCurrentView('play');
                  }}
                >
                  {story.canContinue ? '▶️ Continue' : '📖 Read'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStoryPlay = () => {
    if (!selectedStory) return null;

    const currentChapter = selectedStory.chapters[selectedStory.currentChapterIndex];

    return (
      <div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>📖 {selectedStory.title}</h2>
            <button 
              className="button secondary" 
              onClick={() => setCurrentView('list')}
            >
              ← Back to Stories
            </button>
          </div>

          <div className="stat-row">
            <span>Chapter {selectedStory.currentChapterIndex + 1} of {selectedStory.chapterCount}</span>
            <span>{selectedStory.isActive ? '🟢 Active' : '🔴 Complete'}</span>
          </div>
        </div>

        {/* Story Content */}
        <div className="card">
          <div style={{ 
            fontSize: '1.1rem', 
            lineHeight: '1.6', 
            marginBottom: '20px',
            whiteSpace: 'pre-wrap'
          }}>
            {currentChapter?.content}
          </div>

          {currentChapter?.metadata && (
            <div style={{ 
              fontSize: '0.8rem', 
              opacity: 0.7, 
              borderTop: '1px solid rgba(255,255,255,0.2)', 
              paddingTop: '10px' 
            }}>
              Generated in {currentChapter.metadata.generationTime}ms
            </div>
          )}
        </div>

        {/* Actions */}
        {selectedStory.canContinue && (
          <div className="card">
            <h3>What do you do next?</h3>
            
            {error && <div className="error">{error}</div>}

            {/* AI Generated Options */}
            {currentChapter?.options && currentChapter.options.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Choose an action:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                  {currentChapter.options.map((option, index) => (
                    <button
                      key={index}
                      className="button secondary"
                      onClick={() => handleContinueStory(option)}
                      disabled={loading}
                      style={{ 
                        textAlign: 'left', 
                        padding: '15px', 
                        whiteSpace: 'normal',
                        height: 'auto'
                      }}
                    >
                      {index + 1}. {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Action */}
            <div>
              <h4>Or enter your own action:</h4>
              <div className="form-group">
                <textarea
                  value={customAction}
                  onChange={(e) => setCustomAction(e.target.value)}
                  placeholder="Describe what your party does..."
                  rows={3}
                  disabled={loading}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    resize: 'vertical'
                  }}
                />
              </div>
              <button
                className="button"
                onClick={() => handleContinueStory()}
                disabled={loading || !customAction.trim()}
              >
                {loading ? 'Generating...' : '✨ Continue with Custom Action'}
              </button>
            </div>
          </div>
        )}

        {/* Story History */}
        {selectedStory.chapters.length > 1 && (
          <div className="card">
            <h3>📜 Story History</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {selectedStory.chapters.slice(0, -1).map((chapter, index) => (
                <div key={chapter.id} style={{ 
                  marginBottom: '15px', 
                  paddingBottom: '15px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '5px' }}>
                    Chapter {index + 1} {chapter.playerAction && `- Action: "${chapter.playerAction}"`}
                  </div>
                  <div style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {chapter.content.length > 200 
                      ? `${chapter.content.substring(0, 200)}...`
                      : chapter.content
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'config':
        return renderConfiguration();
      case 'create':
        return renderStoryCreation();
      case 'play':
        return renderStoryPlay();
      case 'list':
      default:
        return renderStoryList();
    }
  };

  return (
    <div>
      {/* Navigation */}
      {storyApiService.hasApiKey() && currentView !== 'config' && (
        <nav className="navigation">
          <button
            className={`nav-button ${currentView === 'list' ? 'active' : ''}`}
            onClick={() => setCurrentView('list')}
          >
            📚 Story List
          </button>
          <button
            className={`nav-button ${currentView === 'create' ? 'active' : ''}`}
            onClick={() => setCurrentView('create')}
          >
            ➕ New Story
          </button>
          <button
            className={`nav-button ${currentView === 'config' ? 'active' : ''}`}
            onClick={() => setCurrentView('config')}
          >
            ⚙️ AI Config
          </button>
        </nav>
      )}

      {renderContent()}
    </div>
  );
};