import React, { useState, useEffect } from 'react';
import { Character } from '../types/Character';
import { CharacterCard } from '../components/CharacterCard';
import { apiService } from '../services/api';

interface CharacterListProps {
  refreshTrigger?: number;
}

export const CharacterList: React.FC<CharacterListProps> = ({ refreshTrigger }) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  useEffect(() => {
    loadCharacters();
  }, [refreshTrigger]);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      const charactersData = await apiService.getCharacters();
      setCharacters(charactersData);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load characters');
    } finally {
      setLoading(false);
    }
  };

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(selectedCharacter?.id === character.id ? null : character);
  };

  if (loading) {
    return <div className="loading">Loading characters...</div>;
  }

  if (error) {
    return (
      <div className="card">
        <div className="error">{error}</div>
        <button className="button" onClick={loadCharacters}>
          Try Again
        </button>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="card">
        <h2>No Characters Found</h2>
        <p>Create your first character to get started!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <h2>Character Roster ({characters.length})</h2>
        <p>Click on a character to view detailed information</p>
      </div>

      <div className="character-grid">
        {characters.map(character => (
          <CharacterCard
            key={character.id}
            character={character}
            onSelect={handleCharacterSelect}
          />
        ))}
      </div>

      {selectedCharacter && (
        <div className="card">
          <h3>Character Details: {selectedCharacter.name}</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div>
              <h4>Basic Information</h4>
              <div className="stat-row">
                <span>ID:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{selectedCharacter.id}</span>
              </div>
              <div className="stat-row">
                <span>Name:</span>
                <span>{selectedCharacter.name}</span>
              </div>
              <div className="stat-row">
                <span>Class:</span>
                <span style={{ textTransform: 'capitalize' }}>{selectedCharacter.characterClass}</span>
              </div>
              <div className="stat-row">
                <span>Level:</span>
                <span>{selectedCharacter.level}</span>
              </div>
              <div className="stat-row">
                <span>Experience:</span>
                <span>{selectedCharacter.experience}</span>
              </div>
            </div>

            <div>
              <h4>Combat Stats</h4>
              <div className="stat-row">
                <span>Hit Points:</span>
                <span>{selectedCharacter.hitPoints.current}/{selectedCharacter.hitPoints.max}</span>
              </div>
              <div className="stat-row">
                <span>Armor Class:</span>
                <span>{selectedCharacter.armorClass}</span>
              </div>
              <div className="stat-row">
                <span>Status:</span>
                <span style={{ color: selectedCharacter.isAlive ? '#00b894' : '#ff6b6b' }}>
                  {selectedCharacter.isAlive ? '💚 Alive' : '💀 Dead'}
                </span>
              </div>
            </div>

            <div>
              <h4>Ability Scores</h4>
              {Object.entries(selectedCharacter.abilityScores).map(([ability, score]) => {
                const modifier = Math.floor((score - 10) / 2);
                return (
                  <div key={ability} className="stat-row">
                    <span style={{ textTransform: 'capitalize' }}>{ability}:</span>
                    <span>
                      {score} ({modifier >= 0 ? '+' : ''}{modifier})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button 
              className="button secondary" 
              onClick={() => setSelectedCharacter(null)}
            >
              Close Details
            </button>
            <button 
              className="button" 
              onClick={() => {
                navigator.clipboard.writeText(selectedCharacter.id);
                alert('Character ID copied to clipboard!');
              }}
            >
              Copy ID
            </button>
          </div>
        </div>
      )}
    </div>
  );
};