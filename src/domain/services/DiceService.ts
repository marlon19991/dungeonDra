import { Dice, DiceType } from '../entities/Dice';

export class DiceService {
  private static instance: DiceService;

  private constructor() {}

  static getInstance(): DiceService {
    if (!DiceService.instance) {
      DiceService.instance = new DiceService();
    }
    return DiceService.instance;
  }

  rollAbilityScore(): number {
    const d6 = new Dice(DiceType.D6);
    const rolls = d6.rollMultiple(4);
    rolls.sort((a, b) => b - a);
    return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
  }

  rollInitiative(dexterityModifier: number): number {
    const d20 = new Dice(DiceType.D20);
    return d20.roll() + dexterityModifier;
  }

  rollAttack(attackBonus: number): number {
    const d20 = new Dice(DiceType.D20);
    return d20.roll() + attackBonus;
  }

  rollSavingThrow(abilityModifier: number, proficiencyBonus: number = 0): number {
    const d20 = new Dice(DiceType.D20);
    return d20.roll() + abilityModifier + proficiencyBonus;
  }

  rollSkillCheck(abilityModifier: number, proficiencyBonus: number = 0): number {
    const d20 = new Dice(DiceType.D20);
    return d20.roll() + abilityModifier + proficiencyBonus;
  }

  rollHitPoints(hitDie: DiceType, constitutionModifier: number): number {
    const dice = new Dice(hitDie);
    return Math.max(1, dice.roll() + constitutionModifier);
  }
}