import React, { useState, useEffect, Suspense, lazy } from 'react';
import './styles/App.css';
import { Character } from './types/Character';
import { apiService } from './services/api';

// Lazy load pages for code splitting  
const CharacterCreation = lazy(() => import('./pages/CharacterCreation').then(module => ({ default: module.CharacterCreation })));
const StoryMode = lazy(() => import('./pages/StoryMode').then(module => ({ default: module.StoryMode })));

type GameFlow = 'welcome' | 'needCharacters' | 'playing';

const App: React.FC = () => {
  const [gameFlow, setGameFlow] = useState<GameFlow>('welcome');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      const charactersData = await apiService.getCharacters();
      const aliveCharacters = charactersData.filter(char => char.isAlive);
      setCharacters(aliveCharacters);
      
      // Determinar flujo automáticamente
      if (aliveCharacters.length === 0) {
        setGameFlow('needCharacters');
      } else {
        setGameFlow('playing');
      }
    } catch (error) {
      console.error('Error loading characters:', error);
      setGameFlow('needCharacters');
    } finally {
      setLoading(false);
    }
  };

  const handleCharacterCreated = () => {
    loadCharacters(); // Recargar y evaluar flujo
  };

  const handleStartGame = () => {
    if (characters.length === 0) {
      setGameFlow('needCharacters');
    } else {
      setGameFlow('playing');
    }
  };

  const renderWelcome = () => (
    <div className="welcome-screen">
      <div className="card" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>🐉</h1>
        <h2 style={{ color: '#fbbf24', marginBottom: '20px' }}>
          ¡Bienvenido a Calabozos y Dragones!
        </h2>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '30px' }}>
          Embárcate en aventuras épicas generadas por IA. Crea personajes únicos, 
          toma decisiones importantes y deja que los dados decidan tu destino.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
          <button 
            className="button" 
            onClick={handleStartGame}
            style={{ 
              fontSize: '1.2rem', 
              padding: '15px 30px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              border: 'none',
              borderRadius: '10px',
              minWidth: '200px'
            }}
          >
            🎭 ¡Jugar D&D!
          </button>
          
          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            {characters.length > 0 
              ? `Tienes ${characters.length} personaje${characters.length > 1 ? 's' : ''} listo${characters.length > 1 ? 's' : ''} para la aventura`
              : 'Te ayudaremos a crear tu primer personaje'
            }
          </p>
        </div>
      </div>
    </div>
  );

  const renderNeedCharacters = () => (
    <div className="need-characters-screen">
      <div className="card" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 30px' }}>
        <h2 style={{ color: '#fbbf24', marginBottom: '15px' }}>
          🧙‍♂️ Primero, necesitas un héroe
        </h2>
        <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
          Para vivir grandes aventuras, necesitas crear al menos un personaje. 
          ¡Elige tu clase, atributos y prepárate para la gloria!
        </p>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            className="button"
            onClick={() => setGameFlow('playing')}
            disabled={characters.length === 0}
            style={{ opacity: characters.length === 0 ? 0.5 : 1 }}
          >
            🎭 Continuar al Juego
          </button>
          <button 
            className="button secondary"
            onClick={() => setGameFlow('welcome')}
          >
            ← Volver al Inicio
          </button>
        </div>
      </div>
      
      <CharacterCreation onCharacterCreated={handleCharacterCreated} />
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <h2 style={{ color: '#fbbf24' }}>🎲 Preparando la aventura...</h2>
          <p>Cargando personajes y configuración del juego</p>
        </div>
      );
    }

    switch (gameFlow) {
      case 'welcome':
        return renderWelcome();
      case 'needCharacters':
        return renderNeedCharacters();
      case 'playing':
        return <StoryMode />;
      default:
        return renderWelcome();
    }
  };

  return (
    <div className="app">
      {/* Solo mostrar header en pantalla de bienvenida */}
      {gameFlow === 'welcome' && (
        <header className="header">
          <h1>🐉 Calabozos y Dragones</h1>
          <p>Aventuras Épicas Generadas por IA</p>
        </header>
      )}

      {/* Navigation solo aparece cuando estás jugando */}
      {gameFlow === 'playing' && (
        <nav className="navigation">
          <button
            className="nav-button active"
            onClick={() => setGameFlow('welcome')}
          >
            🏠 Inicio
          </button>
          <button
            className="nav-button"
            onClick={() => setGameFlow('needCharacters')}
          >
            🧙‍♂️ Gestionar Personajes ({characters.length})
          </button>
        </nav>
      )}

      <main>
        <Suspense fallback={
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: 'var(--color-text-secondary)'
          }}>
            🎲 Cargando aventura...
          </div>
        }>
          {renderContent()}
        </Suspense>
      </main>

      {/* Footer solo en pantalla de bienvenida */}
      {gameFlow === 'welcome' && (
        <footer style={{ 
          textAlign: 'center', 
          marginTop: '40px', 
          padding: '20px',
          opacity: 0.7,
          fontSize: '0.9rem'
        }}>
          <p>🎲 Construido para aventureros épicos</p>
          <p>TypeScript • React • IA • Dados 3D</p>
        </footer>
      )}
    </div>
  );
};

export default App;