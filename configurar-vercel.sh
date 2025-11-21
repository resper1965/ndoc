#!/bin/bash

# Script para configurar variáveis de ambiente no Vercel
# Uso: ./configurar-vercel.sh

echo "🔧 Configurando variáveis de ambiente no Vercel..."
echo ""

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado. Instalando..."
    npm i -g vercel
fi

# Verificar se está logado
if ! vercel whoami &> /dev/null; then
    echo "❌ Não está logado no Vercel. Fazendo login..."
    vercel login
fi

# Linkar ao projeto (se necessário)
if [ ! -f .vercel/project.json ]; then
    echo "📦 Linkando ao projeto..."
    vercel link
fi

echo ""
echo "📋 Variáveis a configurar:"
echo "  1. ENCRYPTION_KEY (OBRIGATÓRIA)"
echo "  2. Verificar outras variáveis existentes"
echo ""

# ENCRYPTION_KEY
echo "🔐 Configurando ENCRYPTION_KEY..."
ENCRYPTION_KEY="e9c5a7ef0a55fb0c665ec8a25f51c93722ac32f2f0729f07c91499e4d55215e8"

echo "  → Production..."
echo "$ENCRYPTION_KEY" | vercel env add ENCRYPTION_KEY production

echo "  → Preview..."
echo "$ENCRYPTION_KEY" | vercel env add ENCRYPTION_KEY preview

echo "  → Development..."
echo "$ENCRYPTION_KEY" | vercel env add ENCRYPTION_KEY development

echo ""
echo "✅ ENCRYPTION_KEY configurada!"
echo ""

# Listar variáveis configuradas
echo "📊 Variáveis configuradas:"
vercel env ls

echo ""
echo "✅ Configuração concluída!"
echo ""
echo "⚠️  IMPORTANTE: Faça um novo deploy para aplicar as variáveis:"
echo "   vercel --prod"
echo ""
