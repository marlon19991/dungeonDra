export interface DiceRoll {
  diceType: string; // 'd20', 'd6', etc.
  roll: number;
  modifier?: number;
  total: number;
  description?: string;
}

export interface DiceCheck {
  type: 'ability' | 'attack' | 'damage' | 'saving_throw' | 'skill';
  ability?: string; // 'strength', 'dexterity', etc.
  skill?: string;
  difficulty?: number; // DC (Difficulty Class)
  roll: DiceRoll;
  success?: boolean;
  description: string;
}

export class DiceService {
  
  rollDice(sides: number): number {
    return Math.floor(Math.random() * sides) + 1;
  }

  rollD20(): number {
    return this.rollDice(20);
  }

  rollD6(): number {
    return this.rollDice(6);
  }

  rollD4(): number {
    return this.rollDice(4);
  }

  rollD8(): number {
    return this.rollDice(8);
  }

  rollD10(): number {
    return this.rollDice(10);
  }

  rollD12(): number {
    return this.rollDice(12);
  }

  rollWithModifier(sides: number, modifier: number): DiceRoll {
    const roll = this.rollDice(sides);
    const total = roll + modifier;
    return {
      diceType: `d${sides}`,
      roll,
      modifier,
      total
    };
  }

  rollAbilityCheck(abilityScore: number, difficulty?: number): DiceCheck {
    const modifier = Math.floor((abilityScore - 10) / 2);
    const roll = this.rollWithModifier(20, modifier);
    const success = difficulty ? roll.total >= difficulty : undefined;

    return {
      type: 'ability',
      difficulty,
      roll,
      success,
      description: `Tirada de habilidad${difficulty ? ` (DC ${difficulty})` : ''}`
    };
  }

  rollAttack(attackBonus: number, targetAC?: number): DiceCheck {
    const roll = this.rollWithModifier(20, attackBonus);
    const success = targetAC ? roll.total >= targetAC : undefined;
    const isCritical = roll.roll === 20;
    const isCriticalFail = roll.roll === 1;

    return {
      type: 'attack',
      roll,
      success,
      description: `Tirada de ataque${targetAC ? ` (CA ${targetAC})` : ''}${
        isCritical ? ' - ¡CRÍTICO!' : 
        isCriticalFail ? ' - Fallo crítico' : ''
      }`
    };
  }

  rollDamage(diceCount: number, diceType: number, modifier: number = 0): DiceRoll {
    let total = modifier;
    const rolls: number[] = [];
    
    for (let i = 0; i < diceCount; i++) {
      const roll = this.rollDice(diceType);
      rolls.push(roll);
      total += roll;
    }

    return {
      diceType: `${diceCount}d${diceType}${modifier > 0 ? `+${modifier}` : modifier < 0 ? modifier.toString() : ''}`,
      roll: rolls.length === 1 ? rolls[0] : 0,
      modifier,
      total,
      description: `Rolls: [${rolls.join(', ')}]${modifier !== 0 ? ` + ${modifier}` : ''}`
    };
  }

  rollSavingThrow(abilityScore: number, proficiencyBonus: number, difficulty: number): DiceCheck {
    const abilityModifier = Math.floor((abilityScore - 10) / 2);
    const totalModifier = abilityModifier + proficiencyBonus;
    const roll = this.rollWithModifier(20, totalModifier);
    const success = roll.total >= difficulty;

    return {
      type: 'saving_throw',
      difficulty,
      roll,
      success,
      description: `Tirada de salvación (DC ${difficulty})`
    };
  }

  parseDiceRequest(diceString: string): { count: number; sides: number; modifier: number } | null {
    // Parse strings like "2d6+3", "1d20", "d8-1"
    const match = diceString.match(/^(\d*)d(\d+)([+-]\d+)?$/i);
    if (!match) return null;

    const count = match[1] ? parseInt(match[1]) : 1;
    const sides = parseInt(match[2]);
    const modifier = match[3] ? parseInt(match[3]) : 0;

    return { count, sides, modifier };
  }

  rollFromString(diceString: string): DiceRoll | null {
    const parsed = this.parseDiceRequest(diceString);
    if (!parsed) return null;

    return this.rollDamage(parsed.count, parsed.sides, parsed.modifier);
  }
}