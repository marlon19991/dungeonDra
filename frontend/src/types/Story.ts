export interface DiceRequest {
  type: 'ability' | 'attack' | 'damage' | 'saving_throw' | 'skill';
  ability?: string;
  skill?: string;
  difficulty?: number;
  description: string;
  diceNotation?: string;
}

export interface DiceResult {
  roll: number;
  modifier?: number;
  total: number;
  success?: boolean;
  description: string;
}

export interface StoryChapter {
  id: string;
  content: string;
  playerAction?: string;
  options: string[];
  diceRequests?: DiceRequest[];
  diceResults?: DiceResult[];
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
  theme?: string;
  pacing?: 'rapido' | 'detallado';
}

export interface ContinueStoryData {
  storyId: string;
  selectedOption?: string;
  customAction?: string;
  pacing?: 'rapido' | 'detallado';
}

export interface AIConfiguration {
  apiKey: string;
  model?: string;
}