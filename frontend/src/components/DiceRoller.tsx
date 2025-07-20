import React, { useState } from 'react';
import { DiceRequest, DiceResult } from '../types/Story';

interface DiceRollerProps {
  diceRequests: DiceRequest[];
  onRollComplete: (results: DiceResult[]) => void;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({ diceRequests, onRollComplete }) => {
  const [results, setResults] = useState<DiceResult[]>([]);
  const [rolling, setRolling] = useState(false);

  const rollDice = (notation: string): { roll: number; modifier: number; total: number } => {
    // Parse dice notation like "1d20+3" or "2d6"
    const match = notation.match(/^(\d*)d(\d+)([+-]\d+)?$/i);
    if (!match) {
      return { roll: 1, modifier: 0, total: 1 };
    }

    const count = match[1] ? parseInt(match[1]) : 1;
    const sides = parseInt(match[2]);
    const modifier = match[3] ? parseInt(match[3]) : 0;

    let totalRoll = 0;
    for (let i = 0; i < count; i++) {
      totalRoll += Math.floor(Math.random() * sides) + 1;
    }

    const total = totalRoll + modifier;
    return { roll: totalRoll, modifier, total };
  };

  const handleRollAll = async () => {
    setRolling(true);
    const newResults: DiceResult[] = [];

    for (const request of diceRequests) {
      const diceResult = rollDice(request.diceNotation || '1d20');
      const success = request.difficulty ? diceResult.total >= request.difficulty : undefined;

      newResults.push({
        roll: diceResult.roll,
        modifier: diceResult.modifier,
        total: diceResult.total,
        success,
        description: request.description
      });

      // Add delay for dramatic effect
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setResults(newResults);
    setRolling(false);
    onRollComplete(newResults);
  };

  const getResultColor = (result: DiceResult) => {
    if (result.success === undefined) return '#ffffff';
    return result.success ? '#00b894' : '#ff6b6b';
  };

  const getSuccessText = (result: DiceResult) => {
    if (result.success === undefined) return '';
    return result.success ? '✅ Éxito' : '❌ Fallo';
  };

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <h3>🎲 Tiradas Requeridas</h3>
      
      {diceRequests.map((request, index) => (
        <div key={index} style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '10px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{request.description}</strong>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                {request.diceNotation} 
                {request.difficulty && ` (DC ${request.difficulty})`}
              </div>
            </div>
            
            {results[index] && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold',
                  color: getResultColor(results[index])
                }}>
                  {results[index].total}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                  {results[index].roll}
                  {results[index].modifier ? ` ${results[index].modifier! >= 0 ? '+' : ''}${results[index].modifier}` : ''}
                </div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: getResultColor(results[index]),
                  fontWeight: 'bold'
                }}>
                  {getSuccessText(results[index])}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {results.length === 0 && (
        <button 
          className="button" 
          onClick={handleRollAll}
          disabled={rolling}
          style={{ marginTop: '15px' }}
        >
          {rolling ? '🎲 Tirando dados...' : '🎲 Tirar Todos los Dados'}
        </button>
      )}
    </div>
  );
};