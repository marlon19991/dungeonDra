import { v4 as uuidv4 } from 'uuid';

export interface StoryChapter {
  id: string;
  content: string;
  playerAction?: string;
  options: string[];
  timestamp: Date;
  metadata?: {
    tokensUsed?: number;
    generationTime?: number;
  };
}

export interface StoryData {
  id?: string;
  title: string;
  characterIds: string[];
  chapters: StoryChapter[];
  currentChapterIndex: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Story {
  private readonly id: string;
  private title: string;
  private characterIds: string[];
  private chapters: StoryChapter[];
  private currentChapterIndex: number;
  private isActive: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(data: StoryData) {
    this.id = data.id || uuidv4();
    this.title = data.title;
    this.characterIds = [...data.characterIds];
    this.chapters = [...data.chapters];
    this.currentChapterIndex = data.currentChapterIndex;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.validate();
  }

  private validate(): void {
    if (!this.title || this.title.trim().length === 0) {
      throw new Error('Story title cannot be empty');
    }

    if (this.characterIds.length === 0) {
      throw new Error('Story must have at least one character');
    }

    if (this.currentChapterIndex < 0 || this.currentChapterIndex >= this.chapters.length) {
      if (this.chapters.length > 0) {
        throw new Error('Invalid current chapter index');
      }
    }
  }

  getId(): string { return this.id; }
  getTitle(): string { return this.title; }
  getCharacterIds(): string[] { return [...this.characterIds]; }
  getChapters(): StoryChapter[] { return [...this.chapters]; }
  getCurrentChapterIndex(): number { return this.currentChapterIndex; }
  getIsActive(): boolean { return this.isActive; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  getCurrentChapter(): StoryChapter | null {
    if (this.chapters.length === 0 || this.currentChapterIndex < 0) {
      return null;
    }
    return this.chapters[this.currentChapterIndex] || null;
  }

  addChapter(content: string, options: string[], playerAction?: string, metadata?: any): void {
    const chapter: StoryChapter = {
      id: uuidv4(),
      content,
      options,
      playerAction,
      timestamp: new Date(),
      metadata
    };

    this.chapters.push(chapter);
    this.currentChapterIndex = this.chapters.length - 1;
    this.updatedAt = new Date();
  }

  setPlayerAction(action: string): void {
    const currentChapter = this.getCurrentChapter();
    if (currentChapter) {
      currentChapter.playerAction = action;
      this.updatedAt = new Date();
    }
  }

  addCharacter(characterId: string): void {
    if (!this.characterIds.includes(characterId)) {
      this.characterIds.push(characterId);
      this.updatedAt = new Date();
    }
  }

  removeCharacter(characterId: string): void {
    const index = this.characterIds.indexOf(characterId);
    if (index > -1) {
      this.characterIds.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  setActive(active: boolean): void {
    this.isActive = active;
    this.updatedAt = new Date();
  }

  updateTitle(newTitle: string): void {
    if (!newTitle || newTitle.trim().length === 0) {
      throw new Error('Story title cannot be empty');
    }
    this.title = newTitle.trim();
    this.updatedAt = new Date();
  }

  getStoryText(): string {
    return this.chapters.map(chapter => chapter.content).join('\n\n');
  }

  getChapterCount(): number {
    return this.chapters.length;
  }

  canContinue(): boolean {
    const currentChapter = this.getCurrentChapter();
    return this.isActive && currentChapter !== null && currentChapter.options.length > 0;
  }

  equals(other: Story): boolean {
    return this.id === other.id;
  }

  clone(): Story {
    return new Story({
      id: this.id,
      title: this.title,
      characterIds: [...this.characterIds],
      chapters: this.chapters.map(chapter => ({ ...chapter })),
      currentChapterIndex: this.currentChapterIndex,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    });
  }
}