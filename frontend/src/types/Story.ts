export interface StoryChapter {
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

export interface Story {
  id: string;
  title: string;
  characterIds: string[];
  chapters: StoryChapter[];
  currentChapterIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  canContinue: boolean;
  chapterCount: number;
}

export interface CreateStoryData {
  characterIds: string[];
  title?: string;
}

export interface ContinueStoryData {
  storyId: string;
  selectedOption?: string;
  customAction?: string;
}

export interface AIConfiguration {
  apiKey: string;
  model?: string;
}