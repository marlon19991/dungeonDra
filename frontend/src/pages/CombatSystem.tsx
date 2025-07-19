import React, { useState, useEffect } from 'react';
import { Character, AttackResult } from '../types/Character';
import { CharacterCard } from '../components/CharacterCard';
import { apiService } from '../services/api';

export const CombatSystem: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedAttacker, setSelectedAttacker] = useState<Character | null>(null);
  const [attackResult, setAttackResult] = useState<AttackResult | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadCharacters();
  }, []);

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

  const refreshCharacter = async (characterId: string) => {
    try {
      const updatedCharacter = await apiService.getCharacter(characterId);
      setCharacters(prev => 
        prev.map(char => char.id === characterId ? updatedCharacter : char)
      );
    } catch (err) {
      console.error('Failed to refresh character:', err);
    }
  };

  const addToCombatLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setCombatLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const handleAttack = async (targetId: string) => {
    if (!selectedAttacker) return;

    setActionLoading(true);
    try {
      const result = await apiService.performAttack(selectedAttacker.id, targetId);
      setAttackResult(result);

      const target = characters.find(c => c.id === targetId);
      const attackerName = selectedAttacker.name;
      const targetName = target?.name || 'Unknown';

      if (result.success) {
        addToCombatLog(
          `${attackerName} attacks ${targetName}! Roll: ${result.attackRoll} vs AC ${result.targetAc}. ` +
          `${result.criticalHit ? 'CRITICAL HIT! ' : ''}Damage: ${result.damage}`
        );
      } else {
        addToCombatLog(
          `${attackerName} attacks ${targetName} but misses! Roll: ${result.attackRoll} vs AC ${result.targetAc}`
        );
      }

      await refreshCharacter(targetId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en el ataque');
    } finally {
      setActionLoading(false);
    }
  };

  const handleHeal = async (characterId: string) => {
    const healAmount = parseInt(prompt('Ingresa la cantidad de curación:') || '0');
    if (healAmount <= 0) return;

    setActionLoading(true);
    try {
      await apiService.healCharacter(characterId, healAmount);
      
      const character = characters.find(c => c.id === characterId);
      addToCombatLog(`${character?.name || 'Personaje'} curado por ${healAmount} HP!`);
      
      await refreshCharacter(characterId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en la curación');
    } finally {
      setActionLoading(false);
    }
  };

  const handleInitiative = async (characterId: string) => {
    setActionLoading(true);
    try {
      const result = await apiService.rollInitiative(characterId);
      
      const character = characters.find(c => c.id === characterId);
      addToCombatLog(`${character?.name || 'Personaje'} tira iniciativa: ${result.initiative}`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en la tirada de iniciativa');
    } finally {
      setActionLoading(false);
    }
  };

  const aliveCharacters = characters.filter(c => c.isAlive);

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

  if (aliveCharacters.length === 0) {
    return (
      <div className="card">
        <h2>No Hay Personajes Vivos</h2>
        <p>¡Todos los personajes están muertos! Crea nuevos personajes para comenzar el combate.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <h2>⚔️ Sistema de Combate</h2>
        <p>
          {selectedAttacker 
            ? `${selectedAttacker.name} está listo para atacar! Selecciona un objetivo.`
            : 'Selecciona un atacante para comenzar el combate.'
          }
        </p>
        
        {selectedAttacker && (
          <div style={{ marginTop: '15px' }}>
            <button 
              className="button secondary" 
              onClick={() => {
                setSelectedAttacker(null);
                setAttackResult(null);
              }}
            >
              Limpiar Selección
            </button>
          </div>
        )}
      </div>

      {attackResult && (
        <div className="card">
          <h3>Resultado del Ataque</h3>
          <div className="attack-result">
            <div className="stat-row">
              <span>Tirada de Ataque:</span>
              <span>{attackResult.attackRoll}</span>
            </div>
            <div className="stat-row">
              <span>CA del Objetivo:</span>
              <span>{attackResult.targetAc}</span>
            </div>
            <div className="stat-row">
              <span>Impacto:</span>
              <span style={{ color: attackResult.success ? '#00b894' : '#ff6b6b' }}>
                {attackResult.success ? 'SÍ' : 'NO'}
              </span>
            </div>
            {attackResult.success && (
              <>
                <div className="stat-row">
                  <span>Daño:</span>
                  <span>{attackResult.damage}</span>
                </div>
                <div className="stat-row">
                  <span>Golpe Crítico:</span>
                  <span style={{ color: attackResult.criticalHit ? '#ffd700' : '#ffffff' }}>
                    {attackResult.criticalHit ? 'SÍ' : 'NO'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <h3>Participantes del Combate</h3>
        <div className="character-grid">
          {aliveCharacters.map(character => (
            <CharacterCard
              key={character.id}
              character={character}
              showCombatActions={true}
              onSelect={(char) => {
                if (selectedAttacker?.id === char.id) {
                  setSelectedAttacker(null);
                } else {
                  setSelectedAttacker(char);
                }
              }}
              onAttack={(targetId) => {
                if (selectedAttacker && selectedAttacker.id !== targetId) {
                  handleAttack(targetId);
                }
              }}
              onHeal={handleHeal}
              onInitiative={handleInitiative}
            />
          ))}
        </div>

        {selectedAttacker && (
          <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
            <strong>Atacante Seleccionado: {selectedAttacker.name}</strong>
            <p>Haz clic en otro personaje para atacarlo, o usa los botones de combate para otras acciones.</p>
          </div>
        )}
      </div>

      {combatLog.length > 0 && (
        <div className="card">
          <h3>Registro de Combate</h3>
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.3)', 
            padding: '15px', 
            borderRadius: '8px', 
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {combatLog.map((entry, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                {entry}
              </div>
            ))}
          </div>
          <button 
            className="button secondary" 
            onClick={() => setCombatLog([])}
            style={{ marginTop: '10px' }}
          >
            Limpiar Registro
          </button>
        </div>
      )}

      {actionLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card">
            <div className="loading">Procesando acción...</div>
          </div>
        </div>
      )}
    </div>
  );
};