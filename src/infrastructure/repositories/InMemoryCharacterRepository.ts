import { Character } from '../../domain/entities/Character';
import { ICharacterRepository } from '../../domain/repositories/ICharacterRepository';
import { CharacterClassVO } from '../../domain/value-objects/CharacterClass';
import { AbilityScores } from '../../domain/value-objects/AbilityScores';
import { HitPoints } from '../../domain/value-objects/HitPoints';
import { CharacterPersistenceModel } from '../data/CharacterData';

export class InMemoryCharacterRepository implements ICharacterRepository {
  private characters: Map<string, CharacterPersistenceModel> = new Map();

  async save(character: Character): Promise<void> {
    const model = this.mapToDataModel(character);
    this.characters.set(character.getId(), model);
  }

  async findById(id: string): Promise<Character | null> {
    const model = this.characters.get(id);
    if (!model) {
      return null;
    }
    return this.mapToDomainEntity(model);
  }

  async findByName(name: string): Promise<Character[]> {
    const characters: Character[] = [];
    for (const model of this.characters.values()) {
      if (model.name.toLowerCase().includes(name.toLowerCase())) {
        characters.push(this.mapToDomainEntity(model));
      }
    }
    return characters;
  }

  async findAll(): Promise<Character[]> {
    const characters: Character[] = [];
    for (const model of this.characters.values()) {
      characters.push(this.mapToDomainEntity(model));
    }
    return characters;
  }

  async update(character: Character): Promise<void> {
    if (!this.characters.has(character.getId())) {
      throw new Error(`Character with id ${character.getId()} not found`);
    }
    const model = this.mapToDataModel(character);
    model.updatedAt = new Date().toISOString();
    this.characters.set(character.getId(), model);
  }

  async delete(id: string): Promise<void> {
    if (!this.characters.has(id)) {
      throw new Error(`Character with id ${id} not found`);
    }
    this.characters.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.characters.has(id);
  }

  private mapToDataModel(character: Character): CharacterPersistenceModel {
    const now = new Date().toISOString();
    return {
      id: character.getId(),
      name: character.getName(),
      characterClass: character.getCharacterClass().getValue(),
      level: character.getLevel(),
      abilityScores: {
        strength: character.getAbilityScores().getStrength(),
        dexterity: character.getAbilityScores().getDexterity(),
        constitution: character.getAbilityScores().getConstitution(),
        intelligence: character.getAbilityScores().getIntelligence(),
        wisdom: character.getAbilityScores().getWisdom(),
        charisma: character.getAbilityScores().getCharisma()
      },
      hitPoints: {
        current: character.getHitPoints().getCurrentHp(),
        max: character.getHitPoints().getMaxHp()
      },
      armorClass: character.getArmorClass(),
      experience: character.getExperience(),
      createdAt: now,
      updatedAt: now
    };
  }

  private mapToDomainEntity(model: CharacterPersistenceModel): Character {
    const characterClass = new CharacterClassVO(model.characterClass as any);
    const abilityScores = new AbilityScores(model.abilityScores);
    const hitPoints = new HitPoints(model.hitPoints.max, model.hitPoints.current);

    return new Character({
      id: model.id,
      name: model.name,
      characterClass,
      level: model.level,
      abilityScores,
      hitPoints,
      armorClass: model.armorClass,
      experience: model.experience
    });
  }
}