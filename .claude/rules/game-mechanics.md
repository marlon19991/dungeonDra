# DungeonDra - D&D Game Mechanics Reference

## Core D&D 5e Rules Implementation

### Ability Scores & Modifiers

**Score Range**: 8-18 (standard array + racial bonuses)
**Modifier Calculation**: `Math.floor((score - 10) / 2)`

```typescript
// Examples:
// Score 8  → Modifier -1
// Score 10 → Modifier  0  
// Score 16 → Modifier +3
// Score 18 → Modifier +4
```

**Ability Score Usage**:
- **Strength**: Attack/damage (melee), Athletics checks
- **Dexterity**: Attack/damage (ranged/finesse), AC, Initiative, Stealth
- **Constitution**: Hit Points, Constitution saves
- **Intelligence**: Investigation, Arcana, History
- **Wisdom**: Perception, Insight, Survival, Medicine
- **Charisma**: Persuasion, Deception, Intimidation, Performance

---

## Character Classes

### Implemented Classes (12):
1. **Fighter**: Simple, versatile warrior
2. **Wizard**: Intelligence-based spellcaster
3. **Rogue**: Dexterity-based skill specialist
4. **Cleric**: Wisdom-based divine caster
5. **Ranger**: Nature warrior with tracking
6. **Barbarian**: Strength-based berserker
7. **Bard**: Charisma-based support caster
8. **Druid**: Wisdom-based nature caster
9. **Monk**: Dexterity/Wisdom unarmed fighter
10. **Paladin**: Charisma-based holy warrior
11. **Sorcerer**: Charisma-based innate caster
12. **Warlock**: Charisma-based pact caster

### Class-Specific Mechanics:
```typescript
interface ClassSkills {
  [className: string]: SkillName[];
}

// Example: Fighter gets Athletics, Intimidation by default
const fighterSkills = ['athletics', 'intimidation'];
```

---

## Dice System

### Dice Types Supported:
- **d4**: Tetrahedron (1-4)
- **d6**: Cube (1-6) - Standard damage die
- **d8**: Octahedron (1-8) - Longsword damage
- **d10**: Pentagonal trapezohedron (1-10)
- **d12**: Dodecahedron (1-12) - Greataxe damage
- **d20**: Icosahedron (1-20) - All ability checks
- **d100**: Percentile (1-100) - Rare events

### Critical Rules:
- **Natural 20**: Automatic success on attack rolls, double damage
- **Natural 1**: Automatic failure on attack rolls
- **Ability Checks**: No auto-success/failure (only attacks and saves)

### Advantage/Disadvantage:
```typescript
// Advantage: Roll 2d20, take higher
// Disadvantage: Roll 2d20, take lower
// Never stacks (multiple advantages = single advantage)
```

---

## Combat Mechanics

### Attack Resolution:
1. **Attack Roll**: `1d20 + ability modifier + proficiency bonus`
2. **Compare to AC**: Hit if attack roll ≥ target's Armor Class
3. **Damage Roll**: Weapon die + ability modifier
4. **Critical Hit**: Natural 20 → double the damage dice (not modifiers)

### Initiative:
- **Roll**: `1d20 + Dexterity modifier`
- **Order**: Highest to lowest
- **Ties**: Player characters go before NPCs

### Hit Points:
- **Maximum**: `Hit Die + Constitution modifier` per level
- **Current**: Reduced by damage, increased by healing
- **Unconscious**: 0 HP
- **Death**: Varies by implementation (instant death at -max HP)

---

## Skill System

### Skill Check Resolution:
1. **Roll**: `1d20 + ability modifier + proficiency bonus (if proficient)`
2. **Difficulty Classes**:
   - **Very Easy**: DC 5
   - **Easy**: DC 10
   - **Medium**: DC 15
   - **Hard**: DC 20
   - **Very Hard**: DC 25
   - **Nearly Impossible**: DC 30

### Proficiency Bonus by Level:
```typescript
const getProficiencyBonus = (level: number): number => {
  return Math.ceil(level / 4) + 1;
  // Level 1-4: +2
  // Level 5-8: +3  
  // Level 9-12: +4
  // Level 13-16: +5
  // Level 17-20: +6
}
```

### Skill List:
- **Athletics** (Str): Climbing, jumping, swimming
- **Acrobatics** (Dex): Balance, tumbling
- **Stealth** (Dex): Hiding, moving silently
- **Perception** (Wis): Spotting hidden things
- **Investigation** (Int): Searching for clues
- **Persuasion** (Cha): Convincing others
- **Intimidation** (Cha): Threatening others
- **Deception** (Cha): Lying convincingly

---

## Story Integration Rules

### When to Request Dice Rolls:
1. **Uncertain Outcomes**: When success isn't guaranteed
2. **Meaningful Consequences**: When failure creates interesting story
3. **Character Agency**: When player choice matters
4. **Appropriate Difficulty**: Match DC to narrative stakes

### Dice Request Format:
```typescript
interface DiceRequest {
  type: 'ability' | 'attack' | 'damage' | 'saving_throw' | 'skill';
  ability?: string;        // 'strength', 'dexterity', etc.
  skill?: string;          // 'athletics', 'perception', etc.
  difficulty: number;      // DC for the roll
  description: string;     // Why this roll is needed
  diceNotation: string;    // '1d20+3', '2d6+1', etc.
}
```

### Story Pacing with Dice:
- **Fast Pacing**: Simple DC 12-15, quick resolution
- **Detailed Pacing**: Complex scenarios, multiple rolls, DC 10-20
- **Dramatic Moments**: High stakes, DC 15-20, advantage/disadvantage

---

## AI Story Generation Rules

### Narrative Constraints:
1. **Always in Spanish**: NPCs, locations, descriptions
2. **D&D Fantasy Setting**: Medieval, magic exists, classic races
3. **Character-Appropriate**: Use character class and stats
4. **Consequence-Driven**: Player choices matter, failures advance story
5. **Dice-Integrated**: Every option should suggest a relevant roll

### Story Structure:
```
1. Setup (1-2 sentences)
2. Current Situation (2-3 sentences)  
3. Immediate Decision Point
4. Three Distinct Options with Dice Requirements
```

### Option Design:
- **Option 1**: Direct/Combat approach (Strength/Dexterity based)
- **Option 2**: Social/Diplomatic approach (Charisma based)
- **Option 3**: Clever/Investigation approach (Intelligence/Wisdom based)

---

## Validation Rules

### Character Creation:
```typescript
// Required validations in Character entity
- Name: Non-empty string
- Level: 1-20 range
- Ability Scores: 8-18 range (each)
- Hit Points: Positive number
- Armor Class: Non-negative
- Experience: Non-negative
```

### Combat Validation:
```typescript
// Required checks in CombatUseCase
- Attacker must be alive
- Target must exist and be alive
- Attack bonus calculation must be accurate
- Damage must be applied correctly
- Critical hits must double damage dice only
```

### Story Validation:
```typescript
// Required checks in StoryGenerationService
- Character IDs must exist
- Dice requests must have valid DCs (5-30)
- Options must be in Spanish
- Fallback content must be available
```

---

## Error Handling in Game Context

### Combat Errors:
- **Character Not Found**: "Personaje no encontrado"
- **Character Dead**: "El personaje no puede actuar (está inconsciente)"
- **Invalid Target**: "Objetivo no válido para esta acción"

### Story Errors:
- **AI Unavailable**: "El narrador está descansando. Intenta en unos minutos."
- **Invalid Action**: "Esa acción no es posible en esta situación"
- **Malformed Request**: "No se pudo procesar la solicitud"

### Dice Errors:
- **Invalid Die Type**: "Tipo de dado no válido"
- **Invalid Modifier**: "Modificador debe ser un número"
- **Animation Failed**: "Error en animación (usando resultado simple)"

---

**Reference**: Based on D&D 5e System Reference Document (SRD)
**Scope**: Core mechanics only, no advanced features (multiclassing, feats, etc.)
**Updates**: When core game rules change or new mechanics added