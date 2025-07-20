import React, { useState, useEffect } from 'react';
import { Character } from '../types/Character';
import { Story, CreateStoryData, DiceResult } from '../types/Story';
import { apiService } from '../services/api';
import { storyApiService } from '../services/storyApi';
import { DiceRoller } from '../components/DiceRoller';
import InteractiveDiceRoller, { DiceRequest, DiceRollResult } from '../components/InteractiveDiceRoller';
import StoryOptionWithDice, { StoryOption } from '../components/StoryOptionWithDice';

export const StoryMode: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentView, setCurrentView] = useState<'create' | 'list' | 'play'>('list');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [customAction, setCustomAction] = useState('');
  const [storyTheme, setStoryTheme] = useState('');
  const [pacing, setPacing] = useState<'rapido' | 'detallado'>('rapido');
  const [pendingDiceResults, setPendingDiceResults] = useState<DiceResult[] | null>(null);
  const [pendingDiceRequests, setPendingDiceRequests] = useState<DiceRequest[]>([]);
  const [showDiceRoller, setShowDiceRoller] = useState(false);
  const [currentCharacterName, setCurrentCharacterName] = useState('');

  useEffect(() => {
    loadCharacters();
    loadStories();
  }, []);

  const loadCharacters = async () => {
    try {
      const charactersData = await apiService.getCharacters();
      const aliveCharacters = charactersData.filter(char => char.isAlive);
      setCharacters(aliveCharacters);
    } catch {
      setError('Error al cargar personajes');
    }
  };

  const loadStories = async () => {
    try {
      const storiesData = await storyApiService.getStories();
      setStories(storiesData);
    } catch (err) {
      setError('No se pudieron cargar las historias. Asegúrate de que el servicio de IA esté configurado en el servidor.');
      console.log('Could not load stories:', err);
    }
  };

  const handleCreateStory = async () => {
    if (selectedCharacters.length === 0) {
      setError('Por favor selecciona al menos un personaje');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const createData: CreateStoryData = {
        characterIds: selectedCharacters,
        theme: storyTheme.trim() || undefined,
        pacing: pacing
      };

      const newStory = await storyApiService.createStory(createData);
      setStories(prev => [newStory, ...prev]);
      setSelectedStory(newStory);
      setCurrentView('play');
      setSuccess('¡Historia creada exitosamente!');
      
      // Verificar si hay dados pendientes en la nueva historia
      const currentChapter = newStory.chapters[newStory.currentChapterIndex];
      if (currentChapter?.diceRequests && currentChapter.diceRequests.length > 0) {
        const selectedCharacterNames = characters
          .filter(char => selectedCharacters.includes(char.id))
          .map(char => char.name);
        
        setPendingDiceRequests(currentChapter.diceRequests);
        setCurrentCharacterName(selectedCharacterNames[0] || 'Aventurero');
        setShowDiceRoller(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la historia');
    } finally {
      setLoading(false);
    }
  };

  const handleDiceRollsComplete = (results: DiceRollResult[]) => {
    // Convertir los resultados al formato esperado por el backend
    const diceResults: DiceResult[] = results.map(result => ({
      roll: result.roll,
      modifier: result.modifier,
      total: result.total,
      success: result.success,
      description: result.request.description
    }));
    
    setPendingDiceResults(diceResults);
    setShowDiceRoller(false);
    setPendingDiceRequests([]);
    
    // Aquí podrías enviar los resultados al backend si es necesario
    console.log('Resultados de dados:', diceResults);
  };

  const handleContinueStory = async (selectedOption?: string) => {
    if (!selectedStory) return;

    const action = selectedOption || customAction.trim();
    if (!action) {
      setError('Por favor selecciona una opción o ingresa una acción personalizada');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const continueData = {
        storyId: selectedStory.id,
        selectedOption: selectedOption,
        customAction: selectedOption ? undefined : customAction.trim(),
        pacing: pacing
      };

      const updatedStory = await storyApiService.continueStory(continueData);
      setSelectedStory(updatedStory);
      setCustomAction('');
      
      // Update stories list
      setStories(prev => 
        prev.map(story => story.id === updatedStory.id ? updatedStory : story)
      );

      // Verificar si hay dados pendientes en la historia actualizada
      const currentChapter = updatedStory.chapters[updatedStory.currentChapterIndex];
      if (currentChapter?.diceRequests && currentChapter.diceRequests.length > 0) {
        const selectedCharacterNames = characters
          .filter(char => selectedStory.characterIds.includes(char.id))
          .map(char => char.name);
        
        setPendingDiceRequests(currentChapter.diceRequests);
        setCurrentCharacterName(selectedCharacterNames[0] || 'Aventurero');
        setShowDiceRoller(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al continuar la historia');
    } finally {
      setLoading(false);
    }
  };

  const handleDiceRollComplete = (results: DiceResult[]) => {
    setPendingDiceResults(results);
    // Aquí podrías automáticamente continuar la historia con los resultados
    // o esperar a que el usuario elija una acción
  };

  const renderStoryCreation = () => (
    <div className="card">
      <h2>📖 Crear Nueva Aventura</h2>
      <p>Selecciona personajes para comenzar una nueva historia de aventura generada por IA.</p>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {characters.length === 0 ? (
        <div className="error">
          No hay personajes vivos disponibles. ¡Crea algunos personajes primero!
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h3>Selecciona Personajes para la Aventura:</h3>
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
                    <span>Nivel {character.level}</span>
                    <span>{character.hitPoints.current}/{character.hitPoints.max} HP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Opciones de Personalización */}
          <div style={{ marginBottom: '20px' }}>
            <h3>Personaliza tu Aventura:</h3>
            
            <div className="form-group">
              <label htmlFor="storyTheme">Tema de la Historia (opcional):</label>
              <input
                type="text"
                id="storyTheme"
                value={storyTheme}
                onChange={(e) => setStoryTheme(e.target.value)}
                placeholder="Ej: aventura en una mazmorra antigua, rescate de un pueblo, búsqueda de un tesoro..."
                disabled={loading}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white'
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="pacing">Ritmo de la Historia:</label>
              <select
                id="pacing"
                value={pacing}
                onChange={(e) => setPacing(e.target.value as 'rapido' | 'detallado')}
                disabled={loading}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white'
                }}
              >
                <option value="rapido">⚡ Rápido - Acción directa, textos concisos</option>
                <option value="detallado">📚 Detallado - Más atmósfera y descripción</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="button" 
              onClick={handleCreateStory}
              disabled={loading || selectedCharacters.length === 0}
            >
              {loading ? 'Generando...' : '🎭 Iniciar Aventura'}
            </button>
            <button 
              className="button secondary" 
              onClick={() => {
                setSelectedCharacters([]);
                setStoryTheme('');
                setPacing('rapido');
              }}
              disabled={loading}
            >
              Limpiar Todo
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderStoryList = () => (
    <div>
      <div className="card">
        <h2>📚 Historias de Aventura</h2>
        <p>Administra tus historias de aventura generadas por IA.</p>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button 
            className="button" 
            onClick={() => setCurrentView('create')}
          >
            ➕ Nueva Aventura
          </button>
          <button 
            className="button secondary" 
            onClick={loadStories}
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {stories.length === 0 ? (
        <div className="card">
          <p>Aún no hay historias. ¡Crea tu primera aventura!</p>
        </div>
      ) : (
        <div className="character-grid">
          {stories.map(story => (
            <div key={story.id} className="character-card">
              <div className="character-name">{story.title}</div>
              <div className="stat-row">
                <span>Capítulos: {story.chapterCount}</span>
                <span>{story.isActive ? '🟢 Activa' : '🔴 Terminada'}</span>
              </div>
              <div className="stat-row">
                <span>Personajes: {story.characterIds.length}</span>
                <span>Creada: {new Date(story.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button 
                  className="button" 
                  onClick={() => {
                    setSelectedStory(story);
                    setCurrentView('play');
                  }}
                >
                  {story.canContinue ? '▶️ Continuar' : '📖 Leer'}
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
              ← Volver a Historias
            </button>
          </div>

          <div className="stat-row">
            <span>Capítulo {selectedStory.currentChapterIndex + 1} de {selectedStory.chapterCount}</span>
            <span>{selectedStory.isActive ? '🟢 Activa' : '🔴 Completa'}</span>
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
              Generado en {currentChapter.metadata.generationTime}ms
            </div>
          )}
        </div>

        {/* Actions */}
        {selectedStory.canContinue && (
          <div className="card">
            <h3>¿Qué haces a continuación?</h3>
            
            {/* Pacing Control */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label htmlFor="gamePacing">Ritmo para las siguientes respuestas:</label>
              <select
                id="gamePacing"
                value={pacing}
                onChange={(e) => setPacing(e.target.value as 'rapido' | 'detallado')}
                disabled={loading}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontSize: '0.9rem'
                }}
              >
                <option value="rapido">⚡ Rápido - Respuestas concisas</option>
                <option value="detallado">📚 Detallado - Más descripción</option>
              </select>
            </div>
            
            {error && <div className="error">{error}</div>}

            {/* Interactive Dice Roller */}
            {showDiceRoller && pendingDiceRequests.length > 0 && (
              <InteractiveDiceRoller
                diceRequests={pendingDiceRequests}
                characterName={currentCharacterName}
                onAllRollsComplete={handleDiceRollsComplete}
                autoRoll={true}
              />
            )}

            {/* Old Dice Roller (fallback) */}
            {!showDiceRoller && currentChapter?.diceRequests && currentChapter.diceRequests.length > 0 && !pendingDiceResults && (
              <DiceRoller 
                diceRequests={currentChapter.diceRequests}
                onRollComplete={handleDiceRollComplete}
              />
            )}

            {/* Show Dice Results */}
            {pendingDiceResults && (
              <div className="card" style={{ marginBottom: '20px', background: 'rgba(0, 184, 148, 0.2)' }}>
                <h3>🎲 Resultados de las Tiradas</h3>
                {pendingDiceResults.map((result, index) => (
                  <div key={index} style={{ 
                    padding: '10px', 
                    marginBottom: '10px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px'
                  }}>
                    <strong>{result.description}</strong>: {result.total}
                    {result.success !== undefined && (
                      <span style={{ 
                        marginLeft: '10px',
                        color: result.success ? '#00b894' : '#ff6b6b',
                        fontWeight: 'bold'
                      }}>
                        {result.success ? '✅ Éxito' : '❌ Fallo'}
                      </span>
                    )}
                  </div>
                ))}
                <button 
                  className="button secondary" 
                  onClick={() => setPendingDiceResults(null)}
                  style={{ marginTop: '10px' }}
                >
                  Cerrar Resultados
                </button>
              </div>
            )}

            {/* AI Generated Options with Dice */}
            {currentChapter?.options && currentChapter.options.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Elige una acción:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                  {currentChapter.options.map((option, index) => {
                    // Crear StoryOption con tirada asociada
                    const storyOption: StoryOption = {
                      text: option,
                      diceRequirement: currentChapter.diceRequests?.[index] ? {
                        type: currentChapter.diceRequests[index].type,
                        ability: currentChapter.diceRequests[index].ability,
                        skill: currentChapter.diceRequests[index].skill,
                        difficulty: currentChapter.diceRequests[index].difficulty || 15,
                        description: currentChapter.diceRequests[index].description,
                        diceNotation: currentChapter.diceRequests[index].diceNotation || '1d20'
                      } : undefined
                    };

                    const characterName = characters
                      .filter(char => selectedStory?.characterIds.includes(char.id))
                      .map(char => char.name)[0] || 'Aventurero';

                    return (
                      <StoryOptionWithDice
                        key={index}
                        option={storyOption}
                        index={index}
                        characterName={characterName}
                        onOptionSelect={(optionIndex, diceResult) => {
                          const selectedOption = currentChapter.options[optionIndex];
                          if (diceResult) {
                            console.log('Opción con resultado de dados:', selectedOption, diceResult);
                          }
                          handleContinueStory(selectedOption);
                        }}
                        disabled={loading}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Action */}
            <div>
              <h4>O ingresa tu propia acción:</h4>
              <div className="form-group">
                <textarea
                  value={customAction}
                  onChange={(e) => setCustomAction(e.target.value)}
                  placeholder="Describe lo que hace tu grupo..."
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
                {loading ? 'Generando...' : '✨ Continuar con Acción Personalizada'}
              </button>
            </div>
          </div>
        )}

        {/* Story History */}
        {selectedStory.chapters.length > 1 && (
          <div className="card">
            <h3>📜 Historial de la Historia</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {selectedStory.chapters.slice(0, -1).map((chapter, index) => (
                <div key={chapter.id} style={{ 
                  marginBottom: '15px', 
                  paddingBottom: '15px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '5px' }}>
                    Capítulo {index + 1} {chapter.playerAction && `- Acción: "${chapter.playerAction}"`}
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
      {/* Header del modo historia */}
      <div className="card" style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h1 style={{ color: '#fbbf24', marginBottom: '10px' }}>
          🐉 Aventuras de Calabozos y Dragones
        </h1>
        <p style={{ opacity: 0.9 }}>
          Crea y vive aventuras épicas generadas por IA con dados 3D realistas
        </p>
        
        {/* Navegación simplificada dentro del juego */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
          <button
            className={`button ${currentView === 'list' ? '' : 'secondary'}`}
            onClick={() => setCurrentView('list')}
          >
            📚 Mis Historias
          </button>
          <button
            className={`button ${currentView === 'create' ? '' : 'secondary'}`}
            onClick={() => setCurrentView('create')}
          >
            ➕ Nueva Aventura
          </button>
        </div>
      </div>

      {renderContent()}
    </div>
  );
};