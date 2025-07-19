import { Character } from '../../domain/entities/Character';
import { DiceService } from '../../domain/services/DiceService';
import { ICharacterRepository } from '../../domain/repositories/ICharacterRepository';

export interface AttackResult {
  success: boolean;
  damage: number;
  criticalHit: boolean;
  attackRoll: number;
  targetAc: number;
}

export class CombatUseCase {
  constructor(
    private readonly characterRepository: ICharacterRepository,
    private readonly diceService: DiceService
  ) {}

  async performAttack(attackerId: string, targetId: string): Promise<AttackResult> {
    const attacker = await this.characterRepository.findById(attackerId);
    const target = await this.characterRepository.findById(targetId);

    if (!attacker || !target) {
      throw new Error('Character not found');
    }

    if (!attacker.isAlive()) {
      throw new Error('Attacker is not alive');
    }

    if (!target.isAlive()) {
      throw new Error('Target is already dead');
    }

    const attackBonus = attacker.getAbilityScores().getModifier('strength');
    const attackCheck = this.diceService.rollAttack(attackBonus);
    const attackRoll = attackCheck.roll.total;
    const targetAc = target.getArmorClass();
    const criticalHit = attackCheck.roll.roll === 20;
    const success = attackRoll >= targetAc || criticalHit;

    let damage = 0;
    if (success) {
      const baseDamage = this.diceService.rollDamage(1, 8, attackBonus).total;
      damage = criticalHit ? baseDamage * 2 : baseDamage;
      target.takeDamage(damage);
      await this.characterRepository.update(target);
    }

    return {
      success,
      damage,
      criticalHit,
      attackRoll,
      targetAc
    };
  }

  async healCharacter(characterId: string, healAmount: number): Promise<void> {
    const character = await this.characterRepository.findById(characterId);
    
    if (!character) {
      throw new Error('Character not found');
    }

    character.heal(healAmount);
    await this.characterRepository.update(character);
  }

  async rollInitiative(characterId: string): Promise<number> {
    const character = await this.characterRepository.findById(characterId);
    
    if (!character) {
      throw new Error('Character not found');
    }

    const dexterityModifier = character.getAbilityScores().getModifier('dexterity');
    return this.diceService.rollInitiative(dexterityModifier);
  }
}