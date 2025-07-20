import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIServiceConfig {
  apiKey: string;
  model?: string;
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

export interface StoryGenerationRequest {
  prompt: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
  characters?: CharacterStats[];
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
    pacing: 'rapido' | 'detallado' = 'rapido',
    characters?: CharacterStats[]
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

    let characterStatsSection = '';
    if (characters && characters.length > 0) {
      characterStatsSection = `\n\nESTADÍSTICAS DE PERSONAJES:
${characters.map(char => `
${char.name} (${classTranslations[char.class.toLowerCase()] || char.class} Nivel ${char.level}):
- HP: ${char.hitPoints.current}/${char.hitPoints.maximum}
- CA: ${char.armorClass}
- Fuerza: ${char.abilityScores.strength} (${Math.floor((char.abilityScores.strength - 10) / 2) >= 0 ? '+' : ''}${Math.floor((char.abilityScores.strength - 10) / 2)})
- Destreza: ${char.abilityScores.dexterity} (${Math.floor((char.abilityScores.dexterity - 10) / 2) >= 0 ? '+' : ''}${Math.floor((char.abilityScores.dexterity - 10) / 2)})
- Constitución: ${char.abilityScores.constitution} (${Math.floor((char.abilityScores.constitution - 10) / 2) >= 0 ? '+' : ''}${Math.floor((char.abilityScores.constitution - 10) / 2)})
- Inteligencia: ${char.abilityScores.intelligence} (${Math.floor((char.abilityScores.intelligence - 10) / 2) >= 0 ? '+' : ''}${Math.floor((char.abilityScores.intelligence - 10) / 2)})
- Sabiduría: ${char.abilityScores.wisdom} (${Math.floor((char.abilityScores.wisdom - 10) / 2) >= 0 ? '+' : ''}${Math.floor((char.abilityScores.wisdom - 10) / 2)})
- Carisma: ${char.abilityScores.charisma} (${Math.floor((char.abilityScores.charisma - 10) / 2) >= 0 ? '+' : ''}${Math.floor((char.abilityScores.charisma - 10) / 2)})
- Habilidades competentes: ${char.skills.join(', ')}
`).join('')}

IMPORTANTE: Usa estas estadísticas para determinar las dificultades de las tiradas de dados apropiadas para cada personaje.`;
    }

    const themeInstruction = storyTheme ? `\n- TEMA ESPECÍFICO: ${storyTheme}` : '';
    const pacingInstruction = pacing === 'rapido' 
      ? '- Mantén la narrativa concisa pero envolvente (1-2 párrafos máximo)\n- Ve directo al punto, enfócate en la acción y decisiones'
      : '- Desarrolla la atmósfera y detalles con más profundidad\n- Crea immersión con descripciones ricas';

    const prompt = `Eres un Dungeon Master profesional en español. Crea una historia original de aventura de D&D para estos personajes: ${charactersDescription}.${themeInstruction}${characterStatsSection}

IDIOMA: Debes escribir TODO en español. No uses palabras en inglés.

Requisitos:
- Crea un gancho convincente que atraiga al grupo hacia una aventura
- Ambientada en un mundo de fantasía clásico de D&D con elementos medievales
- Incluye una ubicación específica, conflicto o misterio para investigar
- ${pacingInstruction}
- Termina con una situación que requiera que el grupo tome una decisión INMEDIATA
- INCLUYE OBLIGATORIAMENTE tiradas de dados para hacer la experiencia interactiva
- CRÍTICO: Escribe ABSOLUTAMENTE TODO en español, incluidos nombres de lugares y NPCs

Después de la historia, proporciona exactamente 3 opciones de acción diferentes para que los jugadores elijan.

INCLUYE TIRADAS ESPECÍFICAS para cada opción disponible:
- Cada opción debe tener su propia tirada asociada cuando sea relevante
- Las tiradas deben ser apropiadas para la acción específica
- Indica claramente qué habilidad se usa y por qué

Formatea tu respuesta como:

HISTORIA:
[Tu historia aquí]

OPCIONES:
1. [Primera opción] - DADO: [TIPO]:[HABILIDAD]:[DC]:[NOTACIÓN] ([Descripción de por qué se necesita])
2. [Segunda opción] - DADO: [TIPO]:[HABILIDAD]:[DC]:[NOTACIÓN] ([Descripción de por qué se necesita])
3. [Tercera opción] - DADO: [TIPO]:[HABILIDAD]:[DC]:[NOTACIÓN] ([Descripción de por qué se necesita])

Ejemplos de formato:
1. Trepar la pared rocosa - DADO: ability:athletics:15:1d20+2 (Para escalar con seguridad)
2. Convencer al guardia - DADO: ability:persuasion:12:1d20+1 (Para persuadir sin sospechas)
3. Acechar en las sombras - DADO: ability:stealth:14:1d20+3 (Para moverse sin ser detectado)`;

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

    const prompt = `Eres un Dungeon Master profesional en español. Continúa esta historia de aventura de D&D. El grupo consiste en: ${charactersDescription}

IDIOMA: Debes escribir TODO en español. No uses palabras en inglés.

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
- INCLUYE OBLIGATORIAMENTE tiradas de dados para mantener la interactividad
- CRÍTICO: Escribe ABSOLUTAMENTE TODO en español, incluidos nombres de lugares y NPCs

Después de la continuación de la historia, proporciona exactamente 3 opciones de acción diferentes para lo que los jugadores pueden hacer a continuación.

INCLUYE TIRADAS ESPECÍFICAS para cada nueva opción:
- Cada opción debe tener su propia tirada cuando sea relevante
- Considera las consecuencias de la acción anterior al determinar las tiradas
- Las tiradas deben ser apropiadas para cada acción específica

Formatea tu respuesta como:

HISTORIA:
[Tu continuación de la historia aquí]

OPCIONES:
1. [Primera opción] - DADO: [TIPO]:[HABILIDAD]:[DC]:[NOTACIÓN] ([Descripción])
2. [Segunda opción] - DADO: [TIPO]:[HABILIDAD]:[DC]:[NOTACIÓN] ([Descripción])
3. [Tercera opción] - DADO: [TIPO]:[HABILIDAD]:[DC]:[NOTACIÓN] ([Descripción])`;

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

    const prompt = `Eres un Dungeon Master profesional en español. Continúa esta historia de aventura de D&D. El grupo consiste en: ${charactersDescription}

IDIOMA: Debes escribir TODO en español. No uses palabras en inglés.

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
- CRÍTICO: Escribe ABSOLUTAMENTE TODO en español, incluidos nombres de lugares y NPCs

Después de la continuación de la historia, proporciona exactamente 3 opciones de acción diferentes para lo que los jugadores pueden hacer a continuación.

Formatea tu respuesta como:

HISTORIA:
[Tu continuación de la historia aquí]

OPCIONES:
1. [Primera opción]
2. [Segunda opción]
3. [Tercera opción]`;

    return this.generateWithPrompt(prompt);
  }

  private async generateWithPrompt(prompt: string, retries = 3): Promise<StoryGenerationResponse> {
    // Manejo robusto de errores con retry automático y fallback content
    const startTime = Date.now();

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Gemini API attempt ${attempt}/${retries}`);
        
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const generationTime = Date.now() - startTime;

        const parsed = this.parseResponse(text);
        
        return {
          ...parsed,
          metadata: {
            generationTime,
            tokensUsed: text.length
          }
        };
      } catch (error) {
        console.error(`Gemini API Error (attempt ${attempt}/${retries}):`, error);
        
        const isServiceUnavailable = error instanceof Error && 
          (error.message.includes('503') || error.message.includes('overloaded'));
        
        if (attempt === retries || !isServiceUnavailable) {
          // Si es el último intento o no es un error de sobrecarga, lanzar error
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          if (isServiceUnavailable) {
            throw new Error('El servicio de IA está temporalmente sobrecargado. Por favor, intenta nuevamente en unos minutos. Si el problema persiste, verifica tu clave API de Gemini.');
          } else {
            throw new Error(`Error de generación de historia: ${errorMessage}`);
          }
        }
        
        // Esperar antes del siguiente retry (backoff exponencial)
        const delay = Math.pow(2, attempt - 1) * 2000; // 2s, 4s, 8s
        console.log(`Esperando ${delay}ms antes del siguiente intento...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Error inesperado en generateWithPrompt');
  }

  private parseResponse(text: string): { story: string; options: string[]; diceRequests?: DiceRequest[] } {
    console.log('Raw AI response:', text);
    
    // Parse story
    let storyMatch = text.match(/HISTORIA:\s*([\s\S]*?)(?=OPCIONES:|$)/i);
    if (!storyMatch) {
      storyMatch = text.match(/^([\s\S]*?)(?=OPCIONES:|$)/i);
    }
    
    const story = storyMatch ? storyMatch[1].trim() : text.trim();
    console.log('Parsed story length:', story.length);

    // Parse options with dice requirements
    const optionsMatch = text.match(/OPCIONES:\s*([\s\S]*?)$/i);
    let options: string[] = [];
    let diceRequests: DiceRequest[] = [];
    
    if (optionsMatch) {
      const optionsText = optionsMatch[1].trim();
      const optionLines = optionsText.split('\n').filter(line => 
        line.trim().match(/^\d+\.\s+/)
      );
      
      optionLines.forEach((line) => {
        // Parsear línea: "1. Acción - DADO: tipo:habilidad:dc:notación (descripción)"
        const cleanLine = line.replace(/^\d+\.\s*/, '').trim();
        
        if (cleanLine.includes(' - DADO:')) {
          const [optionText, diceInfo] = cleanLine.split(' - DADO:');
          options.push(optionText.trim());
          
          // Parsear información de dados
          const diceMatch = diceInfo.match(/([^:]+):([^:]+):(\d+):([^\s(]+)\s*\(([^)]+)\)/);
          if (diceMatch) {
            const [, type, ability, dcStr, notation, description] = diceMatch;
            diceRequests.push({
              type: type.trim() as 'ability' | 'attack' | 'damage' | 'saving_throw' | 'skill',
              ability: ability.trim(),
              difficulty: parseInt(dcStr),
              description: description.trim(),
              diceNotation: notation.trim()
            });
          } else {
            // Si no se puede parsear el dado, agregar uno genérico
            diceRequests.push({
              type: 'ability',
              ability: 'general',
              difficulty: 15,
              description: 'Tirada general para la acción',
              diceNotation: '1d20'
            });
          }
        } else {
          // Opción sin dados específicos
          options.push(cleanLine);
          diceRequests.push({
            type: 'ability',
            ability: 'general',
            difficulty: 12,
            description: 'Intento de acción',
            diceNotation: '1d20'
          });
        }
      });
    }

    if (options.length === 0) {
      // Fallback content cuando IA no responde correctamente
      options = [
        'Explorar el área con cautela',
        'Avanzar directamente hacia el objetivo',
        'Buscar información adicional antes de actuar'
      ];
      
      // Agregar dados por defecto con fallback dice requests
      diceRequests = [
        { type: 'ability', ability: 'perception', difficulty: 12, description: 'Explorar con cautela', diceNotation: '1d20+1' },
        { type: 'ability', ability: 'athletics', difficulty: 15, description: 'Avanzar directamente', diceNotation: '1d20+2' },
        { type: 'ability', ability: 'investigation', difficulty: 13, description: 'Buscar información', diceNotation: '1d20+0' }
      ];
    }

    console.log('Parsed options:', options);
    console.log('Parsed dice requests:', diceRequests);

    return {
      story,
      options,
      diceRequests
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.model.generateContent('Test');
      return true;
    } catch {
      return false;
    }
  }
}