export enum DiceType {
  D4 = 4,
  D6 = 6,
  D8 = 8,
  D10 = 10,
  D12 = 12,
  D20 = 20,
  D100 = 100
}

export class Dice {
  constructor(private readonly sides: DiceType) {}

  roll(): number {
    return Math.floor(Math.random() * this.sides) + 1;
  }

  rollMultiple(count: number): number[] {
    if (count <= 0) {
      throw new Error('Count must be greater than 0');
    }
    return Array.from({ length: count }, () => this.roll());
  }

  rollWithAdvantage(): number {
    const roll1 = this.roll();
    const roll2 = this.roll();
    return Math.max(roll1, roll2);
  }

  rollWithDisadvantage(): number {
    const roll1 = this.roll();
    const roll2 = this.roll();
    return Math.min(roll1, roll2);
  }

  getSides(): number {
    return this.sides;
  }

  static rollDamage(diceCount: number, diceType: DiceType, modifier: number = 0): number {
    const dice = new Dice(diceType);
    const rolls = dice.rollMultiple(diceCount);
    return rolls.reduce((sum, roll) => sum + roll, 0) + modifier;
  }
}