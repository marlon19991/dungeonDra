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

  // Initialize AI service from .env file
  const geminiApiKey = process.env.GEMINI_API_KEY;
  
  if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
    console.log('❌ GEMINI_API_KEY not configured in .env file');
    console.log('📝 Please add your Gemini API key to the .env file:');
    console.log('   GEMINI_API_KEY=your_actual_api_key_here');
    process.exit(1);
  }

  const geminiAIService = new GeminiAIService({ apiKey: geminiApiKey });
  const storyGenerationService = new StoryGenerationService(geminiAIService);

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