#!/bin/bash
# Context Stack Validation Script for DungeonDra
# Usage: chmod +x .claude/validation/validate-context-stack.sh && ./.claude/validation/validate-context-stack.sh

echo "🐉 VALIDANDO CONTEXT STACK DUNGEONRA..."
echo "========================================"

# Initialize counters
passed=0
failed=0

# Function to check and report
check_metric() {
    local name="$1"
    local command="$2"
    local expected="$3"
    
    echo -n "📊 $name... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo "✅ PASS"
        ((passed++))
    else
        echo "❌ FAIL (expected: $expected)"
        ((failed++))
    fi
}

echo ""
echo "🏗️  VERIFICANDO CALIDAD DE CÓDIGO"
echo "=================================="

# TypeScript validation
echo -n "📊 TypeScript sin errores... "
if npm run typecheck > /dev/null 2>&1; then
    echo "✅ PASS"
    ((passed++))
else
    echo "❌ FAIL"
    ((failed++))
fi

# ESLint validation  
echo -n "📊 ESLint sin warnings... "
if npm run lint > /dev/null 2>&1; then
    echo "✅ PASS"
    ((passed++))
else
    echo "❌ FAIL"
    ((failed++))
fi

echo ""
echo "📖 VERIFICANDO DOCUMENTACIÓN"
echo "============================"

# Check required documentation files
check_metric "CLAUDE.md presente" "[ -f 'CLAUDE.md' ]" "archivo existe"
check_metric ".claude/rules directory" "[ -d '.claude/rules' ]" "directorio existe"
check_metric "design/system.json" "[ -f 'design/system.json' ]" "archivo existe"
check_metric "project-overview.md" "[ -f '.claude/rules/project-overview.md' ]" "archivo existe"
check_metric "api-routes.md" "[ -f '.claude/rules/api-routes.md' ]" "archivo existe"
check_metric "game-mechanics.md" "[ -f '.claude/rules/game-mechanics.md' ]" "archivo existe"

echo ""
echo "🎨 VERIFICANDO CONSISTENCIA DE DISEÑO"
echo "======================================"

# Count hardcoded colors
hardcoded_colors=$(grep -r "#[0-9a-fA-F]\{6\}" frontend/src/components/ 2>/dev/null | wc -l || echo "0")
hardcoded_colors=$(echo "$hardcoded_colors" | tr -d ' ')

echo "🎯 Colores hardcoded encontrados: $hardcoded_colors"
if [ "$hardcoded_colors" -lt 5 ]; then
    echo "✅ PASS (objetivo: <5)"
    ((passed++))
else
    echo "❌ FAIL (objetivo: <5)"
    ((failed++))
fi

# Check design token usage
token_usage=$(grep -r "var(--" frontend/src/ --include="*.css" 2>/dev/null | wc -l || echo "0")
token_usage=$(echo "$token_usage" | tr -d ' ')

echo "🎯 Uso de design tokens: $token_usage instances"
if [ "$token_usage" -gt 10 ]; then
    echo "✅ PASS (objetivo: >10 usos)"
    ((passed++))
else
    echo "❌ FAIL (objetivo: >10 usos)"
    ((failed++))
fi

echo ""
echo "🌍 VERIFICANDO LOCALIZACIÓN ESPAÑOLA"
echo "===================================="

# Check for English strings in UI
english_strings=$(grep -r "\"[A-Z][a-z]\{3,\}\"" frontend/src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "console\|import\|export\|interface\|type" | wc -l || echo "0")
english_strings=$(echo "$english_strings" | tr -d ' ')

echo "🎯 Strings potencialmente en inglés: $english_strings"
if [ "$english_strings" -lt 5 ]; then
    echo "✅ PASS (objetivo: <5)"
    ((passed++))
else
    echo "❌ FAIL (objetivo: <5)"
    ((failed++))
fi

# Check Spanish error messages
spanish_errors=$(grep -r "Error\|error" src/ --include="*.ts" 2>/dev/null | grep -E "(español|Error|mensaje|intenta|nuevamente)" | wc -l || echo "0")
spanish_errors=$(echo "$spanish_errors" | tr -d ' ')

echo "🎯 Mensajes de error en español: $spanish_errors"
if [ "$spanish_errors" -gt 3 ]; then
    echo "✅ PASS (objetivo: >3)"
    ((passed++))
else
    echo "❌ FAIL (objetivo: >3)"
    ((failed++))
fi

echo ""
echo "⚡ VERIFICANDO PERFORMANCE"
echo "========================="

# Build time
echo "🏗️  Midiendo tiempo de build..."
start_time=$(date +%s)
if npm run build > /dev/null 2>&1; then
    end_time=$(date +%s)
    build_time=$((end_time - start_time))
    echo "🎯 Tiempo de build: ${build_time}s"
    
    if [ "$build_time" -lt 30 ]; then
        echo "✅ PASS (objetivo: <30s)"
        ((passed++))
    else
        echo "❌ FAIL (objetivo: <30s)"
        ((failed++))
    fi
else
    echo "❌ FAIL - Build falló"
    ((failed++))
fi

# Bundle size
if [ -d "public/assets" ]; then
    bundle_size=$(du -s public/assets/ 2>/dev/null | cut -f1 || echo "999999")
    bundle_size_kb=$((bundle_size))
    
    echo "🎯 Tamaño bundle: ${bundle_size_kb}KB"
    if [ "$bundle_size_kb" -lt 1000 ]; then  # ~1MB en KB
        echo "✅ PASS (objetivo: <1MB)"
        ((passed++))
    else
        echo "❌ FAIL (objetivo: <1MB)"
        ((failed++))
    fi
else
    echo "❌ FAIL - No se encontraron assets"
    ((failed++))
fi

echo ""
echo "🏛️  VERIFICANDO ARQUITECTURA LIMPIA"
echo "==================================="

# Check domain layer purity (no infrastructure imports)
domain_imports=$(grep -r "import.*infrastructure\|import.*presentation" src/domain/ 2>/dev/null | wc -l || echo "0")
domain_imports=$(echo "$domain_imports" | tr -d ' ')

echo "🎯 Imports ilegales en domain: $domain_imports"
if [ "$domain_imports" -eq 0 ]; then
    echo "✅ PASS (objetivo: 0)"
    ((passed++))
else
    echo "❌ FAIL (objetivo: 0)"
    ((failed++))
fi

# Check entity validation
entities_with_validation=$(grep -r "validate\|throw.*Error" src/domain/entities/ 2>/dev/null | wc -l || echo "0")
entities_with_validation=$(echo "$entities_with_validation" | tr -d ' ')

echo "🎯 Entities con validación: $entities_with_validation"
if [ "$entities_with_validation" -gt 3 ]; then
    echo "✅ PASS (objetivo: >3)"
    ((passed++))
else
    echo "❌ FAIL (objetivo: >3)"
    ((failed++))
fi

echo ""
echo "🎲 VERIFICANDO MECÁNICAS D&D"
echo "============================"

# Check dice types supported
dice_types=$(grep -r "diceType.*[4|6|8|10|12|20|100]" frontend/src/components/ 2>/dev/null | wc -l || echo "0")
dice_types=$(echo "$dice_types" | tr -d ' ')

echo "🎯 Tipos de dados implementados: $dice_types references"
if [ "$dice_types" -gt 5 ]; then
    echo "✅ PASS (objetivo: >5)"
    ((passed++))
else
    echo "❌ FAIL (objetivo: >5)"
    ((failed++))
fi

# Check D&D classes
dnd_classes=$(grep -r "fighter\|wizard\|rogue\|cleric\|ranger\|barbarian" src/ 2>/dev/null | wc -l || echo "0")
dnd_classes=$(echo "$dnd_classes" | tr -d ' ')

echo "🎯 Clases D&D referenciadas: $dnd_classes references"
if [ "$dnd_classes" -gt 10 ]; then
    echo "✅ PASS (objetivo: >10)"
    ((passed++))
else
    echo "❌ FAIL (objetivo: >10)"
    ((failed++))
fi

echo ""
echo "🤖 VERIFICANDO INTEGRACIÓN IA"
echo "============================="

# Check AI error handling
ai_error_handling=$(grep -r "retry\|fallback\|reintento" src/infrastructure/services/GeminiAIService.ts 2>/dev/null | wc -l || echo "0")
ai_error_handling=$(echo "$ai_error_handling" | tr -d ' ')

echo "🎯 Manejo de errores IA: $ai_error_handling instances"
if [ "$ai_error_handling" -gt 3 ]; then
    echo "✅ PASS (objetivo: >3)"
    ((passed++))
else
    echo "❌ FAIL (objetivo: >3)"
    ((failed++))
fi

# Check Spanish AI prompts
spanish_prompts=$(grep -r "español\|Español\|ESPAÑOL" src/infrastructure/services/GeminiAIService.ts 2>/dev/null | wc -l || echo "0")
spanish_prompts=$(echo "$spanish_prompts" | tr -d ' ')

echo "🎯 Prompts en español: $spanish_prompts instances"
if [ "$spanish_prompts" -gt 5 ]; then
    echo "✅ PASS (objetivo: >5)"
    ((passed++))
else
    echo "❌ FAIL (objetivo: >5)"
    ((failed++))
fi

# Final results
echo ""
echo "📊 RESULTADOS FINALES"
echo "===================="
echo "✅ Tests pasados: $passed"
echo "❌ Tests fallidos: $failed"

total=$((passed + failed))
if [ "$total" -gt 0 ]; then
    percentage=$((passed * 100 / total))
    echo "📈 Puntuación: $percentage%"
    
    if [ "$percentage" -ge 80 ]; then
        echo "🎉 ¡EXCELENTE! Context Stack funcionando correctamente"
        exit 0
    elif [ "$percentage" -ge 60 ]; then
        echo "⚠️  ACEPTABLE - Hay áreas por mejorar"
        exit 1
    else
        echo "🚨 NECESITA ATENCIÓN - Context Stack requiere mejoras"
        exit 2
    fi
else
    echo "❌ No se pudieron ejecutar las pruebas"
    exit 3
fi