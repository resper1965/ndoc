# ⚡ Configuração Rápida - Variáveis de Ambiente na Vercel

Este guia mostra como configurar as variáveis de ambiente no projeto **ndoc** na Vercel.

---

## 🎯 Informações do Projeto

- **Projeto Vercel**: `ndoc-xi1n` (`prj_IIZqdTLvxYy4oHflCl6IKYBQqcn6`)
- **Team**: `nessbr-projects` (`team_iz6jrPdYbt5I3BtGFHb6hY16`)
- **Supabase URL**: `https://ajyvonzyoyxmiczflfiz.supabase.co`

---

## 🚀 Opção 1: Via Script Automático (Recomendado)

### Usando Vercel CLI

```bash
# 1. Instalar Vercel CLI (se ainda não tiver)
npm i -g vercel

# 2. Fazer login
vercel login

# 3. Executar o script
./scripts/setup-vercel-env.sh
```

### Usando Node.js (API REST)

```bash
# 1. Obter token da Vercel
# Acesse: https://vercel.com/account/tokens
# Crie um novo token e copie

# 2. Configurar token
export VERCEL_TOKEN=seu_token_aqui

# 3. Executar script
node scripts/setup-vercel-env.js
```

---

## 🖥️ Opção 2: Via Dashboard (Manual)

1. **Acesse o projeto**:
   - https://vercel.com/nessbr-projects/ndoc-xi1n/settings/environment-variables

2. **Adicione as variáveis**:

   **Variável 1:**
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://ajyvonzyoyxmiczflfiz.supabase.co`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **Variável 2:**
   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqeXZvbnp5b3l4bWljemZsZml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjYwNTEsImV4cCI6MjA3ODcwMjA1MX0.Q1IdRXq2KVhe4-Gk_TDohtaN_mJU7hULHz80EkqBgx4`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

3. **Salve** cada variável

---

## 📋 Opção 3: Via CLI Manual

```bash
# Configurar NEXT_PUBLIC_SUPABASE_URL
echo "https://ajyvonzyoyxmiczflfiz.supabase.co" | \
  vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development \
  --scope team_iz6jrPdYbt5I3BtGFHb6hY16

# Configurar NEXT_PUBLIC_SUPABASE_ANON_KEY
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqeXZvbnp5b3l4bWljemZsZml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjYwNTEsImV4cCI6MjA3ODcwMjA1MX0.Q1IdRXq2KVhe4-Gk_TDohtaN_mJU7hULHz80EkqBgx4" | \
  vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development \
  --scope team_iz6jrPdYbt5I3BtGFHb6hY16
```

---

## ✅ Verificar Configuração

```bash
# Listar variáveis configuradas
vercel env ls --scope team_iz6jrPdYbt5I3BtGFHb6hY16
```

---

## 🚀 Fazer Deploy

Após configurar as variáveis:

```bash
# Deploy de produção
vercel --prod --scope team_iz6jrPdYbt5I3BtGFHb6hY16

# Ou aguarde o deploy automático no próximo push para main
```

---

## 🔍 Troubleshooting

### Erro: "Project not found"
- Verifique se está usando o scope correto: `--scope team_iz6jrPdYbt5I3BtGFHb6hY16`

### Erro: "Unauthorized"
- Faça login novamente: `vercel login`

### Variável já existe
- O script tentará atualizar automaticamente
- Ou delete manualmente no dashboard e adicione novamente

---

**Última atualização**: 2025-01-14

