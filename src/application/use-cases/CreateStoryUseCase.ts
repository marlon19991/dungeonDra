import { Story } from '../../domain/entities/Story';
import { IStoryRepository } from '../../domain/repositories/IStoryRepository';
import { ICharacterRepository } from '../../domain/repositories/ICharacterRepository';
import { StoryGenerationService } from '../../domain/services/StoryGenerationService';
import { CreateStoryDto, StoryResponseDto } from '../dtos/StoryDto';

export class CreateStoryUseCase {
  constructor(
    private readonly storyRepository: IStoryRepository,
    private readonly characterRepository: ICharacterRepository,
    private readonly storyGenerationService: StoryGenerationService
  ) {}

  async execute(dto: CreateStoryDto): Promise<StoryResponseDto> {
    if (dto.characterIds.length === 0) {
      throw new Error('At least one character is required to create a story');
    }

    const characters = await Promise.all(
      dto.characterIds.map(async (id) => {
        const character = await this.characterRepository.findById(id);
        if (!character) {
          throw new Error(`Character with id ${id} not found`);
        }
        return character;
      })
    );

    const aliveCharacters = characters.filter(char => char.isAlive());
    if (aliveCharacters.length === 0) {
      throw new Error('At least one living character is required to start a story');
    }

    try {
      const generationResult = await this.storyGenerationService.generateBeginning(aliveCharacters);
      
      const title = dto.title || this.storyGenerationService.generateStoryTitle(aliveCharacters);
      
      const story = new Story({
        title,
        characterIds: dto.characterIds,
        chapters: [],
        currentChapterIndex: 0,
        isActive: true
      });

      story.addChapter(
        generationResult.story,
        generationResult.options,
        undefined,
        generationResult.metadata
      );

      await this.storyRepository.save(story);

      return this.mapToResponseDto(story);
    } catch (error) {
      throw new Error(`Failed to create story: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private mapToResponseDto(story: Story): StoryResponseDto {
    return {
      id: story.getId(),
      title: story.getTitle(),
      characterIds: story.getCharacterIds(),
      chapters: story.getChapters().map(chapter => ({
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