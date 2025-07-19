import React from 'react';
import { Character } from '../types/Character';
import { translateClass, getAbilityAbbreviation } from '../utils/translations';

interface CharacterCardProps {
  character: Character;
  onSelect?: (character: Character) => void;
  showCombatActions?: boolean;
  onAttack?: (attackerId: string) => void;
  onHeal?: (characterId: string) => void;
  onInitiative?: (characterId: string) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onSelect,
  showCombatActions = false,
  onAttack,
  onHeal,
  onInitiative,
}) => {
  const healthPercentage = (character.hitPoints.current / character.hitPoints.max) * 100;

  const getModifier = (score: number): string => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  return (
    <div className="character-card" onClick={() => onSelect?.(character)}>
      <div className="character-name">{character.name}</div>
      <div className="character-class">
        {translateClass(character.characterClass)} • Nivel {character.level}
      </div>
      
      <div className="health-status">
        <span>HP:</span>
        <div className="health-bar">
          <div 
            className="health-fill" 
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
        <span>{character.hitPoints.current}/{character.hitPoints.max}</span>
      </div>

      <div className="character-stats">
        <div className="stat-row">
          <span>AC:</span>
          <span>{character.armorClass}</span>
        </div>
        <div className="stat-row">
          <span>Experiencia:</span>
          <span>{character.experience}</span>
        </div>
        <div className="stat-row">
          <span>Estado:</span>
          <span style={{ color: character.isAlive ? '#00b894' : '#ff6b6b' }}>
            {character.isAlive ? '💚 Vivo' : '💀 Muerto'}
          </span>
        </div>
      </div>

      <div className="ability-scores">
        <div className="ability-score">
          <div>{getAbilityAbbreviation('strength')}</div>
          <div>{character.abilityScores.strength}</div>
          <div>{getModifier(character.abilityScores.strength)}</div>
        </div>
        <div className="ability-score">
          <div>{getAbilityAbbreviation('dexterity')}</div>
          <div>{character.abilityScores.dexterity}</div>
          <div>{getModifier(character.abilityScores.dexterity)}</div>
        </div>
        <div className="ability-score">
          <div>{getAbilityAbbreviation('constitution')}</div>
          <div>{character.abilityScores.constitution}</div>
          <div>{getModifier(character.abilityScores.constitution)}</div>
        </div>
        <div className="ability-score">
          <div>{getAbilityAbbreviation('intelligence')}</div>
          <div>{character.abilityScores.intelligence}</div>
          <div>{getModifier(character.abilityScores.intelligence)}</div>
        </div>
        <div className="ability-score">
          <div>{getAbilityAbbreviation('wisdom')}</div>
          <div>{character.abilityScores.wisdom}</div>
          <div>{getModifier(character.abilityScores.wisdom)}</div>
        </div>
        <div className="ability-score">
          <div>{getAbilityAbbreviation('charisma')}</div>
          <div>{character.abilityScores.charisma}</div>
          <div>{getModifier(character.abilityScores.charisma)}</div>
        </div>
      </div>

      {showCombatActions && character.isAlive && (
        <div className="combat-actions" onClick={(e) => e.stopPropagation()}>
          <button 
            className="button" 
            onClick={() => onAttack?.(character.id)}
          >
            ⚔️ Atacar
          </button>
          <button 
            className="button success" 
            onClick={() => onHeal?.(character.id)}
          >
            ❤️ Sanar
          </button>
          <button 
            className="button secondary" 
            onClick={() => onInitiative?.(character.id)}
          >
            🎲 Iniciativa
          </button>
        </div>
      )}
    </div>
  );
};