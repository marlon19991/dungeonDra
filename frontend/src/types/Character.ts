export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface HitPoints {
  current: number;
  max: number;
}

export interface Character {
  id: string;
  name: string;
  characterClass: string;
  level: number;
  abilityScores: AbilityScores;
  hitPoints: HitPoints;
  armorClass: number;
  experience: number;
  isAlive: boolean;
}

export interface CreateCharacterData {
  name: string;
  characterClass: string;
  level: number;
  abilityScores: AbilityScores;
  maxHitPoints: number;
  armorClass: number;
  experience: number;
}

export interface AttackResult {
  success: boolean;
  damage: number;
  criticalHit: boolean;
  attackRoll: number;
  targetAc: number;
}