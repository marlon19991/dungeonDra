# CLAUDE.md - Instrucciones para Claude Code

## COMANDOS PREDEFINIDOS DE LA APLICACIÓN

### ⚠️ SIEMPRE usar estos comandos exactos, NUNCA inventar otros:

```bash
# COMANDO PRINCIPAL - Construcción y ejecución completa
npm start

# Desarrollo (servidor + cliente en paralelo con hot reload)
npm run dev

# Solo construcción
npm run build

# Limpiar procesos
npm run kill

# Verificar salud del servidor
npm run health

# Verificar logs
npm run logs

# Linting y verificación de tipos
npm run lint
npm run typecheck

# Instalación inicial
npm run setup

# Limpieza completa
npm run clean
npm run reset
```

## FLUJO DE TRABAJO ESTÁNDAR

### 1. Después de hacer cambios en el código:
```bash
npm run kill    # Limpiar procesos
npm run dev     # Para desarrollo con hot reload
# O
npm start       # Para probar versión completa y definitiva
```

### 2. Para verificar que todo funciona:
```bash
npm run health  # Verificar servidor
npm run lint    # Verificar código
npm run typecheck # Verificar tipos
```

### 3. Para problemas de puerto ocupado:
```bash
npm run kill    # SIEMPRE usar este comando
```

## ARQUITECTURA DEL PROYECTO

### Estructura de archivos:
```
/src/                           # Backend TypeScript
  /application/use-cases/       # Casos de uso
  /domain/                      # Entidades y reglas de negocio
  /infrastructure/              # Servicios externos (Gemini AI)
  web.ts                        # Servidor principal

/frontend/                      # Frontend React
  /src/components/              # Componentes React
  /src/pages/                   # Páginas principales
  /src/services/                # Servicios del cliente

/dist/                          # Build del servidor
/public/                        # Build del cliente (copiado desde frontend/dist)
```

### Puertos:
- Servidor backend: `localhost:3000`
- Cliente desarrollo: `localhost:5173` (solo con npm run dev)
- Cliente producción: `localhost:3000` (con npm run preview/start)

## COMPONENTES PRINCIPALES

### Sistema de Dados:
- `RealisticDiceAnimation.tsx` - Animaciones 3D de dados
- `StoryOptionWithDice.tsx` - Opciones de historia con dados
- `DiceRoller.tsx` - Sistema básico de dados
- `InteractiveDiceRoller.tsx` - Sistema interactivo

### Servicios:
- `GeminiAIService.ts` - Integración con Google Gemini AI
- `apiService.ts` - API del cliente
- `storyApiService.ts` - API de historias

## REGLAS DE DESARROLLO

### 1. NUNCA cambiar comandos npm:
- ❌ NO usar: `node dist/web.js`, comandos inventados
- ✅ SÍ usar: `npm start`, `npm run dev`, comandos predefinidos

### 2. Para testing después de cambios:
- Desarrollo: `npm run dev` (hot reload)
- Producción: `npm start` (build completa y ejecutar)

### 3. Manejo de errores comunes:

#### Puerto ocupado:
```bash
npm run kill
npm run dev
```

#### Error de dependencias:
```bash
npm run reset
npm run setup
```

#### Error de compilación:
```bash
npm run typecheck
npm run lint
```

## SOLUCIÓN DE PROBLEMAS COMUNES

### 1. "EADDRINUSE" - Puerto ocupado:
```bash
npm run kill
# Esperar 2-3 segundos
npm run dev
```

### 2. Error de Gemini AI (503 Service Unavailable):
- Es temporal, el servicio está sobrecargado
- Implementar reintentos automáticos en el código
- Informar al usuario que intente en unos minutos

### 3. Errores de TypeScript:
```bash
npm run typecheck  # Ver errores específicos
npm run lint       # Corregir estilo
```

### 4. Errores de construcción:
```bash
npm run clean
npm run setup
npm run build
```

## FLUJO DE TESTING

### Para probar animaciones de dados:
1. `npm start` (construcción completa y ejecución)
2. Ir a `localhost:3000`
3. Crear personaje → Nueva aventura → Seleccionar opción con dados 🎲
4. Verificar animación 3D realista

### Para desarrollo continuo:
1. `npm run dev` (desarrollo con hot reload)
2. Frontend en `localhost:5173`
3. Backend en `localhost:3000`

## NOTAS IMPORTANTES

- **SIEMPRE** leer este archivo antes de ejecutar comandos
- **NUNCA** inventar comandos nuevos
- **SIEMPRE** usar `npm run kill` antes de cambiar entre dev/start
- **VERIFICAR** que los puertos estén libres con `npm run health`
- **CONSISTENCIA** es clave para evitar confusión del usuario

## COMANDOS PROHIBIDOS (NO USAR):

❌ `node dist/web.js` directamente (sin build previo)
❌ `nodemon`
❌ `ts-node src/web.ts`
❌ Comandos inventados o modificados

✅ **SOLO USAR** comandos definidos en package.json con `npm run [comando]`