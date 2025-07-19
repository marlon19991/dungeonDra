import { Character, CreateCharacterData, AttackResult } from '../types/Character';

const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
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

  async getCharacters(): Promise<Character[]> {
    return this.fetch<Character[]>('/characters');
  }

  async getCharacter(id: string): Promise<Character> {
    return this.fetch<Character>(`/characters/${id}`);
  }

  async createCharacter(data: CreateCharacterData): Promise<Character> {
    return this.fetch<Character>('/characters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async performAttack(attackerId: string, targetId: string): Promise<AttackResult> {
    return this.fetch<AttackResult>(`/characters/${attackerId}/attack/${targetId}`, {
      method: 'POST',
    });
  }

  async healCharacter(id: string, healAmount: number): Promise<{ message: string }> {
    return this.fetch<{ message: string }>(`/characters/${id}/heal`, {
      method: 'POST',
      body: JSON.stringify({ healAmount }),
    });
  }

  async rollInitiative(id: string): Promise<{ initiative: number }> {
    return this.fetch<{ initiative: number }>(`/characters/${id}/initiative`, {
      method: 'POST',
    });
  }

  async getCharacterClasses(): Promise<string[]> {
    return this.fetch<string[]>('/character-classes');
  }

  async getHealth(): Promise<{ status: string; message: string }> {
    return this.fetch<{ status: string; message: string }>('/health');
  }
}

export const apiService = new ApiService();