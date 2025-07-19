import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIServiceConfig {
  apiKey: string;
  model?: string;
}

export interface StoryGenerationRequest {
  prompt: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface StoryGenerationResponse {
  story: string;
  options: string[];
  metadata?: {
    tokensUsed?: number;
    generationTime?: number;
  };
}

export class GeminiAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(config: AIServiceConfig) {
    if (!config.apiKey) {
      throw new Error('Gemini API key is required');
    }
    
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: config.model || 'gemini-pro' 
    });
  }

  async generateStoryBeginning(characterNames: string[], characterClasses: string[]): Promise<StoryGenerationResponse> {
    const charactersDescription = characterNames.map((name, index) => 
      `${name} the ${characterClasses[index]}`
    ).join(', ');

    const prompt = `
Create an original D&D adventure story beginning for these characters: ${charactersDescription}.

Requirements:
- Create a compelling hook that draws the party into an adventure
- Set in a classic D&D fantasy world with medieval elements
- Include a specific location, conflict, or mystery to investigate
- Make it engaging and atmospheric
- Keep it between 3-4 paragraphs
- End with a situation that requires the party to make a decision

After the story, provide exactly 3 different action options for the players to choose from. Format your response as:

STORY:
[Your story here]

OPTIONS:
1. [First option]
2. [Second option] 
3. [Third option]
`;

    return this.generateWithPrompt(prompt);
  }

  async continueStory(
    previousStory: string, 
    playerAction: string, 
    characterNames: string[]
  ): Promise<StoryGenerationResponse> {
    const charactersDescription = characterNames.join(', ');

    const prompt = `
Continue this D&D adventure story. The party consists of: ${charactersDescription}

Previous story context:
${previousStory}

The players chose to: ${playerAction}

Requirements:
- Continue the story naturally based on the players' action
- Include consequences of their choice (positive, negative, or mixed)
- Introduce new elements: NPCs, challenges, discoveries, or plot twists
- Maintain the tone and setting established in the previous story
- Keep it between 2-3 paragraphs
- End with a new situation requiring a decision

After the story continuation, provide exactly 3 different action options for what the players can do next. Format your response as:

STORY:
[Your story continuation here]

OPTIONS:
1. [First option]
2. [Second option]
3. [Third option]
`;

    return this.generateWithPrompt(prompt);
  }

  async generateCustomResponse(
    previousStory: string,
    customAction: string,
    characterNames: string[]
  ): Promise<StoryGenerationResponse> {
    const charactersDescription = characterNames.join(', ');

    const prompt = `
Continue this D&D adventure story. The party consists of: ${charactersDescription}

Previous story context:
${previousStory}

The players decided to take a custom action: "${customAction}"

Requirements:
- Respond to this specific custom action creatively and logically
- Consider if the action is reasonable, risky, or creative
- Include appropriate consequences and reactions from NPCs/environment
- If the action is dangerous, include potential skill checks or combat
- If the action is clever, reward the creativity appropriately
- Maintain game balance and realism within the fantasy setting
- Keep it between 2-3 paragraphs
- End with a new situation requiring a decision

After the story continuation, provide exactly 3 different action options for what the players can do next. Format your response as:

STORY:
[Your story continuation here]

OPTIONS:
1. [First option]
2. [Second option]
3. [Third option]
`;

    return this.generateWithPrompt(prompt);
  }

  private async generateWithPrompt(prompt: string): Promise<StoryGenerationResponse> {
    const startTime = Date.now();

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const generationTime = Date.now() - startTime;

      const parsed = this.parseResponse(text);
      
      return {
        ...parsed,
        metadata: {
          generationTime,
          tokensUsed: text.length // Approximate token count
        }
      };
    } catch (error) {
      throw new Error(`Story generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseResponse(text: string): { story: string; options: string[] } {
    try {
      const storyMatch = text.match(/STORY:\s*([\s\S]*?)(?=OPTIONS:|$)/);
      const optionsMatch = text.match(/OPTIONS:\s*([\s\S]*?)$/);

      if (!storyMatch) {
        throw new Error('Could not parse story from AI response');
      }

      const story = storyMatch[1].trim();
      let options: string[] = [];

      if (optionsMatch) {
        const optionsText = optionsMatch[1].trim();
        options = optionsText
          .split(/\n\d+\./)
          .map(option => option.replace(/^\d+\.\s*/, '').trim())
          .filter(option => option.length > 0);

        if (options.length === 0) {
          const lines = optionsText.split('\n').filter(line => line.trim());
          options = lines.map(line => line.replace(/^\d+\.\s*/, '').trim());
        }
      }

      if (options.length === 0) {
        options = [
          'Investigate the area more carefully',
          'Continue forward cautiously', 
          'Discuss the situation with your party'
        ];
      }

      return { story, options };
    } catch (error) {
      return {
        story: text,
        options: [
          'Continue exploring',
          'Take a different approach',
          'Consult with your party'
        ]
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // Simple test with short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const result = await this.model.generateContent('Hi');
      clearTimeout(timeoutId);
      
      const response = await result.response;
      return response.text().length > 0;
    } catch (error) {
      console.log('Gemini connection test failed:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }
}