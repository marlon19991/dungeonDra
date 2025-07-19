import { DiceService } from './domain/services/DiceService';
import { FileStorageService } from './infrastructure/services/FileStorageService';
import { FileCharacterRepository } from './infrastructure/repositories/FileCharacterRepository';
import { CreateCharacterUseCase } from './application/use-cases/CreateCharacterUseCase';
import { GetCharacterUseCase } from './application/use-cases/GetCharacterUseCase';
import { CombatUseCase } from './application/use-cases/CombatUseCase';
import { CharacterController } from './presentation/controllers/CharacterController';
import { WebServer } from './presentation/web/server';

async function startWebServer(): Promise<void> {
  const diceService = DiceService.getInstance();
  const fileStorageService = new FileStorageService();
  const characterRepository = new FileCharacterRepository(fileStorageService);

  const createCharacterUseCase = new CreateCharacterUseCase(characterRepository);
  const getCharacterUseCase = new GetCharacterUseCase(characterRepository);
  const combatUseCase = new CombatUseCase(characterRepository, diceService);

  const characterController = new CharacterController(
    createCharacterUseCase,
    getCharacterUseCase,
    combatUseCase
  );

  const webServer = new WebServer(characterController, 3000);
  await webServer.start();
}

if (require.main === module) {
  startWebServer().catch(console.error);
}