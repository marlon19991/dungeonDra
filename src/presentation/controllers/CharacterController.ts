import { CreateCharacterUseCase } from '../../application/use-cases/CreateCharacterUseCase';
import { GetCharacterUseCase } from '../../application/use-cases/GetCharacterUseCase';
import { CombatUseCase } from '../../application/use-cases/CombatUseCase';
import { CreateCharacterDto, CharacterResponseDto } from '../../application/dtos/CreateCharacterDto';

export class CharacterController {
  constructor(
    private readonly createCharacterUseCase: CreateCharacterUseCase,
    private readonly getCharacterUseCase: GetCharacterUseCase,
    private readonly combatUseCase: CombatUseCase
  ) {}

  async createCharacter(dto: CreateCharacterDto): Promise<CharacterResponseDto> {
    try {
      return await this.createCharacterUseCase.execute(dto);
    } catch (error) {
      throw new Error(`Failed to create character: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCharacter(id: string): Promise<CharacterResponseDto> {
    try {
      const character = await this.getCharacterUseCase.execute(id);
      if (!character) {
        throw new Error('Character not found');
      }
      return character;
    } catch (error) {
      throw new Error(`Failed to get character: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAllCharacters(): Promise<CharacterResponseDto[]> {
    try {
      return await this.getCharacterUseCase.getAllCharacters();
    } catch (error) {
      throw new Error(`Failed to get characters: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async performAttack(attackerId: string, targetId: string): Promise<any> {
    try {
      return await this.combatUseCase.performAttack(attackerId, targetId);
    } catch (error) {
      throw new Error(`Attack failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async healCharacter(characterId: string, healAmount: number): Promise<void> {
    try {
      await this.combatUseCase.healCharacter(characterId, healAmount);
    } catch (error) {
      throw new Error(`Healing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async rollInitiative(characterId: string): Promise<number> {
    try {
      return await this.combatUseCase.rollInitiative(characterId);
    } catch (error) {
      throw new Error(`Initiative roll failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}