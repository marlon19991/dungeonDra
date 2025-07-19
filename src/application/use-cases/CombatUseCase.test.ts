import assert from 'assert';
import { CombatUseCase } from './CombatUseCase';
import { InMemoryCharacterRepository } from '../../infrastructure/repositories/InMemoryCharacterRepository';
import { DiceService } from '../../domain/services/DiceService';
import { Character } from '../../domain/entities/Character';
import { CharacterClassVO, CharacterClass } from '../../domain/value-objects/CharacterClass';
import { AbilityScores } from '../../domain/value-objects/AbilityScores';
import { HitPoints } from '../../domain/value-objects/HitPoints';

(async () => {
  const repo = new InMemoryCharacterRepository();
  const dice = DiceService.getInstance();
  const useCase = new CombatUseCase(repo, dice);

  const attacker = new Character({
    name: 'Attacker',
    characterClass: new CharacterClassVO(CharacterClass.FIGHTER),
    level: 1,
    abilityScores: new AbilityScores({
      strength: 18,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    }),
    hitPoints: new HitPoints(10, 10),
    armorClass: 10,
    experience: 0,
  });

  const target = new Character({
    name: 'Target',
    characterClass: new CharacterClassVO(CharacterClass.FIGHTER),
    level: 1,
    abilityScores: new AbilityScores({
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    }),
    hitPoints: new HitPoints(10, 10),
    armorClass: 10,
    experience: 0,
  });

  await repo.save(attacker);
  await repo.save(target);

  const result = await useCase.performAttack(attacker.getId(), target.getId());

  assert.ok(result.attackRoll >= 1 && result.attackRoll <= 40);
  assert.strictEqual(result.targetAc, 10);
  console.log('CombatUseCase test passed');
})();
