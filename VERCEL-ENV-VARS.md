# 🔑 Variáveis de Ambiente para Vercel

Este documento lista todas as variáveis de ambiente necessárias para o projeto **n.doc** na Vercel.

---

## 📋 Variáveis Obrigatórias

### 1. `NEXT_PUBLIC_SUPABASE_URL`

- **Descrição**: URL do projeto Supabase
- **Onde obter**: Dashboard Supabase → Settings → API → Project URL
- **Formato**: `https://xxxxx.supabase.co`
- **Exemplo**: `https://abcdefghijklmnop.supabase.co`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### 2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- **Descrição**: Chave pública anônima do Supabase
- **Onde obter**: Dashboard Supabase → Settings → API → Project API keys → `anon` `public`
- **Formato**: String JWT longa começando com `eyJ...`
- **Exemplo**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

---

## 🔧 Variáveis Opcionais

### 3. `UPSTASH_REDIS_REST_URL` (Opcional)

- **Descrição**: URL da API REST do Redis Upstash
- **Onde obter**: Dashboard Upstash → Seu Redis → REST API → URL
- **Quando usar**: Para rate limiting distribuído em produção
- **Se não configurar**: Rate limiting usará memória local (funciona, mas menos eficiente)
- **Environments**: ✅ Production, ⚠️ Preview (opcional), ❌ Development

### 4. `UPSTASH_REDIS_REST_TOKEN` (Opcional)

- **Descrição**: Token de autenticação da API REST do Redis Upstash
- **Onde obter**: Dashboard Upstash → Seu Redis → REST API → Token
- **Quando usar**: Junto com `UPSTASH_REDIS_REST_URL`
- **Environments**: ✅ Production, ⚠️ Preview (opcional), ❌ Development

---

## 📝 Como Configurar na Vercel

### Via Dashboard

1. Acesse seu projeto na Vercel
2. Vá em **Settings** → **Environment Variables**
3. Para cada variável:
   - Clique em **"Add New"**
   - Digite o **Name**
   - Digite o **Value**
   - Selecione os **Environments** (Production, Preview, Development)
   - Clique em **"Save"**

### Via CLI

```bash
# Configurar variável
vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development

# Quando solicitado, cole o valor
# Repita para cada variável
```

### Verificar Variáveis Configuradas

```bash
# Via CLI
vercel env ls

# Via Dashboard
Settings → Environment Variables
```

---

## ✅ Checklist

Antes de fazer deploy, verifique:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada
- [ ] Variáveis configuradas para **Production**, **Preview** e **Development**
- [ ] (Opcional) `UPSTASH_REDIS_REST_URL` configurada
- [ ] (Opcional) `UPSTASH_REDIS_REST_TOKEN` configurada

---

## 🔍 Projeto Vercel Encontrado

Projeto existente: **ndoc-xi1n** (`prj_IIZqdTLvxYy4oHflCl6IKYBQqcn6`)

Você pode configurar as variáveis diretamente neste projeto ou criar um novo.

---

**Última atualização**: 2025-01-14

