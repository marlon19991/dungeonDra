import React, { useState, useEffect } from 'react';
import './DiceAnimation.css';

interface DiceAnimationProps {
  diceType: number; // 4, 6, 8, 10, 12, 20, 100
  isRolling: boolean;
  finalValue?: number;
  modifier?: number;
  onRollComplete?: (result: number) => void;
  advantage?: boolean;
  disadvantage?: boolean;
}

export const DiceAnimation: React.FC<DiceAnimationProps> = ({
  diceType,
  isRolling,
  finalValue,
  modifier = 0,
  onRollComplete,
  advantage = false,
  disadvantage = false
}) => {
  const [currentValue, setCurrentValue] = useState<number>(1);
  const [, setRollCount] = useState(0);
  const [advantageRolls, setAdvantageRolls] = useState<number[]>([]);

  useEffect(() => {
    if (isRolling) {
      setRollCount(0);
      setAdvantageRolls([]);
      
      const rollDuration = 2000; // 2 segundos de animación
      const rollInterval = 100; // Cambiar número cada 100ms

      const interval = setInterval(() => {
        setRollCount(prev => prev + 1);
        
        if (advantage || disadvantage) {
          // Para ventaja/desventaja, mostrar dos dados
          setAdvantageRolls([
            Math.floor(Math.random() * diceType) + 1,
            Math.floor(Math.random() * diceType) + 1
          ]);
        } else {
          setCurrentValue(Math.floor(Math.random() * diceType) + 1);
        }
      }, rollInterval);

      // Después de la animación, mostrar el resultado final
      setTimeout(() => {
        clearInterval(interval);
        
        if (finalValue !== undefined) {
          if (advantage || disadvantage) {
            // Para ventaja/desventaja, generar dos valores y mostrar cuál se usa
            const roll1 = Math.floor(Math.random() * diceType) + 1;
            const roll2 = Math.floor(Math.random() * diceType) + 1;
            const chosenRoll = advantage ? Math.max(roll1, roll2) : Math.min(roll1, roll2);
            setAdvantageRolls([roll1, roll2]);
            setCurrentValue(chosenRoll);
            onRollComplete?.(chosenRoll + modifier);
          } else {
            setCurrentValue(finalValue);
            onRollComplete?.(finalValue + modifier);
          }
        }
      }, rollDuration);

      return () => clearInterval(interval);
    }
  }, [isRolling, finalValue, diceType, modifier, advantage, disadvantage, onRollComplete]);

  const getDiceShape = () => {
    switch (diceType) {
      case 4: return '🔺'; // Tetraedro
      case 6: return '⚂'; // Cubo clásico
      case 8: return '🔶'; // Octaedro
      case 10: return '🔟'; // Decaedro
      case 12: return '🔷'; // Dodecaedro
      case 20: return '🎲'; // Icosaedro
      case 100: return '💯'; // Percentil
      default: return '🎲';
    }
  };

  const getDiceColor = () => {
    if (advantage) return '#4ade80'; // Verde para ventaja
    if (disadvantage) return '#ef4444'; // Rojo para desventaja
    return '#3b82f6'; // Azul normal
  };

  const getResultColor = (value: number) => {
    if (diceType === 20) {
      if (value === 20) return '#fbbf24'; // Oro para 20 natural
      if (value === 1) return '#ef4444'; // Rojo para 1 natural
    }
    return '#374151'; // Gris normal
  };

  return (
    <div className="dice-container">
      {advantage || disadvantage ? (
        <div className="advantage-dice">
          <div className="dice-pair">
            {advantageRolls.map((roll, index) => (
              <div 
                key={index}
                className={`dice ${isRolling ? 'rolling' : ''} ${
                  !isRolling && advantage && roll === Math.max(...advantageRolls) ? 'chosen' : ''
                } ${
                  !isRolling && disadvantage && roll === Math.min(...advantageRolls) ? 'chosen' : ''
                }`}
                style={{ color: getDiceColor() }}
              >
                <div className="dice-face">
                  <span className="dice-icon">{getDiceShape()}</span>
                  <span 
                    className="dice-number"
                    style={{ color: getResultColor(roll) }}
                  >
                    {isRolling ? Math.floor(Math.random() * diceType) + 1 : roll}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {!isRolling && (
            <div className="advantage-result">
              <span className={advantage ? 'advantage-text' : 'disadvantage-text'}>
                {advantage ? 'VENTAJA' : 'DESVENTAJA'}
              </span>
              <div className="final-result">
                Resultado: {currentValue}
                {modifier !== 0 && (
                  <span className="modifier">
                    {modifier > 0 ? '+' : ''}{modifier} = {currentValue + modifier}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={`dice ${isRolling ? 'rolling' : ''}`} style={{ color: getDiceColor() }}>
          <div className="dice-face">
            <span className="dice-icon">{getDiceShape()}</span>
            <span 
              className="dice-number"
              style={{ color: getResultColor(currentValue) }}
            >
              {currentValue}
            </span>
          </div>
          {!isRolling && modifier !== 0 && (
            <div className="modifier-display">
              <span className="base-roll">🎲 {currentValue}</span>
              <span className="modifier-sign">{modifier > 0 ? '+' : ''}{modifier}</span>
              <span className="total-result">= {currentValue + modifier}</span>
            </div>
          )}
        </div>
      )}
      
      <div className="dice-info">
        <div className="dice-type">d{diceType}</div>
        {!isRolling && (
          <div className="roll-result">
            <div className="total-value" style={{ color: getResultColor(currentValue) }}>
              {currentValue + modifier}
            </div>
            {diceType === 20 && (
              <div className="nat-result">
                {currentValue === 20 && <span className="nat-20">🌟 ¡Éxito crítico!</span>}
                {currentValue === 1 && <span className="nat-1">💥 ¡Fallo crítico!</span>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiceAnimation;