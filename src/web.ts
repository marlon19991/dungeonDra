import dotenv from 'dotenv';
import { DiceService } from './domain/services/DiceService';
import { FileStorageService } from './infrastructure/services/FileStorageService';
import { FileCharacterRepository } from './infrastructure/repositories/FileCharacterRepository';
import { InMemoryStoryRepository } from './infrastructure/repositories/InMemoryStoryRepository';
import { GeminiAIService } from './infrastructure/services/GeminiAIService';
import { StoryGenerationService } from './domain/services/StoryGenerationService';
import { CreateCharacterUseCase } from './application/use-cases/CreateCharacterUseCase';
import { GetCharacterUseCase } from './application/use-cases/GetCharacterUseCase';
import { CombatUseCase } from './application/use-cases/CombatUseCase';
import { CreateStoryUseCase } from './application/use-cases/CreateStoryUseCase';
import { ContinueStoryUseCase } from './application/use-cases/ContinueStoryUseCase';
import { GetStoryUseCase } from './application/use-cases/GetStoryUseCase';
import { CharacterController } from './presentation/controllers/CharacterController';
import { StoryController } from './presentation/controllers/StoryController';
import { WebServer } from './presentation/web/server';

// Load environment variables
dotenv.config();

async function startWebServer(): Promise<void> {
  const diceService = DiceService.getInstance();
  const fileStorageService = new FileStorageService();
  const characterRepository = new FileCharacterRepository(fileStorageService);
  const storyRepository = new InMemoryStoryRepository();

  // Initialize AI service with a placeholder - will be configured via frontend
  const geminiApiKey = process.env.GEMINI_API_KEY || 'placeholder';
  let geminiAIService: GeminiAIService;
  let storyGenerationService: StoryGenerationService;
  
  try {
    geminiAIService = new GeminiAIService({ apiKey: geminiApiKey });
    storyGenerationService = new StoryGenerationService(geminiAIService);
  } catch (error) {
    console.log('⚠️  Gemini AI not configured. Stories will need API key from frontend.');
    // Create a dummy service that will be replaced when API key is provided
    geminiAIService = new GeminiAIService({ apiKey: 'dummy' });
    storyGenerationService = new StoryGenerationService(geminiAIService);
  }

  // Character use cases
  const createCharacterUseCase = new CreateCharacterUseCase(characterRepository);
  const getCharacterUseCase = new GetCharacterUseCase(characterRepository);
  const combatUseCase = new CombatUseCase(characterRepository, diceService);

  // Story use cases
  const createStoryUseCase = new CreateStoryUseCase(
    storyRepository,
    characterRepository,
    storyGenerationService
  );
  const continueStoryUseCase = new ContinueStoryUseCase(
    storyRepository,
    characterRepository,
    storyGenerationService
  );
  const getStoryUseCase = new GetStoryUseCase(storyRepository);

  // Controllers
  const characterController = new CharacterController(
    createCharacterUseCase,
    getCharacterUseCase,
    combatUseCase
  );

  const storyController = new StoryController(
    createStoryUseCase,
    continueStoryUseCase,
    getStoryUseCase
  );

  const webServer = new WebServer(characterController, storyController, 3000);
  await webServer.start();
}

if (require.main === module) {
  startWebServer().catch(console.error);
}