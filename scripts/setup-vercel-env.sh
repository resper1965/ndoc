#!/bin/bash

# Script para configurar variáveis de ambiente na Vercel
# Uso: ./scripts/setup-vercel-env.sh

set -e

echo "🔧 Configurando variáveis de ambiente na Vercel..."
echo ""

# Variáveis do Supabase
SUPABASE_URL="https://ajyvonzyoyxmiczflfiz.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqeXZvbnp5b3l4bWljemZsZml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjYwNTEsImV4cCI6MjA3ODcwMjA1MX0.Q1IdRXq2KVhe4-Gk_TDohtaN_mJU7hULHz80EkqBgx4"

# Variáveis do .env.local (se existir)
if [ -f .env.local ]; then
  source .env.local
fi

# Função para adicionar variável
add_env_var() {
  local name=$1
  local value=$2
  local env=${3:-production}
  
  if [ -z "$value" ]; then
    echo "⚠️  $name não definida, pulando..."
    return
  fi
  
  echo "📝 Adicionando $name para $env..."
  echo "$value" | vercel env add "$name" "$env" 2>&1 | grep -v "Retrieving project" || true
}

# Variáveis obrigatórias
echo "📦 Configurando variáveis obrigatórias..."
add_env_var "NEXT_PUBLIC_SUPABASE_URL" "$SUPABASE_URL" "production"
add_env_var "NEXT_PUBLIC_SUPABASE_URL" "$SUPABASE_URL" "preview"
add_env_var "NEXT_PUBLIC_SUPABASE_URL" "$SUPABASE_URL" "development"

add_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY" "production"
add_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY" "preview"
add_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY" "development"

# Variáveis opcionais mas recomendadas
if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  add_env_var "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY" "production"
  add_env_var "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY" "preview"
fi

if [ -n "$OPENAI_API_KEY" ]; then
  add_env_var "OPENAI_API_KEY" "$OPENAI_API_KEY" "production"
  add_env_var "OPENAI_API_KEY" "$OPENAI_API_KEY" "preview"
fi

if [ -n "$UPSTASH_REDIS_REST_URL" ]; then
  add_env_var "UPSTASH_REDIS_REST_URL" "$UPSTASH_REDIS_REST_URL" "production"
  add_env_var "UPSTASH_REDIS_REST_URL" "$UPSTASH_REDIS_REST_URL" "preview"
fi

if [ -n "$UPSTASH_REDIS_REST_TOKEN" ]; then
  add_env_var "UPSTASH_REDIS_REST_TOKEN" "$UPSTASH_REDIS_REST_TOKEN" "production"
  add_env_var "UPSTASH_REDIS_REST_TOKEN" "$UPSTASH_REDIS_REST_TOKEN" "preview"
fi

if [ -n "$NEXT_PUBLIC_APP_URL" ]; then
  add_env_var "NEXT_PUBLIC_APP_URL" "$NEXT_PUBLIC_APP_URL" "production"
  add_env_var "NEXT_PUBLIC_APP_URL" "$NEXT_PUBLIC_APP_URL" "preview"
fi

echo ""
echo "✅ Variáveis de ambiente configuradas!"
echo ""
echo "📋 Verificar variáveis: vercel env ls"
echo "🚀 Próximo passo: vercel --prod"
