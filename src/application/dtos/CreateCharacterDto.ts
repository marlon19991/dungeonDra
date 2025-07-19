import { CharacterClass } from '../../domain/value-objects/CharacterClass';
import { AbilityScoresData } from '../../domain/value-objects/AbilityScores';

export interface CreateCharacterDto {
  name: string;
  characterClass: CharacterClass;
  level: number;
  abilityScores: AbilityScoresData;
  maxHitPoints: number;
  armorClass: number;
  experience: number;
}

export interface CharacterResponseDto {
  id: string;
  name: string;
  characterClass: string;
  level: number;
  abilityScores: AbilityScoresData;
  hitPoints: {
    current: number;
    max: number;
  };
  armorClass: number;
  experience: number;
  isAlive: boolean;
}