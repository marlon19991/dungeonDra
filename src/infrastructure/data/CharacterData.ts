export interface CharacterPersistenceModel {
  id: string;
  name: string;
  characterClass: string;
  level: number;
  abilityScores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  hitPoints: {
    current: number;
    max: number;
  };
  armorClass: number;
  experience: number;
  createdAt: string;
  updatedAt: string;
}
