import React, { useState } from 'react';
import { CharacterCreation } from './pages/CharacterCreation';
import { CharacterList } from './pages/CharacterList';
import { CombatSystem } from './pages/CombatSystem';
import { StoryMode } from './pages/StoryMode';
import './styles/App.css';

type ActiveTab = 'list' | 'create' | 'combat' | 'story';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('list');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCharacterCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('list');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'create':
        return <CharacterCreation onCharacterCreated={handleCharacterCreated} />;
      case 'combat':
        return <CombatSystem />;
      case 'story':
        return <StoryMode />;
      case 'list':
      default:
        return <CharacterList refreshTrigger={refreshTrigger} />;
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🐉 Calabozos y Dragones</h1>
        <p>Interfaz de Juego con Arquitectura Limpia</p>
      </header>

      <nav className="navigation">
        <button
          className={`nav-button ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          📋 Lista de Personajes
        </button>
        <button
          className={`nav-button ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          ➕ Crear Personaje
        </button>
        <button
          className={`nav-button ${activeTab === 'combat' ? 'active' : ''}`}
          onClick={() => setActiveTab('combat')}
        >
          ⚔️ Sistema de Combate
        </button>
        <button
          className={`nav-button ${activeTab === 'story' ? 'active' : ''}`}
          onClick={() => setActiveTab('story')}
        >
          📖 Historias IA
        </button>
      </nav>

      <main>
        {renderContent()}
      </main>

      <footer style={{ 
        textAlign: 'center', 
        marginTop: '40px', 
        padding: '20px',
        opacity: 0.7,
        fontSize: '0.9rem'
      }}>
        <p>Construido con Arquitectura Limpia y Principios SOLID</p>
        <p>TypeScript • React • Express • Node.js</p>
      </footer>
    </div>
  );
};

export default App;