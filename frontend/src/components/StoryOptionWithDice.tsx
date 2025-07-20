import React, { useState } from 'react';
import DiceAnimation from './DiceAnimation';
import RealisticDiceAnimation from './RealisticDiceAnimation';
import DiceResultNarrator from './DiceResultNarrator';

export interface StoryOption {
  text: string;
  diceRequirement?: {
    type: 'ability' | 'attack' | 'damage' | 'saving_throw' | 'skill';
    ability?: string;
    skill?: string;
    difficulty: number;
    description: string;
    diceNotation: string;
  };
}

interface StoryOptionWithDiceProps {
  option: StoryOption;
  index: number;
  characterName: string;
  onOptionSelect: (optionIndex: number, diceResult?: DiceRollResult) => void;
  disabled?: boolean;
}

export interface DiceRollResult {
  roll: number;
  modifier: number;
  total: number;
  success: boolean;
  criticalSuccess: boolean;
  criticalFailure: boolean;
}

export const StoryOptionWithDice: React.FC<StoryOptionWithDiceProps> = ({
  option,
  index,
  characterName,
  onOptionSelect,
  disabled = false
}) => {
  const [showDiceRoll, setShowDiceRoll] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<DiceRollResult | null>(null);
  const [showNarration, setShowNarration] = useState(false);

  const parseDiceNotation = (notation: string) => {
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

  const handleOptionClick = () => {
    if (disabled) return;
    
    if (!option.diceRequirement) {
      // Opción sin dados, seleccionar directamente
      onOptionSelect(index);
      return;
    }

    // Opción con dados, mostrar animación
    setShowDiceRoll(true);
    setIsRolling(true);
  };

  const handleDiceRollComplete = () => {
    if (!option.diceRequirement) return;

    const { count, sides, modifier } = parseDiceNotation(option.diceRequirement.diceNotation);
    const rolls = rollDice(sides, count);
    const rollSum = rolls.reduce((sum, roll) => sum + roll, 0);
    const total = rollSum + modifier;
    const difficulty = option.diceRequirement.difficulty;
    
    // Determinar éxito/fallo
    const naturalRoll = sides === 20 ? rolls[0] : 0;
    const criticalSuccess = naturalRoll === 20;
    const criticalFailure = naturalRoll === 1;
    const success = criticalSuccess || (!criticalFailure && total >= difficulty);
    
    const result: DiceRollResult = {
      roll: rollSum,
      modifier,
      total,
      success,
      criticalSuccess,
      criticalFailure
    };
    
    setDiceResult(result);
    setIsRolling(false);
    setShowNarration(true);
  };

  const handleNarrationComplete = () => {
    setShowNarration(false);
    // Enviar la opción seleccionada junto con el resultado del dado
    onOptionSelect(index, diceResult || undefined);
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 10) return '#10b981'; // Fácil - Verde
    if (difficulty <= 15) return '#fbbf24'; // Medio - Amarillo
    if (difficulty <= 20) return '#f97316'; // Difícil - Naranja
    return '#ef4444'; // Muy difícil - Rojo
  };

  const getDifficultyText = (difficulty: number) => {
    if (difficulty <= 10) return 'Fácil';
    if (difficulty <= 15) return 'Medio';
    if (difficulty <= 20) return 'Difícil';
    return 'Muy difícil';
  };

  if (showDiceRoll) {
    const { count, sides, modifier } = parseDiceNotation(option.diceRequirement?.diceNotation || '1d20');
    
    return (
      <div className="story-option-dice-container" style={{
        backgroundColor: '#1e293b',
        border: '2px solid #3b82f6',
        borderRadius: '12px',
        padding: '20px',
        margin: '10px 0',
        textAlign: 'center'
      }}>
        <div style={{ 
          color: '#f1f5f9', 
          marginBottom: '16px',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          {option.text}
        </div>

        <div style={{
          color: '#94a3b8',
          fontSize: '14px',
          marginBottom: '20px'
        }}>
          {option.diceRequirement?.description} • DC {option.diceRequirement?.difficulty}
        </div>

        <RealisticDiceAnimation
          diceType={sides}
          isRolling={isRolling}
          finalValue={diceResult?.roll}
          modifier={modifier}
          onRollComplete={handleDiceRollComplete}
          count={count}
        />

        {showNarration && diceResult && option.diceRequirement && (
          <DiceResultNarrator
            roll={{
              type: option.diceRequirement.type,
              ability: option.diceRequirement.ability,
              skill: option.diceRequirement.skill,
              difficulty: option.diceRequirement.difficulty,
              description: option.diceRequirement.description,
              diceNotation: option.diceRequirement.diceNotation,
              result: diceResult.total,
              success: diceResult.success,
              criticalSuccess: diceResult.criticalSuccess,
              criticalFailure: diceResult.criticalFailure
            }}
            characterName={characterName}
            onNarrationComplete={handleNarrationComplete}
          />
        )}
      </div>
    );
  }

  return (
    <button
      className="story-option-button"
      onClick={handleOptionClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '16px',
        margin: '8px 0',
        backgroundColor: disabled ? '#374151' : '#1e293b',
        border: option.diceRequirement ? '2px solid #3b82f6' : '2px solid #6b7280',
        borderRadius: '8px',
        color: '#f1f5f9',
        fontSize: '14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = '#334155';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = '#1e293b';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {index + 1}. {option.text}
          </div>
          
          {option.diceRequirement && (
            <div style={{ 
              fontSize: '12px', 
              color: '#94a3b8',
              display: 'flex',
              gap: '12px',
              marginTop: '8px'
            }}>
              <span>🎲 {option.diceRequirement.diceNotation}</span>
              <span>📋 {option.diceRequirement.description}</span>
              <span style={{ color: getDifficultyColor(option.diceRequirement.difficulty) }}>
                🎯 DC {option.diceRequirement.difficulty} ({getDifficultyText(option.diceRequirement.difficulty)})
              </span>
            </div>
          )}
        </div>

        {option.diceRequirement && (
          <div style={{
            marginLeft: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px'
          }}>
            <div style={{ fontSize: '20px' }}>🎲</div>
            <div style={{ 
              fontSize: '10px', 
              color: '#94a3b8',
              textAlign: 'center'
            }}>
              Click para<br/>tirar dados
            </div>
          </div>
        )}
      </div>

      {option.diceRequirement && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            backgroundColor: getDifficultyColor(option.diceRequirement.difficulty),
            borderRadius: '8px 0 0 8px'
          }}
        />
      )}
    </button>
  );
};

export default StoryOptionWithDice;