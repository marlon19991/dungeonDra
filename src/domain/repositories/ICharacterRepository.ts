import { Character } from '../entities/Character';

export interface ICharacterRepository {
  save(character: Character): Promise<void>;
  findById(id: string): Promise<Character | null>;
  findByName(name: string): Promise<Character[]>;
  findAll(): Promise<Character[]>;
  update(character: Character): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}