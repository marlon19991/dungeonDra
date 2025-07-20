# DungeonDra - React Component Conventions

## Component Architecture Standards

### 🏗️ **Component Structure Template**

```typescript
// ComponentName.tsx
import React, { useState, useEffect } from 'react';
import './ComponentName.css'; // Co-located styles

interface ComponentNameProps {
  // Required props first
  requiredProp: string;
  
  // Optional props with defaults
  optionalProp?: number;
  onAction?: (data: ActionData) => void;
  
  // Boolean props with descriptive names
  isLoading?: boolean;
  hasError?: boolean;
  
  // Children when needed
  children?: React.ReactNode;
}

interface LocalState {
  // Define complex local state types
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  requiredProp,
  optionalProp = 0,
  onAction,
  isLoading = false,
  hasError = false,
  children
}) => {
  // State declarations
  const [localState, setLocalState] = useState<LocalState>({});
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // Event handlers
  const handleAction = (event: React.MouseEvent) => {
    event.preventDefault();
    onAction?.(data);
  };
  
  // Early returns for loading/error states
  if (isLoading) {
    return <div className="component-loading">Cargando...</div>;
  }
  
  if (hasError) {
    return <div className="component-error">Error al cargar componente</div>;
  }
  
  // Main render
  return (
    <div className="component-name">
      {/* Component content */}
    </div>
  );
};

export default ComponentName;
```

## 📁 **File Organization Rules**

### Component Categories:
```
/frontend/src/components/
├── dice/                    # Dice-related components
│   ├── DiceRoller.tsx
│   ├── RealisticDiceAnimation.tsx
│   └── InteractiveDiceRoller.tsx
├── character/               # Character management
│   ├── CharacterCard.tsx
│   └── CharacterCreation.tsx
├── story/                   # Story and narrative
│   ├── StoryOptionWithDice.tsx
│   └── DiceResultNarrator.tsx
└── ui/                      # Generic UI components
    ├── Button.tsx
    ├── Modal.tsx
    └── LoadingSpinner.tsx
```

### Naming Conventions:
- **Components**: `PascalCase` + descriptive names
- **Props**: `camelCase` with clear intent
- **Handlers**: `handle` prefix + action (`handleSubmit`, `handleDiceRoll`)
- **State**: Descriptive nouns (`currentValue`, `isAnimating`, `selectedOption`)
- **CSS Classes**: `kebab-case` matching component name

## 🎯 **Component Types & Responsibilities**

### 1. **Page Components** (`/pages/`)
**Purpose**: Top-level route components
**Characteristics**:
- Manage global page state
- Coordinate multiple feature components
- Handle navigation and routing
- No direct styling (compose other components)

```typescript
// pages/StoryMode.tsx
export const StoryMode: React.FC = () => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  
  return (
    <div className="story-mode-container">
      <CharacterSelector onSelect={setSelectedCharacter} />
      {selectedCharacter && (
        <StoryGenerator 
          character={selectedCharacter}
          onStoryCreated={setCurrentStory}
        />
      )}
      {currentStory && (
        <StoryDisplay story={currentStory} />
      )}
    </div>
  );
};
```

### 2. **Feature Components** (`/components/`)
**Purpose**: Encapsulate specific game features
**Characteristics**:
- Single responsibility (dice, character, story)
- Reusable across pages
- Self-contained with own styles
- Handle their own API calls

```typescript
// components/RealisticDiceAnimation.tsx
interface RealisticDiceAnimationProps {
  diceType: number;
  isRolling: boolean;
  finalValue?: number;
  modifier?: number;
  onRollComplete?: (result: number) => void;
  advantage?: boolean;
  disadvantage?: boolean;
  count?: number;
}
```

### 3. **UI Components** (`/components/ui/`)
**Purpose**: Generic, reusable interface elements
**Characteristics**:
- No game logic
- Highly reusable
- Consistent with design system
- Accept styling props

```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'success' | 'danger';
  size: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}
```

## 🔄 **State Management Patterns**

### Local State (useState):
- Component-specific data
- UI state (loading, error, form data)
- Animation states

### Prop Drilling (Acceptable for our scope):
- Character data between components
- Story state in StoryMode
- Dice results between components

### When NOT to use Context:
- Single-use data
- Temporary UI state
- Animation state

## 🎨 **Styling Guidelines**

### CSS Co-location:
```
ComponentName.tsx
ComponentName.css    # Styles specific to this component
```

### CSS Class Naming:
```css
/* Use component name as root class */
.realistic-dice-animation {
  /* Root styles */
}

.realistic-dice-animation__container {
  /* BEM-like child elements */
}

.realistic-dice-animation--rolling {
  /* BEM-like modifiers */
}

/* State classes */
.realistic-dice-animation.is-loading {
  /* State-based styles */
}
```

### Design Token Usage:
```css
/* Use design tokens from system.json */
.dice-container {
  background: var(--gradient-dice-container);
  border-radius: var(--border-radius-large);
  padding: var(--spacing-medium-s);
  box-shadow: var(--shadow-medium);
}
```

## 🧪 **Props Validation & TypeScript**

### Interface Design:
```typescript
// Good: Specific, descriptive props
interface DiceAnimationProps {
  diceType: 4 | 6 | 8 | 10 | 12 | 20 | 100;  // Explicit values
  isRolling: boolean;
  onRollComplete?: (result: number) => void;   // Optional callback
}

// Bad: Vague or overly generic
interface DiceProps {
  data: any;           // Never use 'any'
  callback: Function;  // Use specific function signatures
  config: object;      // Be specific about shape
}
```

### Default Props Pattern:
```typescript
export const DiceAnimation: React.FC<DiceAnimationProps> = ({
  diceType,
  isRolling,
  modifier = 0,        // Inline defaults
  advantage = false,
  disadvantage = false,
  count = 1,
  onRollComplete
}) => {
  // Component logic
};
```

## 🎮 **Game-Specific Patterns**

### D&D Data Flow:
```
Character Entity → Component Props → UI Display
User Action → Event Handler → Use Case → Entity Update
```

### Dice Animation Pattern:
```typescript
// Standard dice component interface
interface DiceComponentProps {
  diceType: DiceType;
  isRolling: boolean;
  finalValue?: number;
  modifier?: number;
  onRollComplete?: (result: number) => void;
  
  // D&D specific
  advantage?: boolean;
  disadvantage?: boolean;
  
  // Animation control
  animationSpeed?: 'fast' | 'normal' | 'slow';
}
```

### Story Component Pattern:
```typescript
// Standard story interaction interface
interface StoryComponentProps {
  story: Story;
  character: Character;
  onOptionSelected: (optionIndex: number) => void;
  onCustomAction: (action: string) => void;
  isGenerating?: boolean;
}
```

## 🚨 **Error Handling in Components**

### Error Boundary Usage:
```typescript
// Wrap risky components
<ErrorBoundary fallback={<ErrorFallback />}>
  <RealisticDiceAnimation {...props} />
</ErrorBoundary>
```

### Error State Handling:
```typescript
const [error, setError] = useState<string | null>(null);

// Handle errors gracefully
try {
  await apiCall();
} catch (err) {
  setError('No se pudo completar la acción. Intenta nuevamente.');
}

// Display errors in Spanish
{error && (
  <div className="component-error">
    ⚠️ {error}
  </div>
)}
```

## 🔍 **Performance Guidelines**

### Memo Usage:
```typescript
// Memoize expensive components
export const DiceAnimation = React.memo<DiceAnimationProps>(({ 
  diceType, 
  isRolling 
}) => {
  // Component logic
}, (prevProps, nextProps) => {
  // Custom comparison if needed
  return prevProps.diceType === nextProps.diceType &&
         prevProps.isRolling === nextProps.isRolling;
});
```

### useCallback for Event Handlers:
```typescript
const handleDiceRoll = useCallback((result: number) => {
  onRollComplete?.(result);
}, [onRollComplete]);
```

### Avoid Re-renders:
- Memoize complex calculations
- Use useCallback for functions passed as props
- Split large components into smaller ones
- Move static data outside components

## 📝 **Documentation Standards**

### Component Documentation:
```typescript
/**
 * RealisticDiceAnimation - 3D animated dice with D&D mechanics
 * 
 * Features:
 * - Physical animation simulation
 * - Support for all D&D dice types
 * - Advantage/Disadvantage rolling
 * - Critical success/failure detection
 * 
 * @example
 * <RealisticDiceAnimation
 *   diceType={20}
 *   isRolling={isRolling}
 *   onRollComplete={(result) => setResult(result)}
 *   advantage={hasAdvantage}
 * />
 */
```

### Props Documentation:
```typescript
interface DiceAnimationProps {
  /** Type of dice to roll (4, 6, 8, 10, 12, 20, 100) */
  diceType: number;
  
  /** Whether the dice should be animating */
  isRolling: boolean;
  
  /** Optional predetermined result for testing */
  finalValue?: number;
  
  /** Callback fired when animation completes */
  onRollComplete?: (result: number) => void;
}
```

---

## ✅ **Validation Checklist**

Before submitting a component:
- [ ] TypeScript interfaces defined and exported
- [ ] Props have sensible defaults
- [ ] Error states handled gracefully
- [ ] CSS classes follow naming convention
- [ ] No hardcoded strings (use Spanish)
- [ ] Accessible markup (alt text, ARIA labels)
- [ ] Performance optimized (memo, useCallback if needed)
- [ ] Follows single responsibility principle
- [ ] Design tokens used for colors/spacing
- [ ] Loading states implemented where needed

---

**Last Updated**: When component patterns change significantly
**Review Cycle**: Every new component should follow these conventions