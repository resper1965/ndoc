# ⚙️ Configurar Variáveis de Ambiente no Novo Projeto

**Projeto:** ndocs  
**Project ID:** prj_2TFdAefQhPdZCEfBySN7xt5vMIma

---

## 📋 Variáveis Necessárias

Você precisa configurar estas 5 variáveis de ambiente na Vercel:

### 1. `NEXT_PUBLIC_SUPABASE_URL`
- URL do seu projeto Supabase
- Formato: `https://xxxxx.supabase.co`

### 2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Chave anônima do Supabase
- Encontrada em: Supabase Dashboard → Settings → API → anon/public key

### 3. `UPSTASH_REDIS_REST_URL`
- URL REST do Upstash Redis
- Formato: `https://xxxxx.upstash.io`

### 4. `UPSTASH_REDIS_REST_TOKEN`
- Token de autenticação do Upstash Redis

### 5. `OPENAI_API_KEY`
- Chave da API da OpenAI
- Formato: `sk-proj-...`

---

## 🚀 Como Configurar

### Opção 1: Via Dashboard (Recomendado)

1. Acesse: https://vercel.com/nessbr-projects/ndocs/settings/environment-variables
2. Para cada variável:
   - Clique em **Add New**
   - Digite o nome da variável
   - Cole o valor
   - Selecione **Production**
   - Clique em **Save**

### Opção 2: Via CLI

```bash
cd /home/resper/ndocs

# Configure cada variável (substitua os valores)
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
vercel env add OPENAI_API_KEY production
```

---

## ✅ Após Configurar

Depois de configurar todas as variáveis, avise-me para:
1. ✅ Fazer o deploy inicial
2. ✅ Verificar se está funcionando
3. ✅ Testar a URL de produção

---

**Status:** Aguardando configuração das variáveis  
**Última atualização:** 2025-11-17

