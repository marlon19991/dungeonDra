import { SkillName, SkillsData } from './Skills';

export const CLASS_SKILL_PROFICIENCIES: Record<string, SkillName[]> = {
  fighter: ['athletics', 'intimidation'],
  wizard: ['arcana', 'investigation'],
  rogue: ['stealth', 'sleightOfHand', 'perception', 'deception'],
  cleric: ['medicine', 'religion', 'insight'],
  ranger: ['survival', 'nature', 'perception'],
  barbarian: ['athletics', 'intimidation', 'survival'],
  bard: ['persuasion', 'performance', 'deception', 'insight'],
  druid: ['nature', 'medicine', 'survival'],
  monk: ['athletics', 'acrobatics', 'stealth'],
  paladin: ['athletics', 'medicine', 'intimidation'],
  sorcerer: ['arcana', 'persuasion'],
  warlock: ['arcana', 'deception', 'intimidation']
};

export function getDefaultSkillsForClass(characterClass: string): SkillsData {
  const classProficiencies = CLASS_SKILL_PROFICIENCIES[characterClass.toLowerCase()] || [];
  
  const skills: SkillsData = {
    athletics: false,
    acrobatics: false,
    sleightOfHand: false,
    stealth: false,
    arcana: false,
    history: false,
    investigation: false,
    nature: false,
    religion: false,
    animalHandling: false,
    insight: false,
    medicine: false,
    perception: false,
    survival: false,
    deception: false,
    intimidation: false,
    performance: false,
    persuasion: false
  };

  // Marcar las habilidades de la clase como competentes
  classProficiencies.forEach(skill => {
    skills[skill] = true;
  });

  return skills;
}