import * as fs from 'fs/promises';
import * as path from 'path';
import { CharacterPersistenceModel } from '../data/CharacterData';

export class FileStorageService {
  private readonly dataPath: string;

  constructor(dataPath: string = './data') {
    this.dataPath = dataPath;
  }

  async saveCharacters(characters: Map<string, CharacterPersistenceModel>): Promise<void> {
    await this.ensureDataDirectory();
    const charactersArray = Array.from(characters.values());
    const filePath = path.join(this.dataPath, 'characters.json');
    await fs.writeFile(filePath, JSON.stringify(charactersArray, null, 2));
  }

  async loadCharacters(): Promise<Map<string, CharacterPersistenceModel>> {
    const filePath = path.join(this.dataPath, 'characters.json');
    const characters = new Map<string, CharacterPersistenceModel>();

    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const charactersArray: CharacterPersistenceModel[] = JSON.parse(data);
      
      for (const character of charactersArray) {
        characters.set(character.id, character);
      }
    } catch (error) {
      console.log('No existing character data found, starting with empty repository');
    }

    return characters;
  }

  async saveGameSession(sessionData: any): Promise<void> {
    await this.ensureDataDirectory();
    const filePath = path.join(this.dataPath, `session-${Date.now()}.json`);
    await fs.writeFile(filePath, JSON.stringify(sessionData, null, 2));
  }

  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.access(this.dataPath);
    } catch {
      await fs.mkdir(this.dataPath, { recursive: true });
    }
  }

  async backupData(): Promise<string> {
    const backupPath = path.join(this.dataPath, 'backups');
    await fs.mkdir(backupPath, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupPath, `backup-${timestamp}.json`);
    
    const characters = await this.loadCharacters();
    const charactersArray = Array.from(characters.values());
    
    await fs.writeFile(backupFile, JSON.stringify(charactersArray, null, 2));
    return backupFile;
  }
}