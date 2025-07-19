import { IStoryRepository } from '../../domain/repositories/IStoryRepository';
import { StoryResponseDto } from '../dtos/StoryDto';

export class GetStoryUseCase {
  constructor(private readonly storyRepository: IStoryRepository) {}

  async execute(id: string): Promise<StoryResponseDto | null> {
    const story = await this.storyRepository.findById(id);
    
    if (!story) {
      return null;
    }

    return this.mapToResponseDto(story);
  }

  async getAllStories(): Promise<StoryResponseDto[]> {
    const stories = await this.storyRepository.findAll();
    return stories.map(story => this.mapToResponseDto(story));
  }

  async getActiveStories(): Promise<StoryResponseDto[]> {
    const stories = await this.storyRepository.findActiveStories();
    return stories.map(story => this.mapToResponseDto(story));
  }

  async getStoriesByCharacter(characterId: string): Promise<StoryResponseDto[]> {
    const stories = await this.storyRepository.findByCharacterId(characterId);
    return stories.map(story => this.mapToResponseDto(story));
  }

  private mapToResponseDto(story: any): StoryResponseDto {
    return {
      id: story.getId(),
      title: story.getTitle(),
      characterIds: story.getCharacterIds(),
      chapters: story.getChapters().map((chapter: any) => ({
        id: chapter.id,
        content: chapter.content,
        playerAction: chapter.playerAction,
        options: chapter.options,
        timestamp: chapter.timestamp.toISOString(),
        metadata: chapter.metadata
      })),
      currentChapterIndex: story.getCurrentChapterIndex(),
      isActive: story.getIsActive(),
      createdAt: story.getCreatedAt().toISOString(),
      updatedAt: story.getUpdatedAt().toISOString(),
      canContinue: story.canContinue(),
      chapterCount: story.getChapterCount()
    };
  }
}