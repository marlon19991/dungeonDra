#!/bin/bash
# Quick Context Stack Validation for DungeonDra

echo "🐉 VALIDACIÓN RÁPIDA CONTEXT STACK"
echo "=================================="

passed=0
failed=0

# TypeScript
echo -n "📊 TypeScript... "
if npm run typecheck > /dev/null 2>&1; then
    echo "✅ PASS"; ((passed++))
else
    echo "❌ FAIL"; ((failed++))
fi

# ESLint
echo -n "📊 ESLint... "
if npm run lint > /dev/null 2>&1; then
    echo "✅ PASS"; ((passed++))
else
    echo "❌ FAIL"; ((failed++))
fi

# Design Tokens
tokens=$(grep -r "var(--" frontend/src/ --include="*.css" 2>/dev/null | wc -l | tr -d ' ')
echo "🎨 Design Tokens: $tokens instances"
if [ "$tokens" -gt 30 ]; then
    echo "✅ PASS (objetivo: >30)"; ((passed++))
else
    echo "❌ FAIL (objetivo: >30)"; ((failed++))
fi

# Hardcoded Colors
colors=$(grep -r "#[0-9a-fA-F]\{6\}" frontend/src/components/ 2>/dev/null | wc -l | tr -d ' ')
echo "🎨 Colores hardcoded: $colors"
if [ "$colors" -lt 10 ]; then
    echo "✅ PASS (objetivo: <10)"; ((passed++))
else
    echo "❌ FAIL (objetivo: <10)"; ((failed++))
fi

# Bundle Size
echo "⚡ Verificando bundle..."
cd frontend && npm run build > /dev/null 2>&1 && cd ..
main_js=$(find frontend/dist/assets -name "index-*.js" 2>/dev/null | head -1)
if [ -f "$main_js" ]; then
    size=$(stat -f%z "$main_js" 2>/dev/null || stat -c%s "$main_js" 2>/dev/null || echo "999999")
    size_kb=$((size / 1024))
    echo "📦 Bundle principal: ${size_kb}KB"
    if [ "$size_kb" -lt 200 ]; then
        echo "✅ PASS (objetivo: <200KB)"; ((passed++))
    else
        echo "❌ FAIL (objetivo: <200KB)"; ((failed++))
    fi
else
    echo "❌ Bundle no encontrado"; ((failed++))
fi

# D&D Validations
dnd_classes=$(grep -r "fighter\|wizard\|rogue\|cleric" src/ 2>/dev/null | wc -l | tr -d ' ')
echo "🎲 Clases D&D: $dnd_classes references"
if [ "$dnd_classes" -gt 15 ]; then
    echo "✅ PASS (objetivo: >15)"; ((passed++))
else
    echo "❌ FAIL (objetivo: >15)"; ((failed++))
fi

# IA Integration
ai_handling=$(grep -r "retry\|fallback\|catch.*error" src/infrastructure/services/GeminiAIService.ts 2>/dev/null | wc -l | tr -d ' ')
echo "🤖 Manejo IA: $ai_handling instances"
if [ "$ai_handling" -gt 8 ]; then
    echo "✅ PASS (objetivo: >8)"; ((passed++))
else
    echo "❌ FAIL (objetivo: >8)"; ((failed++))
fi

# Results
total=$((passed + failed))
percentage=$((passed * 100 / total))

echo ""
echo "📊 RESULTADOS"
echo "============="
echo "✅ Tests pasados: $passed"
echo "❌ Tests fallidos: $failed"
echo "📈 Puntuación: $percentage%"

if [ "$percentage" -ge 90 ]; then
    echo "🎉 ¡EXCELENTE! 90%+ alcanzado"
    exit 0
elif [ "$percentage" -ge 80 ]; then
    echo "🎯 ¡MUY BIEN! 80%+ alcanzado"
    exit 0
else
    echo "⚠️  Necesita mejoras"
    exit 1
fi