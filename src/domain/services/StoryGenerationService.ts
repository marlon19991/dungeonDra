import { Character } from '../entities/Character';

export interface AIProvider {
  generateStoryBeginning(
    characterNames: string[], 
    characterClasses: string[], 
    storyTheme?: string,
    pacing?: 'rapido' | 'detallado'
  ): Promise<{
    story: string;
    options: string[];
    metadata?: any;
  }>;
  
  continueStory(
    previousStory: string, 
    playerAction: string, 
    characterNames: string[],
    pacing?: 'rapido' | 'detallado'
  ): Promise<{
    story: string;
    options: string[];
    metadata?: any;
  }>;
  
  generateCustomResponse(
    previousStory: string, 
    customAction: string, 
    characterNames: string[],
    pacing?: 'rapido' | 'detallado'
  ): Promise<{
    story: string;
    options: string[];
    metadata?: any;
  }>;
  
  testConnection(): Promise<boolean>;
}

export class StoryGenerationService {
  constructor(private readonly aiProvider: AIProvider) {}

  async generateBeginning(
    characters: Character[], 
    storyTheme?: string,
    pacing: 'rapido' | 'detallado' = 'rapido'
  ): Promise<{
    story: string;
    options: string[];
    metadata?: any;
  }> {
    if (characters.length === 0) {
      throw new Error('At least one character is required to generate a story');
    }

    const characterNames = characters.map(char => char.getName());
    const characterClasses = characters.map(char => char.getCharacterClass().getValue());

    return await this.aiProvider.generateStoryBeginning(characterNames, characterClasses, storyTheme, pacing);
  }

  async continueWithChoice(
    previousStory: string,
    selectedOption: string,
    characters: Character[],
    pacing: 'rapido' | 'detallado' = 'rapido'
  ): Promise<{
    story: string;
    options: string[];
    metadata?: any;
  }> {
    const characterNames = characters.map(char => char.getName());
    return await this.aiProvider.continueStory(previousStory, selectedOption, characterNames, pacing);
  }

  async continueWithCustomAction(
    previousStory: string,
    customAction: string,
    characters: Character[],
    pacing: 'rapido' | 'detallado' = 'rapido'
  ): Promise<{
    story: string;
    options: string[];
    metadata?: any;
  }> {
    if (!customAction.trim()) {
      throw new Error('Custom action cannot be empty');
    }

    const characterNames = characters.map(char => char.getName());
    return await this.aiProvider.generateCustomResponse(previousStory, customAction, characterNames, pacing);
  }

  async validateConnection(): Promise<boolean> {
    try {
      return await this.aiProvider.testConnection();
    } catch (error) {
      return false;
    }
  }

  generateStoryTitle(characters: Character[]): string {
    const characterNames = characters.map(char => char.getName());
    const classes = characters.map(char => char.getCharacterClass().getValue());
    
    const uniqueClasses = [...new Set(classes)];
    const timestamp = new Date().toLocaleDateString();
    
    if (characterNames.length === 1) {
      return `${characterNames[0]}'s Adventure (${timestamp})`;
    } else if (characterNames.length <= 3) {
      return `${characterNames.join(', ')} Adventure (${timestamp})`;
    } else {
      return `The ${uniqueClasses.join('/')} Party's Quest (${timestamp})`;
    }
  }
}