# Context Stack Validation Metrics

## 🎯 **Métricas de Verificación del Context Stack**

Este documento define métricas cuantificables para validar que el Context Stack profesional está realmente aportando valor al proyecto DungeonDra.

---

## 📊 **Métricas de Calidad de Código**

### 1. **Adherencia Arquitectónica**
**Objetivo**: Verificar que el código sigue Clean Architecture

```bash
# Comandos de verificación
npm run typecheck    # 0 errores TypeScript
npm run lint         # 0 warnings ESLint
```

**Métricas**:
- ✅ **0 errores TypeScript** en build de producción
- ✅ **0 warnings ESLint** en análisis estático
- ✅ **100% interfaces TypeScript** para contratos entre capas
- ✅ **0 imports directos** de frontend a backend (verificar con lint rules)

### 2. **Calidad de Documentación**
**Objetivo**: Context Stack completo y actualizado

**Métricas**:
- ✅ **CLAUDE.md actualizado** con Product Goal, Key Features, User Flow, Tech Stack, Design Principles
- ✅ **3+ documentos en .claude/rules/** (project-overview, api-routes, game-mechanics)
- ✅ **design/system.json** con tokens extraídos y organizados
- ✅ **Component conventions** documentadas y seguidas

### 3. **Consistencia de Diseño**
**Objetivo**: Uso sistemático de design tokens

**Métricas verificables**:
```bash
# Buscar hardcoded colors en componentes
grep -r "#[0-9a-fA-F]\{6\}" frontend/src/components/ --exclude-dir=node_modules

# Verificar uso de design tokens
grep -r "var(--" frontend/src/ --include="*.css" | wc -l

# Contar componentes que siguen convenciones de naming
find frontend/src/components -name "*.tsx" | wc -l
```

**Targets**:
- ✅ **<5 colores hardcodeados** en componentes nuevos
- ✅ **80%+ uso de design tokens** en CSS
- ✅ **100% componentes** siguen naming convention

---

## 🚀 **Métricas de Performance**

### 1. **Tiempos de Desarrollo**
**Objetivo**: Context Stack reduce tiempo de toma de decisiones

**Métricas**:
- ⏱️ **<30 segundos** para Claude encontrar información arquitectónica
- ⏱️ **<60 segundos** para generar componente siguiendo convenciones
- ⏱️ **<120 segundos** para implementar nueva feature respetando Clean Architecture

### 2. **Build Performance**
**Objetivo**: Mantener performance de desarrollo

```bash
# Tiempo de build
time npm run build

# Tamaño de bundle
du -sh public/assets/*.js

# Tiempo de hot reload
# (medir manualmente en desarrollo)
```

**Targets**:
- ✅ **<30 segundos** build completo
- ✅ **<500KB** bundle JS total
- ✅ **<2 segundos** hot reload en desarrollo

---

## 🎮 **Métricas de Experiencia de Usuario**

### 1. **Cumplimiento de Product Goals**
**Objetivo**: Features implementadas cumplen objetivos definidos

**Métricas verificables**:
```bash
# Verificar que la aplicación arranca
npm run health

# Tiempo de startup
time npm start
```

**Targets desde CLAUDE.md**:
- ✅ **<5 minutos** setup completo (crear personaje + iniciar aventura)
- ✅ **<3 segundos** respuesta IA promedio
- ✅ **60fps** animaciones de dados
- ✅ **<2 segundos** startup aplicación

### 2. **Localización Española**
**Objetivo**: 100% interfaz en español

```bash
# Buscar texto en inglés hardcodeado
grep -r "\"[A-Z][a-z].*[a-z]\"" frontend/src/ --include="*.tsx" --include="*.ts"

# Verificar mensajes de error en español
grep -r "Error\|error" src/ --include="*.ts" | grep -v "console"
```

**Targets**:
- ✅ **0 strings en inglés** en interfaz usuario
- ✅ **100% mensajes error** en español
- ✅ **Nombres NPCs/lugares** españolizados en IA

---

## 🔍 **Métricas de Mantenibilidad**

### 1. **Complejidad de Código**
**Objetivo**: Código fácil de entender y modificar

```bash
# Contar líneas por archivo (detectar archivos muy grandes)
find src/ -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -n

# Verificar que entities tienen validación
grep -r "validate" src/domain/entities/

# Contar casos de uso con manejo de errores
grep -r "try\|catch\|throw" src/application/use-cases/
```

**Targets**:
- ✅ **<200 líneas** promedio por archivo TypeScript
- ✅ **100% entities** tienen validación en constructor
- ✅ **100% use cases** tienen manejo de errores
- ✅ **100% servicios** implementan interfaces

### 2. **Dependencias y Acoplamiento**
**Objetivo**: Bajo acoplamiento entre capas

```bash
# Verificar imports entre capas (no debería haber)
grep -r "import.*presentation" src/domain/
grep -r "import.*infrastructure" src/domain/
grep -r "import.*src/" frontend/src/

# Contar interfaces vs implementaciones
find src/ -name "I*.ts" | wc -l  # Interfaces
find src/ -name "*Service.ts" | wc -l  # Servicios
```

**Targets**:
- ✅ **0 imports** de capas superiores en domain/
- ✅ **Ratio 1:1** interfaces/implementaciones para servicios
- ✅ **0 imports directos** frontend → backend

---

## 🤖 **Métricas de IA Integration**

### 1. **Calidad de Generación de Historias**
**Objetivo**: IA produce contenido coherente y usable

**Métricas verificables**:
```bash
# Verificar manejo de errores IA
grep -r "retry\|fallback" src/infrastructure/services/GeminiAIService.ts

# Comprobar que responses se parsean correctamente
grep -r "parseResponse" src/infrastructure/services/
```

**Targets**:
- ✅ **3+ reintentos** automáticos para fallos IA
- ✅ **100% responses** tienen fallback content
- ✅ **95%+ parsing success** de respuestas IA
- ✅ **100% historias** en español sin NPCs en inglés

### 2. **Integración Dados + IA**
**Objetivo**: Sistema de dados integrado con narrativa

```bash
# Verificar que todas las opciones tienen dados asociados
grep -r "diceRequest" src/infrastructure/services/GeminiAIService.ts

# Comprobar tipos de dados válidos
grep -r "diceType.*4\|6\|8\|10\|12\|20\|100" frontend/src/components/
```

**Targets**:
- ✅ **100% opciones historia** tienen dice requests asociados
- ✅ **100% dice requests** tienen DC válido (5-30)
- ✅ **7 tipos dados** soportados completamente

---

## 🎯 **KPIs de Context Stack Effectiveness**

### Métricas de Impacto:

**Before vs After Context Stack:**

| Métrica | Antes | Objetivo Post Context Stack | Verificación |
|---------|-------|---------------------------|--------------|
| Tiempo decisiones arquitectónicas | ~5 min | <1 min | Manual (cronómetro) |
| Errores convención naming | ~20% | <5% | `grep -r` patterns |
| Components sin TypeScript interfaces | ~30% | 0% | `npm run typecheck` |
| Hardcoded colors/styles | ~50 instances | <10 instances | `grep -r "#[0-9a-fA-F]"` |
| API endpoints sin documentar | 100% | 0% | Check .claude/rules/api-routes.md |
| Tiempo implementar nueva feature | ~60 min | <30 min | Manual (cronómetro) |

---

## 🔄 **Script de Validación Automática**

```bash
#!/bin/bash
# .claude/validation/validate-context-stack.sh

echo "🔍 VALIDANDO CONTEXT STACK DUNGEONRA..."

# 1. Verificar calidad código
echo "📊 Verificando TypeScript..."
npm run typecheck || echo "❌ Errores TypeScript encontrados"

echo "📊 Verificando ESLint..."
npm run lint || echo "❌ Warnings ESLint encontrados"

# 2. Verificar documentación
echo "📖 Verificando documentación..."
[ -f "CLAUDE.md" ] && echo "✅ CLAUDE.md presente" || echo "❌ CLAUDE.md faltante"
[ -d ".claude/rules" ] && echo "✅ .claude/rules presente" || echo "❌ .claude/rules faltante"
[ -f "design/system.json" ] && echo "✅ design/system.json presente" || echo "❌ design tokens faltantes"

# 3. Verificar convenciones
echo "🎨 Verificando design consistency..."
hardcoded_colors=$(grep -r "#[0-9a-fA-F]\{6\}" frontend/src/components/ --exclude-dir=node_modules | wc -l)
echo "🎯 Colores hardcoded encontrados: $hardcoded_colors (objetivo: <5)"

# 4. Verificar localización
echo "🌍 Verificando localización española..."
english_strings=$(grep -r "\"[A-Z][a-z].*[a-z]\"" frontend/src/ --include="*.tsx" --include="*.ts" | wc -l)
echo "🎯 Strings en inglés encontrados: $english_strings (objetivo: 0)"

# 5. Performance
echo "⚡ Verificando performance..."
echo "🏗️ Ejecutando build..."
time npm run build

echo "📦 Verificando tamaño bundle..."
du -sh public/assets/*.js 2>/dev/null || echo "❌ No se encontraron archivos de build"

# Resultado final
echo ""
echo "✅ VALIDACIÓN COMPLETADA"
echo "📋 Revisar métricas arriba para cumplimiento de objetivos"
```

---

## 📈 **Dashboard de Métricas**

**Crear archivo**: `.claude/validation/metrics-dashboard.md`

```markdown
# Metrics Dashboard - Última Actualización: YYYY-MM-DD

## 🎯 Estado Actual Context Stack

### Code Quality
- TypeScript Errors: ❌/✅ (target: 0)
- ESLint Warnings: ❌/✅ (target: 0)  
- Test Coverage: XX% (target: >80%)

### Documentation
- CLAUDE.md Sections: 5/5 ✅
- .claude/rules Files: 3/3 ✅
- Design Tokens: ✅

### Performance
- Build Time: XXs (target: <30s)
- Bundle Size: XXXkb (target: <500kb)
- Hot Reload: XXs (target: <2s)

### User Experience  
- Spanish Localization: XX% (target: 100%)
- Error Handling: XX% (target: 100%)
- Accessibility: XX% (target: 90%+)

## 📊 Trending
- [Previous week metrics for comparison]
```

---

**Uso de estas métricas**:
1. **Ejecutar validación** antes de cada commit importante
2. **Actualizar dashboard** semanalmente  
3. **Revisar KPIs** cuando Context Stack no parezca estar ayudando
4. **Iterar en documentation** basado en métricas de efectividad

**Objetivo**: Demostrar con datos que el Context Stack profesional está mejorando velocidad de desarrollo, calidad de código y consistencia del proyecto.