import { DiceService } from '../../domain/services/DiceService';
import { CharacterClass } from '../../domain/value-objects/CharacterClass';
import { AbilityScoresData } from '../../domain/value-objects/AbilityScores';
import { DiceType } from '../../domain/entities/Dice';

export interface GeneratedCharacterData {
  abilityScores: AbilityScoresData;
  hitPoints: number;
  characterClass: CharacterClass;
}

export class CharacterGeneratorService {
  constructor(private readonly diceService: DiceService) {}

  generateRandomCharacter(): GeneratedCharacterData {
    const abilityScores = this.generateAbilityScores();
    const characterClass = this.selectRandomClass();
    const hitPoints = this.calculateHitPoints(characterClass, abilityScores.constitution);

    return {
      abilityScores,
      hitPoints,
      characterClass
    };
  }

  private generateAbilityScores(): AbilityScoresData {
    return {
      strength: this.diceService.rollAbilityScore(),
      dexterity: this.diceService.rollAbilityScore(),
      constitution: this.diceService.rollAbilityScore(),
      intelligence: this.diceService.rollAbilityScore(),
      wisdom: this.diceService.rollAbilityScore(),
      charisma: this.diceService.rollAbilityScore()
    };
  }

  private selectRandomClass(): CharacterClass {
    const classes = Object.values(CharacterClass);
    const randomIndex = Math.floor(Math.random() * classes.length);
    return classes[randomIndex];
  }

  private calculateHitPoints(characterClass: CharacterClass, constitution: number): number {
    const constitutionModifier = Math.floor((constitution - 10) / 2);
    let hitDie: DiceType;

    switch (characterClass) {
      case CharacterClass.FIGHTER:
      case CharacterClass.PALADIN:
      case CharacterClass.RANGER:
        hitDie = DiceType.D10;
        break;
      case CharacterClass.BARBARIAN:
        hitDie = DiceType.D12;
        break;
      case CharacterClass.CLERIC:
      case CharacterClass.DRUID:
      case CharacterClass.MONK:
      case CharacterClass.ROGUE:
      case CharacterClass.WARLOCK:
        hitDie = DiceType.D8;
        break;
      case CharacterClass.BARD:
      case CharacterClass.SORCERER:
      case CharacterClass.WIZARD:
        hitDie = DiceType.D6;
        break;
      default:
        hitDie = DiceType.D8;
    }

    return this.diceService.rollHitPoints(hitDie, constitutionModifier);
  }

  generateOptimalCharacterForClass(preferredClass: CharacterClass): GeneratedCharacterData {
    let bestScores = this.generateAbilityScores();
    let bestTotal = this.calculateScoreTotal(bestScores);

    for (let i = 0; i < 5; i++) {
      const scores = this.generateAbilityScores();
      const total = this.calculateScoreTotal(scores);
      if (total > bestTotal) {
        bestScores = scores;
        bestTotal = total;
      }
    }

    const hitPoints = this.calculateHitPoints(preferredClass, bestScores.constitution);

    return {
      abilityScores: bestScores,
      hitPoints,
      characterClass: preferredClass
    };
  }

  private calculateScoreTotal(scores: AbilityScoresData): number {
    return scores.strength + scores.dexterity + scores.constitution +
           scores.intelligence + scores.wisdom + scores.charisma;
  }
}