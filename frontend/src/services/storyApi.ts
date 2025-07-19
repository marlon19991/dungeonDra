import { Story, CreateStoryData, ContinueStoryData, AIConfiguration } from '../types/Story';

const API_BASE_URL = 'http://localhost:3000/api';

class StoryApiService {
  private geminiApiKey: string = '';

  setGeminiApiKey(apiKey: string): void {
    this.geminiApiKey = apiKey;
    localStorage.setItem('gemini-api-key', apiKey);
  }

  getGeminiApiKey(): string {
    if (!this.geminiApiKey) {
      this.geminiApiKey = localStorage.getItem('gemini-api-key') || '';
    }
    return this.geminiApiKey;
  }

  clearGeminiApiKey(): void {
    this.geminiApiKey = '';
    localStorage.removeItem('gemini-api-key');
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Gemini-API-Key': this.getGeminiApiKey(),
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getStories(): Promise<Story[]> {
    return this.fetch<Story[]>('/stories');
  }

  async getActiveStories(): Promise<Story[]> {
    return this.fetch<Story[]>('/stories/active');
  }

  async getStory(id: string): Promise<Story> {
    return this.fetch<Story>(`/stories/${id}`);
  }

  async getStoriesByCharacter(characterId: string): Promise<Story[]> {
    return this.fetch<Story[]>(`/stories/character/${characterId}`);
  }

  async createStory(data: CreateStoryData): Promise<Story> {
    return this.fetch<Story>('/stories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async continueStory(data: ContinueStoryData): Promise<Story> {
    return this.fetch<Story>(`/stories/${data.storyId}/continue`, {
      method: 'POST',
      body: JSON.stringify({
        selectedOption: data.selectedOption,
        customAction: data.customAction,
      }),
    });
  }

  async testAIConnection(): Promise<boolean> {
    try {
      const response = await this.fetch<{ connected: boolean }>('/ai/test-connection');
      return response.connected;
    } catch {
      return false;
    }
  }

  hasApiKey(): boolean {
    return this.getGeminiApiKey().length > 0;
  }
}

export const storyApiService = new StoryApiService();