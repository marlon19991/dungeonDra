import { CreateStoryUseCase } from '../../application/use-cases/CreateStoryUseCase';
import { ContinueStoryUseCase } from '../../application/use-cases/ContinueStoryUseCase';
import { GetStoryUseCase } from '../../application/use-cases/GetStoryUseCase';
import { CreateStoryDto, ContinueStoryDto, StoryResponseDto } from '../../application/dtos/StoryDto';

export class StoryController {
  constructor(
    private readonly createStoryUseCase: CreateStoryUseCase,
    private readonly continueStoryUseCase: ContinueStoryUseCase,
    private readonly getStoryUseCase: GetStoryUseCase
  ) {}

  async createStory(dto: CreateStoryDto): Promise<StoryResponseDto> {
    try {
      return await this.createStoryUseCase.execute(dto);
    } catch (error) {
      throw new Error(`Failed to create story: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getStory(id: string): Promise<StoryResponseDto> {
    try {
      const story = await this.getStoryUseCase.execute(id);
      if (!story) {
        throw new Error('Story not found');
      }
      return story;
    } catch (error) {
      throw new Error(`Failed to get story: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAllStories(): Promise<StoryResponseDto[]> {
    try {
      return await this.getStoryUseCase.getAllStories();
    } catch (error) {
      throw new Error(`Failed to get stories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getActiveStories(): Promise<StoryResponseDto[]> {
    try {
      return await this.getStoryUseCase.getActiveStories();
    } catch (error) {
      throw new Error(`Failed to get active stories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getStoriesByCharacter(characterId: string): Promise<StoryResponseDto[]> {
    try {
      return await this.getStoryUseCase.getStoriesByCharacter(characterId);
    } catch (error) {
      throw new Error(`Failed to get stories for character: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async continueStory(dto: ContinueStoryDto): Promise<StoryResponseDto> {
    try {
      return await this.continueStoryUseCase.execute(dto);
    } catch (error) {
      throw new Error(`Failed to continue story: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}