export enum CharacterClass {
  FIGHTER = 'fighter',
  WIZARD = 'wizard',
  ROGUE = 'rogue',
  CLERIC = 'cleric',
  RANGER = 'ranger',
  BARBARIAN = 'barbarian',
  BARD = 'bard',
  DRUID = 'druid',
  MONK = 'monk',
  PALADIN = 'paladin',
  SORCERER = 'sorcerer',
  WARLOCK = 'warlock'
}

export class CharacterClassVO {
  constructor(private readonly value: CharacterClass) {
    this.validate();
  }

  private validate(): void {
    if (!Object.values(CharacterClass).includes(this.value)) {
      throw new Error(`Invalid character class: ${this.value}`);
    }
  }

  getValue(): CharacterClass {
    return this.value;
  }

  equals(other: CharacterClassVO): boolean {
    return this.value === other.value;
  }
}