import { Story } from '../../domain/entities/Story';
import { IStoryRepository } from '../../domain/repositories/IStoryRepository';

export class InMemoryStoryRepository implements IStoryRepository {
  private stories: Map<string, Story> = new Map();

  async save(story: Story): Promise<void> {
    this.stories.set(story.getId(), story.clone());
  }

  async findById(id: string): Promise<Story | null> {
    const story = this.stories.get(id);
    return story ? story.clone() : null;
  }

  async findByCharacterId(characterId: string): Promise<Story[]> {
    const stories: Story[] = [];
    for (const story of this.stories.values()) {
      if (story.getCharacterIds().includes(characterId)) {
        stories.push(story.clone());
      }
    }
    return stories;
  }

  async findActiveStories(): Promise<Story[]> {
    const stories: Story[] = [];
    for (const story of this.stories.values()) {
      if (story.getIsActive()) {
        stories.push(story.clone());
      }
    }
    return stories;
  }

  async findAll(): Promise<Story[]> {
    const stories: Story[] = [];
    for (const story of this.stories.values()) {
      stories.push(story.clone());
    }
    return stories.sort((a, b) => b.getUpdatedAt().getTime() - a.getUpdatedAt().getTime());
  }

  async update(story: Story): Promise<void> {
    if (!this.stories.has(story.getId())) {
      throw new Error(`Story with id ${story.getId()} not found`);
    }
    this.stories.set(story.getId(), story.clone());
  }

  async delete(id: string): Promise<void> {
    if (!this.stories.has(id)) {
      throw new Error(`Story with id ${id} not found`);
    }
    this.stories.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.stories.has(id);
  }
}