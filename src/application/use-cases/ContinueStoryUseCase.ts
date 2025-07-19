import { IStoryRepository } from '../../domain/repositories/IStoryRepository';
import { ICharacterRepository } from '../../domain/repositories/ICharacterRepository';
import { StoryGenerationService } from '../../domain/services/StoryGenerationService';
import { ContinueStoryDto, StoryResponseDto } from '../dtos/StoryDto';

export class ContinueStoryUseCase {
  constructor(
    private readonly storyRepository: IStoryRepository,
    private readonly characterRepository: ICharacterRepository,
    private readonly storyGenerationService: StoryGenerationService
  ) {}

  async execute(dto: ContinueStoryDto): Promise<StoryResponseDto> {
    const story = await this.storyRepository.findById(dto.storyId);
    if (!story) {
      throw new Error('Story not found');
    }

    if (!story.getIsActive()) {
      throw new Error('Story is not active');
    }

    if (!story.canContinue()) {
      throw new Error('Story cannot be continued');
    }

    const characters = await Promise.all(
      story.getCharacterIds().map(async (id) => {
        const character = await this.characterRepository.findById(id);
        if (!character) {
          throw new Error(`Character with id ${id} not found`);
        }
        return character;
      })
    );

    const aliveCharacters = characters.filter(char => char.isAlive());
    if (aliveCharacters.length === 0) {
      throw new Error('No living characters remain to continue the story');
    }

    try {
      const previousStory = story.getStoryText();
      let playerAction: string;
      let generationResult: any;

      const pacing = dto.pacing || 'rapido';
      
      if (dto.selectedOption) {
        playerAction = dto.selectedOption;
        generationResult = await this.storyGenerationService.continueWithChoice(
          previousStory,
          dto.selectedOption,
          aliveCharacters,
          pacing
        );
      } else if (dto.customAction) {
        playerAction = dto.customAction;
        generationResult = await this.storyGenerationService.continueWithCustomAction(
          previousStory,
          dto.customAction,
          aliveCharacters,
          pacing
        );
      } else {
        throw new Error('Either selectedOption or customAction must be provided');
      }

      story.setPlayerAction(playerAction);
      story.addChapter(
        generationResult.story,
        generationResult.options,
        playerAction,
        generationResult.metadata
      );

      await this.storyRepository.update(story);

      return this.mapToResponseDto(story);
    } catch (error) {
      throw new Error(`Failed to continue story: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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