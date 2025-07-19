import { DiceService } from './domain/services/DiceService';
import { InMemoryCharacterRepository } from './infrastructure/repositories/InMemoryCharacterRepository';
import { FileStorageService } from './infrastructure/services/FileStorageService';
import { FileCharacterRepository } from './infrastructure/repositories/FileCharacterRepository';
import { CreateCharacterUseCase } from './application/use-cases/CreateCharacterUseCase';
import { GetCharacterUseCase } from './application/use-cases/GetCharacterUseCase';
import { CombatUseCase } from './application/use-cases/CombatUseCase';
import { CharacterGeneratorService } from './application/services/CharacterGeneratorService';
import { CharacterController } from './presentation/controllers/CharacterController';
import { GameCLI } from './presentation/cli/GameCLI';

export class DnDGameApplication {
  private characterController: CharacterController;
  private gameCLI: GameCLI;

  constructor(useFileStorage: boolean = true) {
    const diceService = DiceService.getInstance();
    
    const characterRepository = useFileStorage 
      ? new FileCharacterRepository(new FileStorageService())
      : new InMemoryCharacterRepository();

    const createCharacterUseCase = new CreateCharacterUseCase(characterRepository);
    const getCharacterUseCase = new GetCharacterUseCase(characterRepository);
    const combatUseCase = new CombatUseCase(characterRepository, diceService);
    const characterGenerator = new CharacterGeneratorService(diceService);

    this.characterController = new CharacterController(
      createCharacterUseCase,
      getCharacterUseCase,
      combatUseCase
    );

    this.gameCLI = new GameCLI(this.characterController, characterGenerator);
  }

  async start(): Promise<void> {
    await this.gameCLI.start();
  }

  getCharacterController(): CharacterController {
    return this.characterController;
  }
}

async function main(): Promise<void> {
  const app = new DnDGameApplication();
  await app.start();
}

if (require.main === module) {
  main().catch(console.error);
}