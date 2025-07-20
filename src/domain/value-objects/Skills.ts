export interface SkillsData {
  // Habilidades basadas en Fuerza
  athletics: boolean;
  
  // Habilidades basadas en Destreza
  acrobatics: boolean;
  sleightOfHand: boolean;
  stealth: boolean;
  
  // Habilidades basadas en Inteligencia
  arcana: boolean;
  history: boolean;
  investigation: boolean;
  nature: boolean;
  religion: boolean;
  
  // Habilidades basadas en Sabiduría
  animalHandling: boolean;
  insight: boolean;
  medicine: boolean;
  perception: boolean;
  survival: boolean;
  
  // Habilidades basadas en Carisma
  deception: boolean;
  intimidation: boolean;
  performance: boolean;
  persuasion: boolean;
}

export type SkillName = keyof SkillsData;

export const SKILL_ABILITY_MAP: Record<SkillName, 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma'> = {
  athletics: 'strength',
  acrobatics: 'dexterity',
  sleightOfHand: 'dexterity',
  stealth: 'dexterity',
  arcana: 'intelligence',
  history: 'intelligence',
  investigation: 'intelligence',
  nature: 'intelligence',
  religion: 'intelligence',
  animalHandling: 'wisdom',
  insight: 'wisdom',
  medicine: 'wisdom',
  perception: 'wisdom',
  survival: 'wisdom',
  deception: 'charisma',
  intimidation: 'charisma',
  performance: 'charisma',
  persuasion: 'charisma'
};

export const SKILL_SPANISH_NAMES: Record<SkillName, string> = {
  athletics: 'Atletismo',
  acrobatics: 'Acrobacias',
  sleightOfHand: 'Juego de Manos',
  stealth: 'Sigilo',
  arcana: 'Conocimiento Arcano',
  history: 'Historia',
  investigation: 'Investigación',
  nature: 'Naturaleza',
  religion: 'Religión',
  animalHandling: 'Trato con Animales',
  insight: 'Perspicacia',
  medicine: 'Medicina',
  perception: 'Percepción',
  survival: 'Supervivencia',
  deception: 'Engaño',
  intimidation: 'Intimidación',
  performance: 'Interpretación',
  persuasion: 'Persuasión'
};

export class Skills {
  constructor(private readonly skills: SkillsData) {}

  isProficient(skill: SkillName): boolean {
    return this.skills[skill];
  }

  getAllProficiencies(): SkillName[] {
    return Object.entries(this.skills)
      .filter(([_, proficient]) => proficient)
      .map(([skill, _]) => skill as SkillName);
  }

  getSkillAbility(skill: SkillName): 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma' {
    return SKILL_ABILITY_MAP[skill];
  }

  getSpanishName(skill: SkillName): string {
    return SKILL_SPANISH_NAMES[skill];
  }
}