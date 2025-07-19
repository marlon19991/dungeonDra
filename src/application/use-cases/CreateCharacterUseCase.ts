import { Character } from '../../domain/entities/Character';
import { CharacterClassVO } from '../../domain/value-objects/CharacterClass';
import { AbilityScores } from '../../domain/value-objects/AbilityScores';
import { HitPoints } from '../../domain/value-objects/HitPoints';
import { ICharacterRepository } from '../../domain/repositories/ICharacterRepository';
import { CreateCharacterDto, CharacterResponseDto } from '../dtos/CreateCharacterDto';

export class CreateCharacterUseCase {
  constructor(private readonly characterRepository: ICharacterRepository) {}

  async execute(dto: CreateCharacterDto): Promise<CharacterResponseDto> {
    const characterClass = new CharacterClassVO(dto.characterClass);
    const abilityScores = new AbilityScores(dto.abilityScores);
    const hitPoints = new HitPoints(dto.maxHitPoints, dto.maxHitPoints);

    const character = new Character({
      name: dto.name,
      characterClass,
      level: dto.level,
      abilityScores,
      hitPoints,
      armorClass: dto.armorClass,
      experience: dto.experience
    });

    await this.characterRepository.save(character);

    return this.mapToResponseDto(character);
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