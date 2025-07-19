export interface AbilityScoresData {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export class AbilityScores {
  constructor(private readonly scores: AbilityScoresData) {
    this.validate();
  }

  private validate(): void {
    const { strength, dexterity, constitution, intelligence, wisdom, charisma } = this.scores;
    
    if (!this.isValidScore(strength) || !this.isValidScore(dexterity) ||
        !this.isValidScore(constitution) || !this.isValidScore(intelligence) ||
        !this.isValidScore(wisdom) || !this.isValidScore(charisma)) {
      throw new Error('All ability scores must be between 3 and 18');
    }
  }

  private isValidScore(score: number): boolean {
    return Number.isInteger(score) && score >= 3 && score <= 18;
  }

  getStrength(): number { return this.scores.strength; }
  getDexterity(): number { return this.scores.dexterity; }
  getConstitution(): number { return this.scores.constitution; }
  getIntelligence(): number { return this.scores.intelligence; }
  getWisdom(): number { return this.scores.wisdom; }
  getCharisma(): number { return this.scores.charisma; }

  getModifier(ability: keyof AbilityScoresData): number {
    return Math.floor((this.scores[ability] - 10) / 2);
  }

  equals(other: AbilityScores): boolean {
    return JSON.stringify(this.scores) === JSON.stringify(other.scores);
  }
}