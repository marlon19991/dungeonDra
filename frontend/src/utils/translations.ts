export const classTranslations: { [key: string]: string } = {
  'fighter': 'Guerrero',
  'wizard': 'Mago',
  'rogue': 'Pícaro',
  'cleric': 'Clérigo',
  'ranger': 'Explorador',
  'barbarian': 'Bárbaro',
  'bard': 'Bardo',
  'druid': 'Druida',
  'monk': 'Monje',
  'paladin': 'Paladín',
  'sorcerer': 'Hechicero',
  'warlock': 'Brujo'
};

export const abilityTranslations: { [key: string]: string } = {
  'strength': 'Fuerza',
  'dexterity': 'Destreza',
  'constitution': 'Constitución',
  'intelligence': 'Inteligencia',
  'wisdom': 'Sabiduría',
  'charisma': 'Carisma'
};

export const abilityAbbreviations: { [key: string]: string } = {
  'strength': 'FUE',
  'dexterity': 'DES',
  'constitution': 'CON',
  'intelligence': 'INT',
  'wisdom': 'SAB',
  'charisma': 'CAR'
};

export function translateClass(className: string): string {
  return classTranslations[className.toLowerCase()] || className;
}

export function translateAbility(abilityName: string): string {
  return abilityTranslations[abilityName.toLowerCase()] || abilityName;
}

export function getAbilityAbbreviation(abilityName: string): string {
  return abilityAbbreviations[abilityName.toLowerCase()] || abilityName.substring(0, 3).toUpperCase();
}