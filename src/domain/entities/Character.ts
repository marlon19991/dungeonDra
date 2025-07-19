import { v4 as uuidv4 } from 'uuid';
import { CharacterClassVO } from '../value-objects/CharacterClass';
import { AbilityScores } from '../value-objects/AbilityScores';
import { HitPoints } from '../value-objects/HitPoints';

export interface CharacterData {
  id?: string;
  name: string;
  characterClass: CharacterClassVO;
  level: number;
  abilityScores: AbilityScores;
  hitPoints: HitPoints;
  armorClass: number;
  experience: number;
}

export class Character {
  private readonly id: string;
  private name: string;
  private characterClass: CharacterClassVO;
  private level: number;
  private abilityScores: AbilityScores;
  private hitPoints: HitPoints;
  private armorClass: number;
  private experience: number;

  constructor(data: CharacterData) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.characterClass = data.characterClass;
    this.level = data.level;
    this.abilityScores = data.abilityScores;
    this.hitPoints = data.hitPoints;
    this.armorClass = data.armorClass;
    this.experience = data.experience;
    this.validate();
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Character name cannot be empty');
    }
    if (this.level < 1 || this.level > 20) {
      throw new Error('Character level must be between 1 and 20');
    }
    if (this.armorClass < 0) {
      throw new Error('Armor class cannot be negative');
    }
    if (this.experience < 0) {
      throw new Error('Experience cannot be negative');
    }
  }

  getId(): string { return this.id; }
  getName(): string { return this.name; }
  getCharacterClass(): CharacterClassVO { return this.characterClass; }
  getLevel(): number { return this.level; }
  getAbilityScores(): AbilityScores { return this.abilityScores; }
  getHitPoints(): HitPoints { return this.hitPoints; }
  getArmorClass(): number { return this.armorClass; }
  getExperience(): number { return this.experience; }

  takeDamage(damage: number): void {
    this.hitPoints = this.hitPoints.takeDamage(damage);
  }

  heal(healAmount: number): void {
    this.hitPoints = this.hitPoints.heal(healAmount);
  }

  gainExperience(exp: number): void {
    if (exp < 0) {
      throw new Error('Experience gain cannot be negative');
    }
    this.experience += exp;
  }

  levelUp(): void {
    if (this.level >= 20) {
      throw new Error('Character is already at maximum level');
    }
    this.level++;
  }

  isAlive(): boolean {
    return this.hitPoints.isAlive();
  }

  equals(other: Character): boolean {
    return this.id === other.id;
  }
}