import React, { useState, useEffect, useRef } from 'react';
import './RealisticDiceAnimation.css';

interface RealisticDiceAnimationProps {
  diceType: number; // 4, 6, 8, 10, 12, 20, 100
  isRolling: boolean;
  finalValue?: number;
  modifier?: number;
  onRollComplete?: (result: number) => void;
  advantage?: boolean;
  disadvantage?: boolean;
  count?: number; // Número de dados a tirar
}

interface DicePosition {
  x: number;
  y: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
}

export const RealisticDiceAnimation: React.FC<RealisticDiceAnimationProps> = ({
  diceType,
  isRolling,
  finalValue,
  modifier = 0,
  onRollComplete,
  advantage = false,
  disadvantage = false,
  count = 1
}) => {
  const [dicePositions, setDicePositions] = useState<DicePosition[]>([]);
  const [currentValues, setCurrentValues] = useState<number[]>([]);
  const [finalValues, setFinalValues] = useState<number[]>([]);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'throwing' | 'rolling' | 'settling' | 'complete'>('idle');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const diceCount = advantage || disadvantage ? 2 : count;

  useEffect(() => {
    // Inicializar posiciones de dados
    const initialPositions: DicePosition[] = [];
    const initialValues: number[] = [];
    
    for (let i = 0; i < diceCount; i++) {
      initialPositions.push({
        x: i * 120 - (diceCount - 1) * 60, // Centrar dados
        y: 0,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        scale: 1
      });
      initialValues.push(1);
    }
    
    setDicePositions(initialPositions);
    setCurrentValues(initialValues);
  }, [diceCount]);

  useEffect(() => {
    if (isRolling && animationPhase === 'idle') {
      startDiceAnimation();
    }
  }, [isRolling, animationPhase]);

  const startDiceAnimation = () => {
    setAnimationPhase('throwing');
    
    // Fase 1: Lanzamiento (dados salen volando)
    setTimeout(() => {
      setAnimationPhase('rolling');
      startRollingPhase();
    }, 500);
  };

  const startRollingPhase = () => {
    // Fase 2: Rodando con física realista
    let rollTime = 0;
    const maxRollTime = 3000; // 3 segundos de rodado
    
    intervalRef.current = setInterval(() => {
      rollTime += 100;
      
      setDicePositions(prev => prev.map((pos, index) => ({
        x: pos.x + (Math.random() - 0.5) * 20,
        y: Math.sin(rollTime * 0.01 + index) * 30 + Math.random() * 10,
        rotationX: pos.rotationX + (Math.random() * 90 + 45),
        rotationY: pos.rotationY + (Math.random() * 90 + 45),
        rotationZ: pos.rotationZ + (Math.random() * 90 + 45),
        scale: 0.9 + Math.random() * 0.2
      })));
      
      setCurrentValues(prev => prev.map(() => Math.floor(Math.random() * diceType) + 1));
      
      if (rollTime >= maxRollTime) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setAnimationPhase('settling');
        startSettlingPhase();
      }
    }, 100);
  };

  const startSettlingPhase = () => {
    // Fase 3: Los dados se asientan
    const settleDuration = 1000;
    let settleTime = 0;
    
    // Calcular valores finales
    const finals: number[] = [];
    for (let i = 0; i < diceCount; i++) {
      if (finalValue !== undefined && diceCount === 1) {
        finals.push(finalValue);
      } else {
        finals.push(Math.floor(Math.random() * diceType) + 1);
      }
    }
    
    if (advantage && finals.length === 2) {
      const maxRoll = Math.max(...finals);
      finals.forEach((_, index) => {
        if (finals[index] !== maxRoll) {
          finals[index] = Math.floor(Math.random() * (maxRoll - 1)) + 1;
        }
      });
    } else if (disadvantage && finals.length === 2) {
      const minRoll = Math.min(...finals);
      finals.forEach((_, index) => {
        if (finals[index] !== minRoll) {
          finals[index] = Math.floor(Math.random() * (diceType - minRoll)) + minRoll + 1;
        }
      });
    }
    
    setFinalValues(finals);
    
    const settleInterval = setInterval(() => {
      settleTime += 100;
      const progress = settleTime / settleDuration;
      
      setDicePositions(prev => prev.map((pos, index) => ({
        x: pos.x * (1 - progress) + (index * 120 - (diceCount - 1) * 60) * progress,
        y: pos.y * (1 - progress),
        rotationX: pos.rotationX + (Math.random() - 0.5) * 10 * (1 - progress),
        rotationY: pos.rotationY + (Math.random() - 0.5) * 10 * (1 - progress),
        rotationZ: pos.rotationZ + (Math.random() - 0.5) * 10 * (1 - progress),
        scale: pos.scale * (1 - progress) + 1 * progress
      })));
      
      if (settleTime >= settleDuration) {
        clearInterval(settleInterval);
        setAnimationPhase('complete');
        setCurrentValues(finals);
        
        // Notificar resultado
        const total = finals.reduce((sum, val) => sum + val, 0);
        onRollComplete?.(total + modifier);
      }
    }, 100);
  };

  const getDiceGeometry = (value: number) => {
    switch (diceType) {
      case 4:
        return renderD4(value);
      case 6:
        return renderD6(value);
      case 8:
        return renderD8(value);
      case 10:
        return renderD10(value);
      case 12:
        return renderD12(value);
      case 20:
        return renderD20(value);
      case 100:
        return renderD100(value);
      default:
        return renderD6(value);
    }
  };

  const renderD6 = (value: number) => (
    <div className="dice-cube">
      <div className="face front">{getDotPattern(value)}</div>
      <div className="face back">{getDotPattern(7 - value)}</div>
      <div className="face right">{getDotPattern((value % 6) + 1)}</div>
      <div className="face left">{getDotPattern(((value + 1) % 6) + 1)}</div>
      <div className="face top">{getDotPattern(((value + 2) % 6) + 1)}</div>
      <div className="face bottom">{getDotPattern(((value + 3) % 6) + 1)}</div>
    </div>
  );

  const renderD4 = (value: number) => (
    <div className="dice-tetrahedron">
      <div className="face">{value}</div>
      <div className="face">{((value % 4) + 1)}</div>
      <div className="face">{(((value + 1) % 4) + 1)}</div>
      <div className="face">{(((value + 2) % 4) + 1)}</div>
    </div>
  );

  const renderD8 = (value: number) => (
    <div className="dice-octahedron">
      <div className="face">{value}</div>
    </div>
  );

  const renderD10 = (value: number) => (
    <div className="dice-decahedron">
      <div className="face">{value === 10 ? '0' : value}</div>
    </div>
  );

  const renderD12 = (value: number) => (
    <div className="dice-dodecahedron">
      <div className="face">{value}</div>
    </div>
  );

  const renderD20 = (value: number) => (
    <div className="dice-icosahedron">
      <div className="face">{value}</div>
    </div>
  );

  const renderD100 = (value: number) => (
    <div className="dice-percentile">
      <div className="face">{value}</div>
    </div>
  );

  const getDotPattern = (number: number) => {
    const dots = [];
    const patterns = {
      1: [4], // centro
      2: [0, 8], // diagonal
      3: [0, 4, 8], // diagonal + centro
      4: [0, 2, 6, 8], // esquinas
      5: [0, 2, 4, 6, 8], // esquinas + centro
      6: [0, 2, 3, 5, 6, 8] // dos columnas
    };

    const pattern = patterns[number as keyof typeof patterns] || [4];
    
    for (let i = 0; i < 9; i++) {
      dots.push(
        <span 
          key={i} 
          className={`dot ${pattern.includes(i) ? 'active' : ''}`}
        />
      );
    }
    
    return <div className="dot-pattern">{dots}</div>;
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
    return '#f1f5f9'; // Blanco normal
  };

  return (
    <div className="realistic-dice-container">
      <div className="dice-table">
        <div className="dice-area">
          {dicePositions.map((position, index) => (
            <div
              key={index}
              className={`dice-wrapper ${animationPhase}`}
              style={{
                transform: `
                  translate3d(${position.x}px, ${position.y}px, 0)
                  rotateX(${position.rotationX}deg)
                  rotateY(${position.rotationY}deg)
                  rotateZ(${position.rotationZ}deg)
                  scale(${position.scale})
                `,
                color: getDiceColor(),
                transition: animationPhase === 'settling' ? 'all 0.3s ease-out' : 'none'
              }}
            >
              <div className="dice-3d">
                {getDiceGeometry(animationPhase === 'complete' ? finalValues[index] || currentValues[index] : currentValues[index])}
              </div>
              
              {animationPhase === 'complete' && (
                <div className="dice-result-overlay">
                  <span 
                    className="result-number"
                    style={{ color: getResultColor(finalValues[index] || currentValues[index]) }}
                  >
                    {finalValues[index] || currentValues[index]}
                  </span>
                  {advantage && index === 0 && (
                    <span className="advantage-label">VENTAJA</span>
                  )}
                  {disadvantage && index === 0 && (
                    <span className="disadvantage-label">DESVENTAJA</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {animationPhase === 'complete' && (
          <div className="final-result">
            <div className="total-calculation">
              {finalValues.length > 1 ? (
                <span>
                  {finalValues.join(' + ')} 
                  {modifier !== 0 && ` ${modifier >= 0 ? '+' : ''}${modifier}`} = {' '}
                  <strong>{finalValues.reduce((sum, val) => sum + val, 0) + modifier}</strong>
                </span>
              ) : (
                <span>
                  {finalValues[0]}
                  {modifier !== 0 && ` ${modifier >= 0 ? '+' : ''}${modifier}`} = {' '}
                  <strong>{finalValues[0] + modifier}</strong>
                </span>
              )}
            </div>
            
            {diceType === 20 && finalValues.some(val => val === 20) && (
              <div className="critical-success">🌟 ¡ÉXITO CRÍTICO! 🌟</div>
            )}
            {diceType === 20 && finalValues.some(val => val === 1) && (
              <div className="critical-failure">💥 ¡FALLO CRÍTICO! 💥</div>
            )}
          </div>
        )}
      </div>
      
      <div className="dice-info">
        <div className="dice-type-label">
          {diceCount > 1 ? `${diceCount}d${diceType}` : `d${diceType}`}
          {modifier !== 0 && ` ${modifier >= 0 ? '+' : ''}${modifier}`}
        </div>
        
        {animationPhase !== 'idle' && animationPhase !== 'complete' && (
          <div className="rolling-indicator">
            <span className="rolling-dots">🎲 Rodando</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealisticDiceAnimation;