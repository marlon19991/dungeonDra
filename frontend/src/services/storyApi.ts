import { Story, CreateStoryData, ContinueStoryData } from '../types/Story';

const API_BASE_URL = 'http://localhost:3000/api';

type RequestInit = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

class StoryApiService {
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
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

}

export const storyApiService = new StoryApiService();