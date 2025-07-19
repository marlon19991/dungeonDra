# 🐉 Dungeons & Dragons Game

A Dungeons & Dragons game implementation built with **Clean Architecture** and **SOLID principles** using TypeScript.

## 🏗️ Architecture

This project follows Clean Architecture principles with clear separation of concerns:

```
src/
├── domain/                 # Enterprise Business Rules
│   ├── entities/           # Core business entities
│   ├── value-objects/      # Value objects with business rules
│   ├── repositories/       # Repository interfaces
│   └── services/           # Domain services
├── application/            # Application Business Rules
│   ├── use-cases/          # Application-specific business rules
│   ├── services/           # Application services
│   └── dtos/              # Data Transfer Objects
├── infrastructure/         # Frameworks & Drivers
│   ├── repositories/       # Repository implementations
│   ├── services/          # External services
│   └── data/              # Data models
└── presentation/           # Interface Adapters
    ├── controllers/        # Controllers
    ├── cli/               # Command Line Interface
    └── dtos/              # Presentation DTOs
```

## 🎯 SOLID Principles Implementation

- **Single Responsibility Principle (SRP)**: Each class has a single reason to change
- **Open/Closed Principle (OCP)**: Classes are open for extension, closed for modification
- **Liskov Substitution Principle (LSP)**: Derived classes are substitutable for base classes
- **Interface Segregation Principle (ISP)**: Clients depend only on interfaces they use
- **Dependency Inversion Principle (DIP)**: High-level modules don't depend on low-level modules

## 🚀 Features

- **Character Creation**: Create D&D characters with all core attributes
- **Random Character Generation**: Generate characters with optimal stats for classes
- **Combat System**: Perform attacks, healing, and initiative rolls
- **Persistent Storage**: Save characters to file system or use in-memory storage
- **CLI Interface**: Interactive command-line interface for gameplay
- **Dice Rolling**: Full D&D dice system (d4, d6, d8, d10, d12, d20, d100)

## 📦 Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Run the built application
npm start
```

## 🎮 Usage

### Starting the Game

```bash
npm run dev
```

This will start the interactive CLI where you can:

1. Create custom characters
2. Generate random characters
3. View character details
4. Engage in combat
5. Roll dice for various actions

### Programmatic Usage

```typescript
import { DnDGameApplication } from './src/main';

const app = new DnDGameApplication();
const controller = app.getCharacterController();

// Create a character
const character = await controller.createCharacter({
  name: "Aragorn",
  characterClass: CharacterClass.RANGER,
  level: 1,
  abilityScores: {
    strength: 16,
    dexterity: 14,
    constitution: 13,
    intelligence: 12,
    wisdom: 15,
    charisma: 11
  },
  maxHitPoints: 12,
  armorClass: 14,
  experience: 0
});
```

## 🧪 Testing

```bash
# Run tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 🏛️ Design Patterns Used

- **Repository Pattern**: For data access abstraction
- **Factory Pattern**: For character and dice creation
- **Singleton Pattern**: For dice service
- **Strategy Pattern**: For different repository implementations
- **Dependency Injection**: Throughout the application layers

## 📋 Core Game Features

### Character Classes
- Fighter, Wizard, Rogue, Cleric
- Ranger, Barbarian, Bard, Druid
- Monk, Paladin, Sorcerer, Warlock

### Ability Scores
- Strength, Dexterity, Constitution
- Intelligence, Wisdom, Charisma
- Automatic modifier calculation

### Combat System
- Attack rolls with modifiers
- Damage calculation
- Critical hit system
- Initiative rolling
- Healing mechanics

### Dice System
- Support for all D&D dice types
- Advantage/disadvantage rolling
- Multiple dice rolling
- Damage calculation

## 🔧 Configuration

The application supports both file-based and in-memory storage:

```typescript
// Use file storage (default)
const app = new DnDGameApplication(true);

// Use in-memory storage
const app = new DnDGameApplication(false);
```

## 📂 Data Storage

Character data is automatically saved to `./data/characters.json` when using file storage. Backup functionality is also available.

## 🤝 Contributing

This project demonstrates clean architecture principles. When contributing:

1. Follow the existing layer structure
2. Maintain SOLID principles
3. Add appropriate tests
4. Update documentation

## 📄 License

MIT License - see LICENSE file for details.

## 🎲 Game Rules

This implementation follows basic D&D 5e rules for:
- Character creation
- Ability score generation
- Combat mechanics
- Dice rolling conventions

---

Built with ❤️ and TypeScript for learning Clean Architecture and SOLID principles.