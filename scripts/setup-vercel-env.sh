#!/bin/bash

# Script para configurar variáveis de ambiente na Vercel
# Projeto: ndoc (ndoc-xi1n)
# Team: nessbr-projects

set -e

echo "🚀 Configurando variáveis de ambiente na Vercel para o projeto 'ndoc'..."
echo ""

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não está instalado."
    echo "   Instale com: npm i -g vercel"
    exit 1
fi

# Verificar se está logado
if ! vercel whoami &> /dev/null; then
    echo "❌ Você não está logado na Vercel."
    echo "   Execute: vercel login"
    exit 1
fi

# Variáveis do Supabase (obtidas via MCP)
SUPABASE_URL="https://ajyvonzyoyxmiczflfiz.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqeXZvbnp5b3l4bWljemZsZml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjYwNTEsImV4cCI6MjA3ODcwMjA1MX0.Q1IdRXq2KVhe4-Gk_TDohtaN_mJU7hULHz80EkqBgx4"

# Projeto Vercel
PROJECT_NAME="ndoc-xi1n"
TEAM_ID="team_iz6jrPdYbt5I3BtGFHb6hY16"

echo "📋 Configurando variáveis para o projeto: $PROJECT_NAME"
echo ""

# Configurar NEXT_PUBLIC_SUPABASE_URL
echo "1️⃣  Configurando NEXT_PUBLIC_SUPABASE_URL..."
echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development --scope "$TEAM_ID" || {
    echo "⚠️  Variável pode já existir ou erro ao configurar. Continuando..."
}

# Configurar NEXT_PUBLIC_SUPABASE_ANON_KEY
echo "2️⃣  Configurando NEXT_PUBLIC_SUPABASE_ANON_KEY..."
echo "$SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development --scope "$TEAM_ID" || {
    echo "⚠️  Variável pode já existir ou erro ao configurar. Continuando..."
}

echo ""
echo "✅ Variáveis configuradas com sucesso!"
echo ""
echo "📝 Variáveis configuradas:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo ""
echo "🔍 Para verificar, execute:"
echo "   vercel env ls --scope $TEAM_ID"
echo ""
echo "🚀 Para fazer deploy, execute:"
echo "   vercel --prod --scope $TEAM_ID"
echo ""

