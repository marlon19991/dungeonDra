import { Story } from '../entities/Story';

export interface IStoryRepository {
  save(story: Story): Promise<void>;
  findById(id: string): Promise<Story | null>;
  findByCharacterId(characterId: string): Promise<Story[]>;
  findActiveStories(): Promise<Story[]>;
  findAll(): Promise<Story[]>;
  update(story: Story): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}