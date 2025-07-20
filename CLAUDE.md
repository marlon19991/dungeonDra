# DungeonDra - Context Stack para Claude Code

## Product Goal

**Problema que resuelve:**
DungeonDra democratiza el acceso a aventuras de Dungeons & Dragons eliminando las barreras tradicionales: la necesidad de un Dungeon Master experimentado, reglas complejas y sesiones coordinadas. Permite a jugadores individuales o grupos disfrutar aventuras D&D completas con narrativa inteligente generada por IA.

**Métricas clave:**
- Tiempo de setup: <5 minutos (crear personaje + iniciar aventura)
- Engagement: >20 minutos promedio por sesión de juego
- Retención: Usuarios completan al menos 3 aventuras
- Satisfacción: Narrativas coherentes y envolventes en español
- Performance: Animaciones de dados fluidas a 60fps
- Disponibilidad: 99.9% uptime del servicio IA

## Key Features

### 🎯 **Características Indispensables:**

1. **Gestión Completa de Personajes D&D**
   - Creación con las 12 clases oficiales
   - Sistema completo de habilidades y stats
   - Validación automática de reglas D&D 5e
   - Persistencia local segura

2. **Sistema de Dados Realista e Inmersivo**
   - Animaciones 3D físicamente precisas
   - Soporte completo d4, d6, d8, d10, d12, d20, d100
   - Ventaja/Desventaja automática
   - Feedback visual y narrativo del resultado

3. **Generación de Historias con IA**
   - Narrativa dinámica adaptativa con Gemini AI
   - Historias 100% en español con NPCs localizados
   - Sistema de reintentos para garantizar disponibilidad
   - Opciones de acción con tiradas automáticas

4. **Sistema de Combate Táctico**
   - Mecánicas completas D&D 5e (ataque, daño, AC)
   - Iniciativa automática
   - Críticos y fallos críticos
   - Estados de personaje (herido, KO, muerto)

## User Flow

### 🎮 **Flujo Principal Paso a Paso:**

```
1. ENTRADA → Aplicación web localhost:3000
   ↓
2. GESTIÓN → Lista de personajes existentes
   ↓ [Si no hay personajes]
3. CREACIÓN → Formulario personaje (nombre, clase, stats)
   ↓ [Validación automática D&D]
4. LISTA → Visualización personajes creados
   ↓ [Seleccionar personaje]
5. MODO HISTORIA → Iniciar nueva aventura
   ↓ [Configuración: tema, ritmo]
6. GENERACIÓN IA → Historia inicial + 3 opciones acción
   ↓ [Cada opción tiene dados específicos]
7. DECISIÓN → Usuario elige opción o escribe acción custom
   ↓ [Sistema detecta tiradas necesarias]
8. DADOS → Animación 3D realista + resultado
   ↓ [Feedback narrativo del resultado]
9. CONTINUACIÓN → IA adapta historia según resultado
   ↓ [Loop infinito]
10. ESCALATION → Nuevas opciones basadas en desarrollo
```

### 🔄 **Flujos Secundarios:**
- **Combate:** Detección automática → tiradas iniciativa → turnos → resolución
- **Error IA:** Reintento automático → fallback → mensaje usuario
- **Persistencia:** Auto-save cada acción → recuperación estado

## Tech Stack

### 🏗️ **Backend Architecture (Clean Architecture + SOLID):**
```
src/
├── domain/entities/           # Character, Story, Dice (reglas negocio)
├── domain/value-objects/      # AbilityScores, HitPoints, Skills
├── domain/services/          # DiceService, StoryGenerationService
├── application/use-cases/    # CreateCharacter, CombatUseCase, CreateStory
├── infrastructure/services/  # GeminiAIService, FileStorageService
├── infrastructure/repositories/ # FileCharacterRepository, InMemoryStoryRepository
└── presentation/web/         # Express controllers, routes
```

### ⚛️ **Frontend Stack:**
- **React 18** + TypeScript + Vite
- **Estado:** useState/useEffect hooks nativos
- **Routing:** SPA con navegación por tabs
- **Styling:** CSS modules + animaciones CSS puras
- **Build:** Vite optimizado para desarrollo/producción

### 🤖 **IA & Servicios Externos:**
- **Google Gemini 1.5 Flash** para generación narrativa
- **API REST** propia para comunicación frontend/backend
- **File System** para persistencia de personajes
- **Memoria** para historias temporales

### 🛠️ **Herramientas Desarrollo:**
- **TypeScript 5.2+** modo estricto
- **ESLint** + **Prettier** para code style
- **Nodemon** + **Concurrently** para desarrollo
- **Cross-env** para compatibilidad OS

## Design Principles

### 🎨 **Principios de Diseño UX:**

1. **Inmersión sobre Complejidad**
   - Priorizar experiencia de juego fluida
   - Ocultar complejidad técnica D&D al usuario
   - Animaciones que refuerzan la fantasy

2. **Accesibilidad Inclusiva**
   - Interfaz 100% en español
   - Contraste mínimo WCAG AA
   - Navegación por teclado completa
   - Texto legible (mín 16px)

3. **Performance como Feature**
   - Animaciones 60fps constantes
   - Tiempo respuesta IA <3 segundos
   - Startup aplicación <2 segundos
   - Bundle JS optimizado <500KB

4. **Tono Visual Épico-Accesible**
   - Paleta medieval (azules, grises, dorados)
   - Tipografía clara no-fantasy para legibilidad
   - Iconografía D&D recognizable 🎲 ⚔️ 🐉
   - Feedback visual claro (✅❌🌟💥)

### 🏛️ **Principios Arquitectónicos:**

1. **Separation of Concerns**
   - Domain logic independiente de UI/IA
   - Casos de uso como orquestadores únicos
   - Servicios externos intercambiables

2. **Fail-Safe & Graceful Degradation**
   - IA caída → opciones por defecto
   - Animaciones pesadas → fallback simple
   - Errores UX → mensajes claros en español

3. **Developer Experience**
   - Hot reload <500ms
   - Comandos npm auto-documentados
   - Error messages contextualizados
   - Testing local sin servicios externos

---

## Comandos de Desarrollo

### ⚡ **Comandos Principales:**
```bash
npm run dev          # Desarrollo paralelo (servidor + cliente)
npm start            # Producción completa (build + serve)
npm run kill         # Limpiar todos los procesos
```

### 🔍 **Verificación & Testing:**
```bash
npm run health       # Status servidor + deps
npm run lint         # ESLint + auto-fix
npm run typecheck    # TypeScript validation
npm test             # Unit tests (CombatUseCase)
```

### 🏗️ **Build & Deploy:**
```bash
npm run build        # Compilar servidor + cliente
npm run setup        # Instalación inicial completa
npm run clean        # Limpiar builds
npm run reset        # Reinstalar dependencias
```

## Folder Structure & Conventions

### 📁 **Estructura Obligatoria:**
```
/src/domain/entities/          → Core business logic (Character, Story)
/src/application/use-cases/    → Application orchestrators
/src/infrastructure/services/  → External integrations (AI, Storage)
/src/presentation/web/         → HTTP controllers only

/frontend/src/components/      → Reusable React components
/frontend/src/pages/          → Page-level components (4 max)
/frontend/src/services/       → API clients
/frontend/src/types/          → TypeScript interfaces
```

### 🚫 **Reglas Estrictas:**
- **NUNCA** mezclar domain logic con UI components
- **NUNCA** imports directos frontend → backend
- **NUNCA** comandos npm custom fuera del package.json
- **SIEMPRE** usar interfaces TypeScript para contratos
- **SIEMPRE** validar inputs en domain entities
- **SIEMPRE** manejar errores IA con reintentos

### 🎯 **Convenciones Naming:**
- **Entities:** `Character.ts`, `Story.ts` (PascalCase)
- **Use Cases:** `CreateCharacterUseCase.ts` (verbose + UseCase suffix)
- **Components:** `RealisticDiceAnimation.tsx` (descriptive PascalCase)
- **Services:** `GeminiAIService.ts` (Service suffix)
- **Types:** `CharacterData` (Data suffix for DTOs)

---

## Reglas de Think Mode

### 🧠 **Metodología Obligatoria:**

**Antes de cualquier código, SIEMPRE explicar:**
1. **Objetivo:** ¿Qué problema específico resuelve?
2. **Arquitectura:** ¿En qué capa va? ¿Por qué?
3. **Dependencias:** ¿Qué servicios/entidades necesita?
4. **Contratos:** ¿Qué interfaces define/implementa?
5. **Testing:** ¿Cómo se valida que funciona?
6. **Edge cases:** ¿Qué puede fallar? ¿Cómo se maneja?

**Palabras trigger para Think Mode:**
- "Explain your approach step by step"
- "Think through the implementation"
- "Analyze the impact on existing code"
- "Consider the trade-offs"

### ⚖️ **Criterios de Decisión:**
1. **Domain-first:** ¿Respeta las reglas D&D?
2. **User-first:** ¿Mejora la experiencia de juego?
3. **Maintainable:** ¿Es fácil de cambiar/testear?
4. **Performance:** ¿Impacta tiempos de respuesta?
5. **Scalable:** ¿Funciona con más usuarios/features?

---

**💡 Este documento es el "cerebro" del proyecto. Claude debe internalizarlo completamente antes de cualquier modificación.**