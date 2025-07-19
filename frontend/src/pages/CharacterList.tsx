import React, { useState, useEffect } from 'react';
import { Character } from '../types/Character';
import { CharacterCard } from '../components/CharacterCard';
import { apiService } from '../services/api';
import { translateClass, translateAbility } from '../utils/translations';

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
      setError(err instanceof Error ? err.message : 'Error al cargar los personajes');
    } finally {
      setLoading(false);
    }
  };

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(selectedCharacter?.id === character.id ? null : character);
  };

  if (loading) {
    return <div className="loading">Cargando personajes...</div>;
  }

  if (error) {
    return (
      <div className="card">
        <div className="error">{error}</div>
        <button className="button" onClick={loadCharacters}>
          Intentar de Nuevo
        </button>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="card">
        <h2>No se Encontraron Personajes</h2>
        <p>¡Crea tu primer personaje para comenzar!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <h2>Lista de Personajes ({characters.length})</h2>
        <p>Haz clic en un personaje para ver información detallada</p>
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
          <h3>Detalles del Personaje: {selectedCharacter.name}</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div>
              <h4>Información Básica</h4>
              <div className="stat-row">
                <span>ID:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{selectedCharacter.id}</span>
              </div>
              <div className="stat-row">
                <span>Nombre:</span>
                <span>{selectedCharacter.name}</span>
              </div>
              <div className="stat-row">
                <span>Clase:</span>
                <span>{translateClass(selectedCharacter.characterClass)}</span>
              </div>
              <div className="stat-row">
                <span>Nivel:</span>
                <span>{selectedCharacter.level}</span>
              </div>
              <div className="stat-row">
                <span>Experiencia:</span>
                <span>{selectedCharacter.experience}</span>
              </div>
            </div>

            <div>
              <h4>Estadísticas de Combate</h4>
              <div className="stat-row">
                <span>Puntos de Vida:</span>
                <span>{selectedCharacter.hitPoints.current}/{selectedCharacter.hitPoints.max}</span>
              </div>
              <div className="stat-row">
                <span>Clase de Armadura:</span>
                <span>{selectedCharacter.armorClass}</span>
              </div>
              <div className="stat-row">
                <span>Estado:</span>
                <span style={{ color: selectedCharacter.isAlive ? '#00b894' : '#ff6b6b' }}>
                  {selectedCharacter.isAlive ? '💚 Vivo' : '💀 Muerto'}
                </span>
              </div>
            </div>

            <div>
              <h4>Puntuaciones de Habilidad</h4>
              {Object.entries(selectedCharacter.abilityScores).map(([ability, score]) => {
                const modifier = Math.floor((score - 10) / 2);
                return (
                  <div key={ability} className="stat-row">
                    <span>{translateAbility(ability)}:</span>
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
              Cerrar Detalles
            </button>
            <button 
              className="button" 
              onClick={() => {
                navigator.clipboard.writeText(selectedCharacter.id);
                alert('¡ID del personaje copiado al portapapeles!');
              }}
            >
              Copiar ID
            </button>
          </div>
        </div>
      )}
    </div>
  );
};