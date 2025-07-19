import * as readline from 'readline';
import { CharacterController } from '../controllers/CharacterController';
import { CharacterGeneratorService } from '../../application/services/CharacterGeneratorService';
import { CharacterClass } from '../../domain/value-objects/CharacterClass';

export class GameCLI {
  private rl: readline.Interface;

  constructor(
    private readonly characterController: CharacterController,
    private readonly characterGenerator: CharacterGeneratorService
  ) {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async start(): Promise<void> {
    console.log('🐉 Welcome to Dungeons & Dragons Game! 🐉');
    console.log('=====================================');
    await this.showMenu();
  }

  private async showMenu(): Promise<void> {
    console.log('\n📋 Main Menu:');
    console.log('1. Create Character');
    console.log('2. Generate Random Character');
    console.log('3. List All Characters');
    console.log('4. View Character Details');
    console.log('5. Combat System');
    console.log('6. Exit');

    const choice = await this.getInput('Choose an option (1-6): ');
    await this.handleMenuChoice(choice);
  }

  private async handleMenuChoice(choice: string): Promise<void> {
    switch (choice.trim()) {
      case '1':
        await this.createCharacterFlow();
        break;
      case '2':
        await this.generateRandomCharacter();
        break;
      case '3':
        await this.listAllCharacters();
        break;
      case '4':
        await this.viewCharacterDetails();
        break;
      case '5':
        await this.combatMenu();
        break;
      case '6':
        console.log('Thanks for playing! 🎲');
        this.rl.close();
        return;
      default:
        console.log('Invalid option. Please try again.');
    }
    
    if (choice.trim() !== '6') {
      await this.showMenu();
    }
  }

  private async createCharacterFlow(): Promise<void> {
    console.log('\n🧙 Creating a new character...');
    
    const name = await this.getInput('Character name: ');
    
    console.log('\nAvailable classes:');
    Object.values(CharacterClass).forEach((cls, index) => {
      console.log(`${index + 1}. ${cls.charAt(0).toUpperCase() + cls.slice(1)}`);
    });
    
    const classChoice = await this.getInput('Choose class (1-12): ');
    const characterClass = Object.values(CharacterClass)[parseInt(classChoice) - 1];
    
    if (!characterClass) {
      console.log('Invalid class choice.');
      return;
    }

    const generatedData = this.characterGenerator.generateOptimalCharacterForClass(characterClass);
    
    try {
      const character = await this.characterController.createCharacter({
        name,
        characterClass,
        level: 1,
        abilityScores: generatedData.abilityScores,
        maxHitPoints: generatedData.hitPoints,
        armorClass: 10 + Math.floor((generatedData.abilityScores.dexterity - 10) / 2),
        experience: 0
      });

      console.log(`\n✅ Character created successfully!`);
      this.displayCharacter(character);
    } catch (error) {
      console.log(`❌ Error creating character: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateRandomCharacter(): Promise<void> {
    console.log('\n🎲 Generating random character...');
    
    const name = await this.getInput('Character name: ');
    const generatedData = this.characterGenerator.generateRandomCharacter();
    
    try {
      const character = await this.characterController.createCharacter({
        name,
        characterClass: generatedData.characterClass,
        level: 1,
        abilityScores: generatedData.abilityScores,
        maxHitPoints: generatedData.hitPoints,
        armorClass: 10 + Math.floor((generatedData.abilityScores.dexterity - 10) / 2),
        experience: 0
      });

      console.log(`\n✅ Random character generated!`);
      this.displayCharacter(character);
    } catch (error) {
      console.log(`❌ Error generating character: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async listAllCharacters(): Promise<void> {
    try {
      const characters = await this.characterController.getAllCharacters();
      
      if (characters.length === 0) {
        console.log('\n📋 No characters found.');
        return;
      }

      console.log('\n📋 All Characters:');
      characters.forEach((char, index) => {
        console.log(`${index + 1}. ${char.name} (${char.characterClass}, Level ${char.level}) - ${char.isAlive ? '💚 Alive' : '💀 Dead'}`);
      });
    } catch (error) {
      console.log(`❌ Error listing characters: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async viewCharacterDetails(): Promise<void> {
    const characterId = await this.getInput('Enter character ID: ');
    
    try {
      const character = await this.characterController.getCharacter(characterId);
      this.displayCharacter(character);
    } catch (error) {
      console.log(`❌ Error viewing character: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async combatMenu(): Promise<void> {
    console.log('\n⚔️ Combat Menu:');
    console.log('1. Attack');
    console.log('2. Heal Character');
    console.log('3. Roll Initiative');
    console.log('4. Back to Main Menu');

    const choice = await this.getInput('Choose an option (1-4): ');

    switch (choice.trim()) {
      case '1':
        await this.performAttack();
        break;
      case '2':
        await this.healCharacter();
        break;
      case '3':
        await this.rollInitiative();
        break;
      case '4':
        return;
      default:
        console.log('Invalid option.');
    }
  }

  private async performAttack(): Promise<void> {
    const attackerId = await this.getInput('Attacker ID: ');
    const targetId = await this.getInput('Target ID: ');
    
    try {
      const result = await this.characterController.performAttack(attackerId, targetId);
      
      console.log(`\n⚔️ Attack Result:`);
      console.log(`Roll: ${result.attackRoll} vs AC ${result.targetAc}`);
      console.log(`Hit: ${result.success ? 'YES' : 'NO'}`);
      if (result.success) {
        console.log(`Damage: ${result.damage}`);
        console.log(`Critical Hit: ${result.criticalHit ? 'YES' : 'NO'}`);
      }
    } catch (error) {
      console.log(`❌ Attack failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async healCharacter(): Promise<void> {
    const characterId = await this.getInput('Character ID to heal: ');
    const healAmount = parseInt(await this.getInput('Heal amount: '));
    
    try {
      await this.characterController.healCharacter(characterId, healAmount);
      console.log(`✅ Character healed for ${healAmount} HP!`);
    } catch (error) {
      console.log(`❌ Healing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async rollInitiative(): Promise<void> {
    const characterId = await this.getInput('Character ID: ');
    
    try {
      const initiative = await this.characterController.rollInitiative(characterId);
      console.log(`🎲 Initiative roll: ${initiative}`);
    } catch (error) {
      console.log(`❌ Initiative roll failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private displayCharacter(character: any): void {
    console.log(`\n🧙 Character Details:`);
    console.log(`ID: ${character.id}`);
    console.log(`Name: ${character.name}`);
    console.log(`Class: ${character.characterClass}`);
    console.log(`Level: ${character.level}`);
    console.log(`HP: ${character.hitPoints.current}/${character.hitPoints.max}`);
    console.log(`AC: ${character.armorClass}`);
    console.log(`Experience: ${character.experience}`);
    console.log(`Status: ${character.isAlive ? '💚 Alive' : '💀 Dead'}`);
    console.log(`\n📊 Ability Scores:`);
    console.log(`STR: ${character.abilityScores.strength} | DEX: ${character.abilityScores.dexterity} | CON: ${character.abilityScores.constitution}`);
    console.log(`INT: ${character.abilityScores.intelligence} | WIS: ${character.abilityScores.wisdom} | CHA: ${character.abilityScores.charisma}`);
  }

  private getInput(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        resolve(answer);
      });
    });
  }
}