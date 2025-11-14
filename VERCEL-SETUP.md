# 🚀 Configuração na Vercel

Guia completo para fazer deploy do **n.doc** na Vercel e configurar variáveis de ambiente.

---

## 📋 Pré-requisitos

1. Conta na Vercel (https://vercel.com)
2. Projeto Supabase criado
3. (Opcional) Conta Upstash para Redis

---

## 🔧 Passo 1: Importar Projeto

### Opção A: Via Dashboard Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em **"Import Git Repository"**
3. Conecte seu GitHub (se ainda não conectou)
4. Selecione o repositório: `resper1965/ndoc`
5. Clique em **"Import"**

### Opção B: Via CLI

```bash
# Instalar Vercel CLI (se ainda não tiver)
npm i -g vercel

# Fazer login
vercel login

# Importar projeto
vercel

# Seguir as instruções interativas
```

---

## 🔑 Passo 2: Configurar Variáveis de Ambiente

### Variáveis Obrigatórias

Você **DEVE** configurar estas variáveis para a aplicação funcionar:

#### 1. `NEXT_PUBLIC_SUPABASE_URL`
- **Onde obter**: Dashboard do Supabase → Settings → API → Project URL
- **Formato**: `https://xxxxx.supabase.co`
- **Exemplo**: `https://abcdefghijklmnop.supabase.co`

#### 2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Onde obter**: Dashboard do Supabase → Settings → API → Project API keys → `anon` `public`
- **Formato**: String longa começando com `eyJ...`
- **Exemplo**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Variáveis Opcionais

#### 3. `UPSTASH_REDIS_REST_URL` (Opcional)
- **Onde obter**: Dashboard Upstash → Seu Redis → REST API → URL
- **Quando usar**: Para rate limiting distribuído em produção
- **Se não configurar**: Rate limiting usará memória local (funciona, mas menos eficiente)

#### 4. `UPSTASH_REDIS_REST_TOKEN` (Opcional)
- **Onde obter**: Dashboard Upstash → Seu Redis → REST API → Token
- **Quando usar**: Junto com `UPSTASH_REDIS_REST_URL`

---

## ⚙️ Como Configurar na Vercel

### Via Dashboard (Recomendado)

1. **Acesse o projeto** na Vercel
2. Vá em **Settings** → **Environment Variables**
3. **Adicione cada variável**:
   - Clique em **"Add New"**
   - Digite o **Name** (ex: `NEXT_PUBLIC_SUPABASE_URL`)
   - Digite o **Value** (sua chave/URL)
   - Selecione os **Environments**:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Clique em **"Save"**
4. **Repita** para todas as variáveis

### Via CLI

```bash
# Configurar variável
vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development

# Quando solicitado, cole o valor
# Repita para cada variável
```

### Via Arquivo `.env`

A Vercel **não suporta** arquivo `.env` diretamente. Você deve usar o dashboard ou CLI.

---

## 📝 Checklist de Configuração

Antes de fazer deploy, verifique:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada
- [ ] Variáveis configuradas para **Production**, **Preview** e **Development**
- [ ] (Opcional) `UPSTASH_REDIS_REST_URL` configurada
- [ ] (Opcional) `UPSTASH_REDIS_REST_TOKEN` configurada

---

## 🚀 Passo 3: Fazer Deploy

### Primeiro Deploy

1. Após configurar as variáveis, clique em **"Deploy"**
2. Aguarde o build completar
3. Acesse a URL fornecida (ex: `https://ndoc.vercel.app`)

### Deploys Futuros

- **Automático**: A cada push para `main`, a Vercel faz deploy automaticamente
- **Manual**: Via dashboard ou CLI (`vercel --prod`)

---

## 🔍 Verificar Configuração

### Verificar Variáveis Configuradas

```bash
# Via CLI
vercel env ls

# Via Dashboard
Settings → Environment Variables
```

### Testar Aplicação

1. Acesse a URL do deploy
2. Tente fazer login
3. Verifique se os documentos carregam
4. Teste criar/editar documentos

---

## 🐛 Solução de Problemas

### Erro: "Missing environment variable"

**Solução**: Verifique se todas as variáveis obrigatórias estão configuradas.

### Erro: "Invalid Supabase URL"

**Solução**: 
- Verifique se a URL está correta (deve terminar com `.supabase.co`)
- Verifique se não há espaços extras
- Certifique-se de que copiou a URL completa

### Erro: "Invalid API Key"

**Solução**:
- Use a chave `anon` `public` (não a `service_role`)
- Verifique se copiou a chave completa
- Certifique-se de que não há espaços ou quebras de linha

### Build Falha

**Solução**:
- Verifique os logs do build na Vercel
- Certifique-se de que todas as dependências estão no `package.json`
- Verifique se o Node.js version está correto (20+)

---

## 📚 Recursos Adicionais

- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Upstash](https://docs.upstash.com/)

---

## 🔐 Segurança

### Boas Práticas

- ✅ **Nunca** commite arquivos `.env` no Git
- ✅ Use variáveis de ambiente na Vercel (não hardcode)
- ✅ Revise as variáveis antes de cada deploy
- ✅ Use diferentes projetos Supabase para dev/prod (recomendado)

### Rotação de Chaves

Se precisar rotacionar as chaves:
1. Gere novas chaves no Supabase
2. Atualize as variáveis na Vercel
3. Faça um novo deploy

---

**Última atualização**: 2025-01-14

