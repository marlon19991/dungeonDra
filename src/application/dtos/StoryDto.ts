export interface CreateStoryDto {
  characterIds: string[];
  title?: string;
  theme?: string;
  pacing?: 'rapido' | 'detallado';
}

export interface StoryChapterDto {
  id: string;
  content: string;
  playerAction?: string;
  options: string[];
  timestamp: string;
  metadata?: {
    tokensUsed?: number;
    generationTime?: number;
  };
}

export interface StoryResponseDto {
  id: string;
  title: string;
  characterIds: string[];
  chapters: StoryChapterDto[];
  currentChapterIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  canContinue: boolean;
  chapterCount: number;
}

export interface ContinueStoryDto {
  storyId: string;
  selectedOption?: string;
  customAction?: string;
  pacing?: 'rapido' | 'detallado';
}

export interface StoryGenerationResponseDto {
  success: boolean;
  story?: string;
  options?: string[];
  metadata?: {
    tokensUsed?: number;
    generationTime?: number;
  };
  error?: string;
}

export interface AIConfigurationDto {
  apiKey: string;
  model?: string;
}