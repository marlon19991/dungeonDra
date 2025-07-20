import { Character } from '../entities/Character';

export interface DiceRequest {
  type: 'ability' | 'attack' | 'damage' | 'saving_throw' | 'skill';
  ability?: string;
  skill?: string;
  difficulty?: number;
  description: string;
  diceNotation?: string;
}

export interface CharacterStats {
  name: string;
  class: string;
  level: number;
  hitPoints: { current: number; maximum: number };
  armorClass: number;
  abilityScores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  skills: string[];
}

export interface AIProvider {
  generateStoryBeginning(
    characterNames: string[], 
    characterClasses: string[], 
    storyTheme?: string,
    pacing?: 'rapido' | 'detallado',
    characters?: CharacterStats[]
  ): Promise<{
    story: string;
    options: string[];
    diceRequests?: DiceRequest[];
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
    diceRequests?: DiceRequest[];
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
    diceRequests?: DiceRequest[];
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
    diceRequests?: DiceRequest[];
    metadata?: any;
  }> {
    if (characters.length === 0) {
      throw new Error('At least one character is required to generate a story');
    }

    const characterNames = characters.map(char => char.getName());
    const characterClasses = characters.map(char => char.getCharacterClass().getValue());
    
    // Convertir personajes a estadísticas para la IA
    const characterStats: CharacterStats[] = characters.map(char => ({
      name: char.getName(),
      class: char.getCharacterClass().getValue(),
      level: char.getLevel(),
      hitPoints: {
        current: char.getHitPoints().getCurrentHp(),
        maximum: char.getHitPoints().getMaxHp()
      },
      armorClass: char.getArmorClass(),
      abilityScores: {
        strength: char.getAbilityScores().getStrength(),
        dexterity: char.getAbilityScores().getDexterity(),
        constitution: char.getAbilityScores().getConstitution(),
        intelligence: char.getAbilityScores().getIntelligence(),
        wisdom: char.getAbilityScores().getWisdom(),
        charisma: char.getAbilityScores().getCharisma()
      },
      skills: char.getSkills().getAllProficiencies().map(skill => 
        char.getSkills().getSpanishName(skill)
      )
    }));

    return await this.aiProvider.generateStoryBeginning(characterNames, characterClasses, storyTheme, pacing, characterStats);
  }

  async continueWithChoice(
    previousStory: string,
    selectedOption: string,
    characters: Character[],
    pacing: 'rapido' | 'detallado' = 'rapido'
  ): Promise<{
    story: string;
    options: string[];
    diceRequests?: DiceRequest[];
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
    diceRequests?: DiceRequest[];
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