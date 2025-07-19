import { ICharacterRepository } from '../../domain/repositories/ICharacterRepository';
import { CharacterResponseDto } from '../dtos/CreateCharacterDto';
import { Character } from '../../domain/entities/Character';

export class GetCharacterUseCase {
  constructor(private readonly characterRepository: ICharacterRepository) {}

  async execute(id: string): Promise<CharacterResponseDto | null> {
    const character = await this.characterRepository.findById(id);
    
    if (!character) {
      return null;
    }

    return this.mapToResponseDto(character);
  }

  async getAllCharacters(): Promise<CharacterResponseDto[]> {
    const characters = await this.characterRepository.findAll();
    return characters.map(character => this.mapToResponseDto(character));
  }

  private mapToResponseDto(character: Character): CharacterResponseDto {
    return {
      id: character.getId(),
      name: character.getName(),
      characterClass: character.getCharacterClass().getValue(),
      level: character.getLevel(),
      abilityScores: {
        strength: character.getAbilityScores().getStrength(),
        dexterity: character.getAbilityScores().getDexterity(),
        constitution: character.getAbilityScores().getConstitution(),
        intelligence: character.getAbilityScores().getIntelligence(),
        wisdom: character.getAbilityScores().getWisdom(),
        charisma: character.getAbilityScores().getCharisma()
      },
      hitPoints: {
        current: character.getHitPoints().getCurrentHp(),
        max: character.getHitPoints().getMaxHp()
      },
      armorClass: character.getArmorClass(),
      experience: character.getExperience(),
      isAlive: character.isAlive()
    };
  }
}