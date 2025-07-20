# DungeonDra - API Routes Reference

## REST API Endpoints

### Base URL: `http://localhost:3000/api`

---

## Character Management

### `POST /characters`
**Purpose**: Create new D&D character
**Body**:
```json
{
  "name": "string",
  "characterClass": "fighter" | "wizard" | "rogue" | "cleric" | "ranger" | "barbarian" | "bard" | "druid" | "monk" | "paladin" | "sorcerer" | "warlock",
  "level": 1,
  "abilityScores": {
    "strength": 8-18,
    "dexterity": 8-18,
    "constitution": 8-18,
    "intelligence": 8-18,
    "wisdom": 8-18,
    "charisma": 8-18
  },
  "maxHitPoints": number,
  "armorClass": number,
  "experience": 0
}
```
**Response**: `CharacterData` with generated `id`
**Validation**: 
- Name required, non-empty
- Class must be valid D&D class
- Ability scores 8-18 range
- Level between 1-20

### `GET /characters`
**Purpose**: List all created characters
**Response**: `CharacterData[]`
**Use Case**: Character selection screen

### `GET /characters/:id`
**Purpose**: Get specific character details
**Response**: `CharacterData`
**Error**: 404 if character not found

### `PUT /characters/:id`
**Purpose**: Update character (healing, damage, XP)
**Body**: Partial `CharacterData`
**Use Case**: Combat aftermath, level up

---

## Combat System

### `POST /combat/attack`
**Purpose**: Perform attack between characters
**Body**:
```json
{
  "attackerId": "uuid",
  "targetId": "uuid"
}
```
**Response**:
```json
{
  "success": boolean,
  "damage": number,
  "criticalHit": boolean,
  "attackRoll": number,
  "targetAc": number
}
```

### `POST /combat/heal`
**Purpose**: Heal character
**Body**:
```json
{
  "characterId": "uuid",
  "healAmount": number
}
```
**Response**: Updated `CharacterData`

### `POST /combat/initiative`
**Purpose**: Roll initiative for combat
**Body**:
```json
{
  "characterId": "uuid"
}
```
**Response**:
```json
{
  "initiative": number,
  "dexterityModifier": number
}
```

---

## Story Generation (AI)

### `POST /stories`
**Purpose**: Start new AI-generated adventure
**Body**:
```json
{
  "characterIds": ["uuid"],
  "theme": "string?",
  "pacing": "rapido" | "detallado"
}
```
**Response**:
```json
{
  "id": "uuid",
  "story": "string",
  "options": ["string", "string", "string"],
  "diceRequests": [
    {
      "type": "ability" | "attack" | "damage" | "saving_throw" | "skill",
      "ability": "string",
      "difficulty": number,
      "description": "string",
      "diceNotation": "string"
    }
  ]
}
```

### `POST /stories/:id/continue`
**Purpose**: Continue story with player choice
**Body**:
```json
{
  "action": "string",
  "diceResult": number?
}
```
**Response**: Same as `POST /stories`

### `POST /stories/:id/custom`
**Purpose**: Continue story with custom player action
**Body**:
```json
{
  "customAction": "string"
}
```
**Response**: Same as `POST /stories`

### `GET /stories/:id`
**Purpose**: Retrieve story state
**Response**: Complete story data with history

---

## Health & Status

### `GET /health`
**Purpose**: Service health check
**Response**:
```json
{
  "status": "ok",
  "services": {
    "database": "ok",
    "ai": "ok" | "degraded" | "down"
  },
  "timestamp": "ISO string"
}
```

---

## Error Responses

### Standard Error Format:
```json
{
  "error": "string",
  "message": "Detailed error in Spanish",
  "code": "ERROR_CODE",
  "timestamp": "ISO string"
}
```

### Common HTTP Status Codes:
- `400`: Invalid request data
- `404`: Resource not found
- `422`: Validation failed
- `500`: Internal server error
- `503`: AI service unavailable

### AI Service Errors:
```json
{
  "error": "AI_UNAVAILABLE",
  "message": "El servicio de IA está temporalmente sobrecargado. Intenta nuevamente en unos minutos.",
  "retryAfter": 30,
  "fallback": {
    "story": "Story template",
    "options": ["Default option 1", "Default option 2", "Default option 3"]
  }
}
```

---

## Frontend API Service Example

```typescript
// src/services/api.ts
export const apiService = {
  async createCharacter(data: CreateCharacterDto): Promise<Character> {
    const response = await fetch('/api/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  },

  async startStory(characterIds: string[], theme?: string): Promise<Story> {
    const response = await fetch('/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterIds, theme, pacing: 'rapido' })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error creating story');
    }
    
    return response.json();
  }
};
```

---

**Rate Limiting**: Not implemented (local development)
**Authentication**: Not required (single-player)
**CORS**: Enabled for localhost:5173 (Vite dev server)