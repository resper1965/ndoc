# 🔄 Guia: Recriar Projeto na Vercel

**Objetivo:** Resolver problema de 404 NOT_FOUND recriando o projeto do zero

---

## 📋 Passos

### 1. **Apagar Projeto Atual na Vercel**

1. Acesse: https://vercel.com/dashboard
2. Vá em **Settings** → **General**
3. Role até o final e clique em **Delete Project**
4. Confirme a exclusão

### 2. **Criar Novo Projeto**

**Opção A: Via Dashboard (Recomendado)**
1. Clique em **Add New** → **Project**
2. Importe o repositório: `resper1965/ndoc`
3. Configure:
   - **Project Name:** `ndocs` (ou outro nome)
   - **Framework Preset:** Next.js (deve detectar automaticamente)
   - **Root Directory:** `./` (raiz)
   - **Build Command:** `pnpm build` (ou deixar padrão)
   - **Output Directory:** `.next` (ou deixar padrão)
   - **Install Command:** `pnpm install` (ou deixar padrão)

**Opção B: Via CLI (Após apagar o projeto)**
```bash
cd /home/resper/ndocs
vercel
# Siga as instruções interativas
```

### 3. **Configurar Variáveis de Ambiente**

Após criar o projeto, configure as variáveis de ambiente na Vercel:

**Via Dashboard:**
1. Vá em **Settings** → **Environment Variables**
2. Adicione cada variável para **Production**:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
OPENAI_API_KEY
```

**Via CLI (após linkar o projeto):**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
vercel env add OPENAI_API_KEY production
```

### 4. **Fazer Deploy Inicial**

```bash
cd /home/resper/ndocs
vercel --prod
```

### 5. **Verificar**

1. Acesse a URL de produção fornecida pela Vercel
2. Teste se a página inicial carrega
3. Verifique logs se houver problemas

---

## ✅ Vantagens de Recriar

- ✅ Remove configurações corrompidas
- ✅ Limpa cache antigo
- ✅ Começa com configuração limpa
- ✅ Pode resolver problemas de domínio/alias
- ✅ Garante que todas as configurações estão corretas

---

## ⚠️ Importante

Após recriar, você precisará:
- ✅ Reconfigurar todas as variáveis de ambiente
- ✅ Fazer novo deploy
- ✅ Atualizar `.vercel/project.json` (será feito automaticamente pelo CLI)
- ✅ Verificar se o domínio de produção está correto

---

**Status:** Aguardando recriação do projeto  
**Última atualização:** 2025-11-17

