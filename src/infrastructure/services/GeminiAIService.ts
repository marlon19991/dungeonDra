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

export interface DiceRequest {
  type: 'ability' | 'attack' | 'damage' | 'saving_throw' | 'skill';
  ability?: string;
  skill?: string;
  difficulty?: number;
  description: string;
  diceNotation?: string; // "1d20+3", "2d6", etc.
}

export interface StoryGenerationResponse {
  story: string;
  options: string[];
  diceRequests?: DiceRequest[];
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
      model: config.model || 'gemini-1.5-flash' 
    });
  }

  async generateStoryBeginning(
    characterNames: string[], 
    characterClasses: string[], 
    storyTheme?: string,
    pacing: 'rapido' | 'detallado' = 'rapido'
  ): Promise<StoryGenerationResponse> {
    const classTranslations: { [key: string]: string } = {
      'fighter': 'guerrero',
      'wizard': 'mago',
      'rogue': 'pícaro',
      'cleric': 'clérigo',
      'ranger': 'explorador',
      'barbarian': 'bárbaro',
      'bard': 'bardo',
      'druid': 'druida',
      'monk': 'monje',
      'paladin': 'paladín',
      'sorcerer': 'hechicero',
      'warlock': 'brujo'
    };

    const charactersDescription = characterNames.map((name, index) => {
      const translatedClass = classTranslations[characterClasses[index]] || characterClasses[index];
      return `${name} el ${translatedClass}`;
    }).join(', ');

    const themeInstruction = storyTheme ? `\n- TEMA ESPECÍFICO: ${storyTheme}` : '';
    const pacingInstruction = pacing === 'rapido' 
      ? '- Mantén la narrativa concisa pero envolvente (1-2 párrafos máximo)\n- Ve directo al punto, enfócate en la acción y decisiones'
      : '- Desarrolla la atmósfera y detalles con más profundidad\n- Crea immersión con descripciones ricas';

    const prompt = `
Crea una historia original de aventura de D&D para estos personajes: ${charactersDescription}.${themeInstruction}

Requisitos:
- Crea un gancho convincente que atraiga al grupo hacia una aventura
- Ambientada en un mundo de fantasía clásico de D&D con elementos medievales
- Incluye una ubicación específica, conflicto o misterio para investigar
- ${pacingInstruction}
- Termina con una situación que requiera que el grupo tome una decisión INMEDIATA
- IMPORTANTE: Escribe TODA la historia en español

Después de la historia, proporciona exactamente 3 opciones de acción diferentes para que los jugadores elijan.

Si la situación requiere tiradas de dados (combate, habilidades, etc.), incluye una sección DADOS con las tiradas necesarias.

Formatea tu respuesta como:

HISTORIA:
[Tu historia aquí]

DADOS: (solo si la situación lo requiere)
[TIPO]:[HABILIDAD/DESCRIPCIÓN]:[DC]:[NOTACIÓN]
Ejemplos:
- ability:strength:15:1d20+2 (para una tirada de fuerza con DC 15)
- attack::16:1d20+5 (para un ataque contra CA 16)
- saving_throw:dexterity:13:1d20+3 (para salvación de destreza)

OPCIONES:
1. [Primera opción]
2. [Segunda opción]
3. [Tercera opción]
`;

    return this.generateWithPrompt(prompt);
  }

  async continueStory(
    previousStory: string, 
    playerAction: string, 
    characterNames: string[],
    pacing: 'rapido' | 'detallado' = 'rapido'
  ): Promise<StoryGenerationResponse> {
    const charactersDescription = characterNames.join(', ');

    const pacingInstruction = pacing === 'rapido' 
      ? '- Mantén la respuesta concisa (1-2 párrafos cortos)\n- Ve directo a las consecuencias y nueva decisión'
      : '- Desarrolla las consecuencias con más detalle\n- Incluye descripciones atmosféricas';

    const prompt = `
Continúa esta historia de aventura de D&D. El grupo consiste en: ${charactersDescription}

Contexto de la historia anterior:
${previousStory}

Los jugadores eligieron: ${playerAction}

Requisitos:
- Continúa la historia naturalmente basándote en la acción de los jugadores
- Incluye las consecuencias de su elección (positivas, negativas o mixtas)
- Introduce nuevos elementos: NPCs, desafíos, descubrimientos o giros argumentales
- Mantén el tono y ambientación establecidos en la historia anterior
- ${pacingInstruction}
- Termina con una nueva situación que requiera una decisión INMEDIATA
- IMPORTANTE: Escribe TODA la continuación en español

Después de la continuación de la historia, proporciona exactamente 3 opciones de acción diferentes para lo que los jugadores pueden hacer a continuación.

Si la situación requiere tiradas de dados, incluye una sección DADOS.

Formatea tu respuesta como:

HISTORIA:
[Tu continuación de la historia aquí]

DADOS: (solo si la situación lo requiere)
[TIPO]:[HABILIDAD/DESCRIPCIÓN]:[DC]:[NOTACIÓN]

OPCIONES:
1. [Primera opción]
2. [Segunda opción]
3. [Tercera opción]
`;

    return this.generateWithPrompt(prompt);
  }

  async generateCustomResponse(
    previousStory: string,
    customAction: string,
    characterNames: string[],
    pacing: 'rapido' | 'detallado' = 'rapido'
  ): Promise<StoryGenerationResponse> {
    const charactersDescription = characterNames.join(', ');

    const pacingInstruction = pacing === 'rapido' 
      ? '- Mantén la respuesta concisa pero impactante\n- Enfócate en el resultado directo y nueva situación'
      : '- Desarrolla las consecuencias creativamente\n- Incluye detalles de reacciones y ambiente';

    const prompt = `
Continúa esta historia de aventura de D&D. El grupo consiste en: ${charactersDescription}

Contexto de la historia anterior:
${previousStory}

Los jugadores decidieron tomar una acción personalizada: "${customAction}"

Requisitos:
- Responde a esta acción específica de manera creativa y lógica
- Considera si la acción es razonable, arriesgada o creativa
- Incluye consecuencias apropiadas y reacciones de NPCs/entorno
- Si la acción es peligrosa, incluye tiradas de habilidad potenciales o combate
- Si la acción es inteligente, recompensa la creatividad apropiadamente
- Mantén el equilibrio del juego y realismo dentro del escenario de fantasía
- ${pacingInstruction}
- Termina con una nueva situación que requiera una decisión INMEDIATA
- IMPORTANTE: Escribe TODA la continuación en español

Después de la continuación de la historia, proporciona exactamente 3 opciones de acción diferentes para lo que los jugadores pueden hacer a continuación. Formatea tu respuesta como:

HISTORIA:
[Tu continuación de la historia aquí]

OPCIONES:
1. [Primera opción]
2. [Segunda opción]
3. [Tercera opción]
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
      console.error('Gemini API Error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID')) {
          throw new Error('Invalid Gemini API key. Please check your API key in the .env file.');
        }
        if (error.message.includes('models/gemini-pro')) {
          throw new Error('Model gemini-pro is deprecated. Using gemini-1.5-flash instead.');
        }
        if (error.message.includes('PERMISSION_DENIED')) {
          throw new Error('Permission denied. Make sure your API key has access to the Gemini API.');
        }
        throw new Error(`Story generation failed: ${error.message}`);
      }
      
      throw new Error('Story generation failed: Unknown error');
    }
  }

  private parseResponse(text: string): { story: string; options: string[] } {
    try {
      // Try Spanish format first
      let storyMatch = text.match(/HISTORIA:\s*([\s\S]*?)(?=OPCIONES:|$)/i);
      let optionsMatch = text.match(/OPCIONES:\s*([\s\S]*?)$/i);
      
      // Fallback to English format
      if (!storyMatch) {
        storyMatch = text.match(/STORY:\s*([\s\S]*?)(?=OPTIONS:|$)/i);
        optionsMatch = text.match(/OPTIONS:\s*([\s\S]*?)$/i);
      }

      if (!storyMatch) {
        throw new Error('Could not parse story from AI response');
      }

      const story = storyMatch[1].trim();
      let options: string[] = [];

      if (optionsMatch) {
        const optionsText = optionsMatch[1].trim();
        
        // Split by numbered lines more carefully
        const lines = optionsText.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          // Match lines that start with a number followed by a dot
          const match = trimmedLine.match(/^\d+\.\s*(.+)/);
          if (match && match[1]) {
            options.push(match[1].trim());
          }
        }
        
        // If we didn't find numbered options, try to extract any meaningful lines
        if (options.length === 0) {
          options = lines
            .filter(line => line.trim().length > 5) // Filter out very short lines
            .map(line => line.replace(/^\d+\.\s*/, '').trim())
            .filter(option => option.length > 0);
        }
      }

      // Only use fallback if we truly have no options
      if (options.length === 0) {
        options = [
          'Investigar el área más cuidadosamente',
          'Continuar hacia adelante con cautela', 
          'Discutir la situación con tu grupo'
        ];
      }

      console.log('Parsed story length:', story.length);
      console.log('Parsed options:', options);

      return { story, options };
    } catch (error) {
      console.error('Error parsing response:', error);
      return {
        story: text,
        options: [
          'Continuar explorando',
          'Tomar un enfoque diferente',
          'Consultar con tu grupo'
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