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

    const prompt = `🇪🇸 ESPAÑOL OBLIGATORIO 🇪🇸
NEVER use English. SOLO ESPAÑOL. NO ENGLISH ALLOWED.
Responde únicamente en español. Prohibido cualquier palabra en inglés.

Eres un Dungeon Master de habla hispana. Crea una aventura de Calabozos y Dragones para: ${charactersDescription}.${themeInstruction}${characterStatsSection}

RESPUESTA REQUERIDA EN ESPAÑOL:

HISTORIA:
[Aventura en español - ambientación medieval fantástica]

OPCIONES:
1. [Acción en español] - DADO: ability:[habilidad]:12:1d20 (Explicación en español)
2. [Acción en español] - DADO: ability:[habilidad]:14:1d20 (Explicación en español)
3. [Acción en español] - DADO: ability:[habilidad]:16:1d20 (Explicación en español)

REQUISITOS ABSOLUTOS:
- IDIOMA: Solo palabras en español
- ${pacingInstruction}
- Nombres: En español (no "Tavern" sino "Taberna", no "Village" sino "Pueblo")
- Personajes: Nombres hispanos (Don Ricardo, Doña María, etc.)
- Lugares: Nombres en español (Vallehermoso, Piedraluna, etc.)
- Habilidades: athletics, perception, stealth, persuasion, investigation, intimidation

EJEMPLO CORRECTO:
HISTORIA:
Llegáis a la Taberna del Dragón Dorado en Vallehermoso. Don Ricardo, el tabernero, os cuenta con preocupación sobre ruidos extraños en el sótano de la iglesia abandonada. Los aldeanos temen investigar.

OPCIONES:
1. Explorar el sótano inmediatamente - DADO: ability:perception:14:1d20 (Detectar peligros)
2. Interrogar a más aldeanos - DADO: ability:persuasion:12:1d20 (Obtener información)
3. Infiltrarse por la noche - DADO: ability:stealth:16:1d20 (Movimiento sigiloso)`;

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

    const prompt = `🇪🇸 ESPAÑOL OBLIGATORIO 🇪🇸
NEVER use English. SOLO ESPAÑOL. NO ENGLISH ALLOWED.
Responde únicamente en español. Prohibido cualquier palabra en inglés.

Eres un Dungeon Master de habla hispana. Continúa la aventura para: ${charactersDescription}

CONTEXTO ANTERIOR:
${previousStory}

ACCIÓN DE LOS JUGADORES: ${playerAction}

RESPUESTA REQUERIDA EN ESPAÑOL:

HISTORIA:
[Consecuencias en español - nueva situación]

OPCIONES:
1. [Acción en español] - DADO: ability:[habilidad]:12:1d20 (Explicación en español)
2. [Acción en español] - DADO: ability:[habilidad]:14:1d20 (Explicación en español)
3. [Acción en español] - DADO: ability:[habilidad]:16:1d20 (Explicación en español)

REQUISITOS ABSOLUTOS:
- IDIOMA: Solo palabras en español
- ${pacingInstruction}
- Nombres: En español (Taberna, Pueblo, etc.)
- Personajes: Nombres hispanos
- Lugares: Nombres en español
- Describe consecuencias lógicas de la acción`;

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

    const prompt = `OBLIGATORIO: Responde SOLO en español. PROHIBIDO usar inglés.

Eres un Dungeon Master profesional. Continúa la historia para: ${charactersDescription}

HISTORIA ANTERIOR:
${previousStory}

ACCIÓN PERSONALIZADA: "${customAction}"

FORMATO OBLIGATORIO:

HISTORIA:
[Continuación en español - responde a la acción personalizada]

OPCIONES:
1. [Opción en español] - DADO: ability:[habilidad]:[DC]:1d20 ([explicación en español])
2. [Opción en español] - DADO: ability:[habilidad]:[DC]:1d20 ([explicación en español])
3. [Opción en español] - DADO: ability:[habilidad]:[DC]:1d20 ([explicación en español])

REGLAS ESTRICTAS:
- TODO en español
- ${pacingInstruction}
- Cada opción DEBE tener formato DADO exacto
- Evalúa si la acción es inteligente/arriesgada y responde apropiadamente
- Habilidades válidas: athletics, perception, stealth, persuasion, investigation, intimidation
- DC entre 10-18`;

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
    
    // FORZAR ESPAÑOL SIEMPRE HASTA QUE LA IA FUNCIONE CORRECTAMENTE
    // TODO: Remover cuando Gemini respete las instrucciones de idioma
    console.log('🇪🇸 FORZANDO CONTENIDO EN ESPAÑOL - IA aún no respeta instrucciones de idioma');
    return this.generateSpanishFallback();
    
    // CÓDIGO ORIGINAL (deshabilitado temporalmente)
    /*
    const hasEnglishWords = /\b(the|and|or|of|in|to|for|with|on|at|by|from|as|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|can|must|shall)\b/gi.test(text);
    
    if (hasEnglishWords) {
      console.log('⚠️ DETECTADO INGLÉS EN RESPUESTA IA - Aplicando fallback en español');
      return this.generateSpanishFallback();
    }
    */
    // Código de parseo original temporalmente deshabilitado
    // Se activará cuando Gemini respete las instrucciones de idioma
  }

  private generateSpanishFallback(): { story: string; options: string[]; diceRequests: DiceRequest[] } {
    const spanishStories = [
      "Te encuentras en la acogedora Taberna del Dragón Dorado en el pueblo de Vallehermoso. El tabernero, Don Ricardo, se acerca con el ceño fruncido por la preocupación. 'Estimados aventureros', dice en voz baja, 'desde hace tres noches escuchamos extraños gemidos y rasguños provenientes del sótano de la antigua iglesia abandonada al final del pueblo. Los aldeanos están aterrorizados y ninguno se atreve a investigar. ¿Podrían ayudarnos a descubrir qué está sucediendo?'",
      
      "Vuestro grupo llega a las imponentes puertas de la Mazmorra de los Ecos Perdidos, talladas en la roca viva de una montaña ancestral. Según las leyendas que os contó el anciano del pueblo, un poderoso hechicero élfico escondió aquí un tesoro mágico antes de desaparecer hace dos siglos. La entrada está sellada por una pesada puerta de obsidiana con runas élficas que brillan débilmente. Un viento helado escapa por las grietas, trayendo consigo susurros en idiomas olvidados.",
      
      "En el polvoriento sendero hacia la próspera Ciudad de Piedraluna, vuestro grupo se topa con los restos humeantes de una caravana mercante atacada. Los pocos supervivientes, heridos y en shock, os explican entre sollozos que bandidos encapuchados surgieron del bosque como fantasmas y secuestraron a Isabella, la joven hija del comerciante principal. Las huellas de los atacantes se pierden en la espesura del temible Bosque de las Sombras Susurrantes. Cada minuto que pasa, la muchacha se aleja más.",
      
      "Llegáis a la misteriosa Torre del Mago Solitario, que se alza solitaria en medio de una llanura azotada por vientos extraños. El anciano bibliotecario del pueblo os explicó que hace décadas, el mago Aurelio se encerró en su torre para realizar un experimento de alquimia prohibida. Desde entonces, extrañas luces danzan en las ventanas por las noches y los animales evitan acercarse. Recientemente, los campesinos han reportado que la torre emite un zumbido constante que perturba el sueño de toda la región.",
      
      "Os encontráis en las ruinas del antiguo Templo de la Diosa Luna, semi-oculto entre la maleza de un bosque encantado. Las columnas de mármol blanco están cubiertas de musgo y enredaderas, pero aún conservan su majestuosidad. Según los pergaminos que consultasteis en la biblioteca, este templo custodia un artefacto sagrado: el Cáliz de la Luz Eterna. Sin embargo, los guardianes espectrales del templo no permiten que los mortales se acerquen fácilmente al santuario interior."
    ];

    const spanishOptions = [
      [
        "Explorar el sótano de la iglesia inmediatamente con antorchas",
        "Interrogar discretamente a los aldeanos sobre lo que han visto",
        "Esperar hasta el anochecer para investigar sin ser vistos"
      ],
      [
        "Intentar descifrar las runas élficas de la puerta",
        "Buscar otra entrada alrededor de la montaña",
        "Acampar cerca y observar si algo sale durante la noche"
      ],
      [
        "Seguir las huellas hacia el bosque inmediatamente",
        "Interrogar a los supervivientes para obtener más detalles",
        "Reunir suministros en el pueblo antes de la persecución"
      ],
      [
        "Acercarse directamente a la puerta principal de la torre",
        "Rodear la torre buscando ventanas o entradas secundarias",
        "Acampar a distancia y observar los patrones de las luces"
      ],
      [
        "Avanzar directamente hacia el santuario interior",
        "Examinar las inscripciones en las columnas del templo",
        "Intentar comunicarse respetuosamente con los guardianes espectrales"
      ]
    ];

    const randomIndex = Math.floor(Math.random() * spanishStories.length);
    const selectedStory = spanishStories[randomIndex];
    const selectedOptions = spanishOptions[randomIndex];

    const abilities = ['perception', 'investigation', 'stealth', 'persuasion', 'athletics', 'arcana'];
    const descriptions = [
      'Detectar peligros ocultos y pistas importantes',
      'Obtener información valiosa de fuentes confiables', 
      'Moverse sin ser detectado por enemigos',
      'Convencer con palabras y carisma',
      'Superar obstáculos físicos con fuerza',
      'Comprender fenómenos mágicos y místicos'
    ];

    return {
      story: selectedStory,
      options: selectedOptions,
      diceRequests: selectedOptions.map((option, index) => ({
        type: 'ability' as const,
        ability: abilities[index % abilities.length],
        difficulty: 12 + (index * 2), // DC 12, 14, 16
        description: descriptions[index % descriptions.length],
        diceNotation: '1d20'
      }))
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