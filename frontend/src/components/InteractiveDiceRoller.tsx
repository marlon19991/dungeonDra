import React, { useState, useEffect } from 'react';
import RealisticDiceAnimation from './RealisticDiceAnimation';
import DiceResultNarrator from './DiceResultNarrator';

export interface DiceRequest {
  type: 'ability' | 'attack' | 'damage' | 'saving_throw' | 'skill';
  ability?: string;
  skill?: string;
  difficulty?: number;
  description: string;
  diceNotation?: string;
}

interface InteractiveDiceRollerProps {
  diceRequests: DiceRequest[];
  characterName: string;
  onAllRollsComplete?: (results: DiceRollResult[]) => void;
  autoRoll?: boolean;
}

export interface DiceRollResult {
  request: DiceRequest;
  roll: number;
  modifier: number;
  total: number;
  success: boolean;
  criticalSuccess: boolean;
  criticalFailure: boolean;
}

export const InteractiveDiceRoller: React.FC<InteractiveDiceRollerProps> = ({
  diceRequests,
  characterName,
  onAllRollsComplete,
  autoRoll = false
}) => {
  const [currentRollIndex, setCurrentRollIndex] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [rollResults, setRollResults] = useState<DiceRollResult[]>([]);
  const [currentRoll, setCurrentRoll] = useState<DiceRollResult | null>(null);
  const [showNarration, setShowNarration] = useState(false);

  useEffect(() => {
    if (autoRoll && diceRequests.length > 0 && currentRollIndex < diceRequests.length) {
      // Auto-iniciar la siguiente tirada después de un breve delay
      const timer = setTimeout(() => {
        handleRollDice();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentRollIndex, autoRoll, diceRequests]);

  const parseDiceNotation = (notation: string) => {
    // Parsear notaciones como "1d20+3", "2d6", "1d20", etc.
    const match = notation.match(/(\d*)d(\d+)([+-]\d+)?/i);
    if (!match) return { count: 1, sides: 20, modifier: 0 };
    
    const count = parseInt(match[1]) || 1;
    const sides = parseInt(match[2]);
    const modifier = match[3] ? parseInt(match[3]) : 0;
    
    return { count, sides, modifier };
  };

  const rollDice = (sides: number, count: number = 1): number[] => {
    const rolls = [];
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * sides) + 1);
    }
    return rolls;
  };

  const handleRollDice = () => {
    if (currentRollIndex >= diceRequests.length) return;
    
    const request = diceRequests[currentRollIndex];
    const { count, sides, modifier } = parseDiceNotation(request.diceNotation || '1d20');
    
    setIsRolling(true);
    
    // Simular el tiempo de animación de dados
    setTimeout(() => {
      const rolls = rollDice(sides, count);
      const rollSum = rolls.reduce((sum, roll) => sum + roll, 0);
      const total = rollSum + modifier;
      const difficulty = request.difficulty || 15;
      
      // Determinar éxito/fallo
      const naturalRoll = sides === 20 ? rolls[0] : 0; // Solo d20 tiene críticos naturales
      const criticalSuccess = naturalRoll === 20;
      const criticalFailure = naturalRoll === 1;
      const success = criticalSuccess || (!criticalFailure && total >= difficulty);
      
      const result: DiceRollResult = {
        request,
        roll: rollSum,
        modifier,
        total,
        success,
        criticalSuccess,
        criticalFailure
      };
      
      setCurrentRoll(result);
      setRollResults(prev => [...prev, result]);
      setIsRolling(false);
      setShowNarration(true);
    }, 2500); // Tiempo de animación de dados + delay
  };

  const handleNarrationComplete = () => {
    setShowNarration(false);
    setCurrentRoll(null);
    
    const nextIndex = currentRollIndex + 1;
    setCurrentRollIndex(nextIndex);
    
    // Si hemos terminado todas las tiradas
    if (nextIndex >= diceRequests.length) {
      onAllRollsComplete?.(rollResults);
    }
  };

  const handleManualRoll = () => {
    if (!isRolling && currentRollIndex < diceRequests.length) {
      handleRollDice();
    }
  };

  if (diceRequests.length === 0) {
    return null;
  }

  const currentRequest = diceRequests[currentRollIndex];
  const { count, sides, modifier } = currentRequest ? parseDiceNotation(currentRequest.diceNotation || '1d20') : { count: 1, sides: 20, modifier: 0 };

  return (
    <div className="interactive-dice-roller" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      padding: '20px',
      backgroundColor: '#0f172a',
      borderRadius: '12px',
      margin: '20px 0'
    }}>
      {/* Header */}
      <div className="roller-header" style={{
        textAlign: 'center',
        color: '#f1f5f9'
      }}>
        <h3 style={{ margin: 0, marginBottom: '8px', color: '#fbbf24' }}>
          🎲 Tiradas de Dados Requeridas
        </h3>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
          {currentRollIndex + 1} de {diceRequests.length} tiradas
        </p>
      </div>

      {/* Current Request Info */}
      {currentRequest && (
        <div className="current-request" style={{
          textAlign: 'center',
          padding: '12px 16px',
          backgroundColor: '#1e293b',
          borderRadius: '8px',
          border: '1px solid #334155'
        }}>
          <div style={{ color: '#f1f5f9', fontWeight: 'bold', marginBottom: '4px' }}>
            {currentRequest.description}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '12px' }}>
            {currentRequest.diceNotation || '1d20'} • DC {currentRequest.difficulty || 15}
          </div>
        </div>
      )}

      {/* Dice Animation */}
      {currentRequest && (
        <RealisticDiceAnimation
          diceType={sides}
          isRolling={isRolling}
          finalValue={currentRoll?.roll}
          modifier={modifier}
          count={count}
          onRollComplete={() => {}}
        />
      )}

      {/* Roll Button */}
      {!autoRoll && currentRollIndex < diceRequests.length && (
        <button
          onClick={handleManualRoll}
          disabled={isRolling}
          style={{
            padding: '12px 24px',
            backgroundColor: isRolling ? '#374151' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isRolling ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          {isRolling ? '🎲 Rodando...' : '🎲 Tirar Dados'}
        </button>
      )}

      {/* Narration */}
      {showNarration && currentRoll && (
        <DiceResultNarrator
          roll={{
            type: currentRoll.request.type,
            ability: currentRoll.request.ability,
            skill: currentRoll.request.skill,
            difficulty: currentRoll.request.difficulty || 15,
            description: currentRoll.request.description,
            diceNotation: currentRoll.request.diceNotation || '1d20',
            result: currentRoll.total,
            success: currentRoll.success,
            criticalSuccess: currentRoll.criticalSuccess,
            criticalFailure: currentRoll.criticalFailure
          }}
          characterName={characterName}
          onNarrationComplete={handleNarrationComplete}
        />
      )}

      {/* Progress Indicator */}
      <div className="progress-indicator" style={{
        display: 'flex',
        gap: '4px',
        alignItems: 'center'
      }}>
        {diceRequests.map((_, index) => (
          <div
            key={index}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: index < currentRollIndex ? '#10b981' : 
                             index === currentRollIndex ? '#fbbf24' : '#374151',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>

      {/* Results Summary */}
      {rollResults.length > 0 && (
        <div className="results-summary" style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#1e293b',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '400px'
        }}>
          <div style={{ color: '#fbbf24', fontWeight: 'bold', marginBottom: '8px' }}>
            📊 Resumen de Tiradas
          </div>
          {rollResults.map((result, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '4px 0',
              color: '#f1f5f9',
              fontSize: '14px',
              borderBottom: index < rollResults.length - 1 ? '1px solid #374151' : 'none'
            }}>
              <span>{result.request.description}</span>
              <span style={{
                color: result.success ? '#10b981' : '#ef4444',
                fontWeight: 'bold'
              }}>
                {result.total} {result.success ? '✅' : '❌'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InteractiveDiceRoller;