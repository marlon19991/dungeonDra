import React, { useState, useEffect } from 'react';

interface DiceRoll {
  type: 'ability' | 'attack' | 'damage' | 'saving_throw' | 'skill';
  ability?: string;
  skill?: string;
  difficulty: number;
  description: string;
  diceNotation: string;
  result: number;
  success: boolean;
  criticalSuccess?: boolean;
  criticalFailure?: boolean;
}

interface DiceResultNarratorProps {
  roll: DiceRoll;
  characterName: string;
  onNarrationComplete?: () => void;
}

export const DiceResultNarrator: React.FC<DiceResultNarratorProps> = ({
  roll,
  characterName,
  onNarrationComplete
}) => {
  const [narrationText, setNarrationText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const narrative = generateNarrative(roll, characterName);
    setIsTyping(true);
    typeWriterEffect(narrative);
  }, [roll, characterName]);

  const typeWriterEffect = (text: string) => {
    setNarrationText('');
    let index = 0;
    
    const timer = setInterval(() => {
      if (index < text.length) {
        setNarrationText(prev => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
        setTimeout(() => {
          onNarrationComplete?.();
        }, 1000);
      }
    }, 30); // Velocidad de escritura

    return () => clearInterval(timer);
  };

  const generateNarrative = (roll: DiceRoll, characterName: string): string => {
    const { type, result, difficulty, success, criticalSuccess, criticalFailure, description } = roll;
    
    let narrative = `🎲 **${characterName}** `;
    
    // Describir la acción
    switch (type) {
      case 'ability':
        narrative += `realiza una tirada de ${getAbilityName(roll.ability || description)}`;
        break;
      case 'skill':
        narrative += `intenta usar ${getSkillName(roll.skill || description)}`;
        break;
      case 'saving_throw':
        narrative += `hace una tirada de salvación de ${getAbilityName(roll.ability || description)}`;
        break;
      case 'attack':
        narrative += `ataca`;
        break;
      case 'damage':
        narrative += `causa daño`;
        break;
    }
    
    narrative += `.\n\n`;
    
    // Resultado del dado
    if (criticalSuccess) {
      narrative += `🌟 **¡ÉXITO CRÍTICO!** Sacó un 20 natural! `;
      narrative += getSuccessNarrative(type, true);
    } else if (criticalFailure) {
      narrative += `💥 **¡FALLO CRÍTICO!** Sacó un 1 natural! `;
      narrative += getFailureNarrative(type, true);
    } else {
      narrative += `Resultado: **${result}** vs DC ${difficulty}\n\n`;
      
      if (success) {
        const margin = result - difficulty;
        if (margin >= 10) {
          narrative += `✨ **¡GRAN ÉXITO!** `;
          narrative += getSuccessNarrative(type, false, margin);
        } else if (margin >= 5) {
          narrative += `✅ **¡ÉXITO!** `;
          narrative += getSuccessNarrative(type, false, margin);
        } else {
          narrative += `✅ **Éxito por poco.** `;
          narrative += getSuccessNarrative(type, false, margin);
        }
      } else {
        const margin = difficulty - result;
        if (margin >= 10) {
          narrative += `❌ **FALLO TOTAL.** `;
          narrative += getFailureNarrative(type, false, margin);
        } else {
          narrative += `❌ **Fallo.** `;
          narrative += getFailureNarrative(type, false, margin);
        }
      }
    }
    
    return narrative;
  };

  const getAbilityName = (ability: string): string => {
    const abilityNames: { [key: string]: string } = {
      'strength': 'Fuerza',
      'dexterity': 'Destreza',
      'constitution': 'Constitución',
      'intelligence': 'Inteligencia',
      'wisdom': 'Sabiduría',
      'charisma': 'Carisma',
      'perception': 'Percepción',
      'investigation': 'Investigación',
      'persuasion': 'Persuasión',
      'stealth': 'Sigilo',
      'athletics': 'Atletismo',
      'acrobatics': 'Acrobacias'
    };
    
    return abilityNames[ability.toLowerCase()] || ability;
  };

  const getSkillName = (skill: string): string => {
    return getAbilityName(skill);
  };

  const getSuccessNarrative = (type: string, critical: boolean, margin?: number): string => {
    switch (type) {
      case 'ability':
      case 'skill':
        if (critical) {
          return "Su destreza y determinación superan cualquier obstáculo. Lo que parecía imposible se convierte en un logro extraordinario.";
        }
        if (margin && margin >= 10) {
          return "Ejecuta la acción con maestría absoluta, superando ampliamente las expectativas.";
        }
        if (margin && margin >= 5) {
          return "Realiza la acción con competencia y confianza.";
        }
        return "Logra completar la acción exitosamente, aunque con cierto esfuerzo.";
        
      case 'saving_throw':
        if (critical) {
          return "Su voluntad es inquebrantable. No solo resiste el efecto, sino que sale fortalecido de la experiencia.";
        }
        if (margin && margin >= 10) {
          return "Resiste completamente el efecto sin el menor esfuerzo aparente.";
        }
        return "Logra resistir el efecto a través de su determinación.";
        
      case 'attack':
        if (critical) {
          return "¡Un golpe perfecto! Encuentra el punto débil exacto de su oponente.";
        }
        if (margin && margin >= 10) {
          return "Un ataque certero que conecta limpiamente con su objetivo.";
        }
        return "Su ataque logra conectar con el objetivo.";
        
      default:
        return "¡Éxito!";
    }
  };

  const getFailureNarrative = (type: string, critical: boolean, margin?: number): string => {
    switch (type) {
      case 'ability':
      case 'skill':
        if (critical) {
          return "Todo sale terriblemente mal. No solo falla, sino que las consecuencias pueden ser peores de lo esperado.";
        }
        if (margin && margin >= 10) {
          return "La acción falla completamente, sin ningún progreso hacia el objetivo.";
        }
        return "A pesar de su esfuerzo, no logra completar la acción satisfactoriamente.";
        
      case 'saving_throw':
        if (critical) {
          return "Sucumbe completamente al efecto. Su resistencia se desploma en el peor momento posible.";
        }
        if (margin && margin >= 10) {
          return "Es completamente superado por el efecto, sin poder ofrecer resistencia.";
        }
        return "No logra resistir el efecto y debe enfrentar las consecuencias.";
        
      case 'attack':
        if (critical) {
          return "¡Su arma se atasca, resbala o algo sale terriblemente mal! Puede haber consecuencias adicionales.";
        }
        if (margin && margin >= 10) {
          return "El ataque falla por completo, sin acercarse siquiera al objetivo.";
        }
        return "Su ataque no logra conectar con el objetivo.";
        
      default:
        return "Fallo.";
    }
  };

  const getResultColor = () => {
    if (roll.criticalSuccess) return '#fbbf24'; // Oro
    if (roll.criticalFailure) return '#ef4444'; // Rojo
    if (roll.success) return '#10b981'; // Verde
    return '#6b7280'; // Gris
  };

  return (
    <div className="dice-narrator" style={{ 
      padding: '16px', 
      backgroundColor: '#1e293b', 
      borderRadius: '8px', 
      margin: '16px 0',
      border: `2px solid ${getResultColor()}`,
      boxShadow: `0 4px 12px ${getResultColor()}20`
    }}>
      <div className="narrator-header" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
        color: getResultColor(),
        fontWeight: 'bold'
      }}>
        <span>🎭</span>
        <span>Dungeon Master</span>
      </div>
      
      <div className="narrator-text" style={{
        color: '#f1f5f9',
        lineHeight: 1.6,
        fontSize: '14px',
        whiteSpace: 'pre-line'
      }}>
        {narrationText}
        {isTyping && <span className="cursor" style={{ animation: 'blink 1s infinite' }}>|</span>}
      </div>

      <div className="roll-summary" style={{
        marginTop: '12px',
        padding: '8px',
        backgroundColor: '#334155',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#94a3b8',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>🎲 {roll.diceNotation}</span>
        <span>Resultado: {roll.result}</span>
        <span>DC: {roll.difficulty}</span>
      </div>

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default DiceResultNarrator;