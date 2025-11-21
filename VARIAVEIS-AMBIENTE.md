# 🔐 Variáveis de Ambiente - n.docs

**Última atualização**: 2025-01-21

---

## 📋 Variáveis Obrigatórias

Estas variáveis **DEVEM** estar configuradas no Vercel para a aplicação funcionar:

### Supabase

```env
# URL do projeto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co

# Chave pública (anon key) do Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Chave de serviço (service role) - apenas para operações no backend
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Onde encontrar**:
- Acesse: https://supabase.com/dashboard/project/[seu-projeto]/settings/api
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: service_role key (⚠️ manter secreto)

---

## 🔧 Variáveis Opcionais

### OpenAI (para Geração de Documentos com IA)

```env
# Chave da API OpenAI
OPENAI_API_KEY=sk-...
```

**Quando usar**: Se você quiser usar a funcionalidade de geração de documentos com IA.

**Onde encontrar**: https://platform.openai.com/api-keys

---

### Upstash Redis (para Rate Limiting)

```env
# URL do Redis
UPSTASH_REDIS_REST_URL=https://seu-redis.upstash.io

# Token do Redis
UPSTASH_REDIS_REST_TOKEN=AX...
```

**Quando usar**: Se você quiser habilitar rate limiting nas APIs.

**Onde encontrar**: https://console.upstash.com/

---

## 🚀 Como Configurar no Vercel

### Método 1: Via Dashboard (Recomendado)

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto **ndocs**
3. Vá em **Settings** → **Environment Variables**
4. Clique em **Add New**
5. Para cada variável:
   - **Key**: Nome da variável (ex: `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: Valor da variável
   - **Environment**: Selecione:
     - ✅ **Production** (obrigatório)
     - ✅ **Preview** (recomendado)
     - ✅ **Development** (opcional)

### Método 2: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Adicionar variáveis (substitua os valores)
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add OPENAI_API_KEY production

# Para preview também
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
vercel env add SUPABASE_SERVICE_ROLE_KEY preview
```

---

## ✅ Checklist de Configuração

Antes de fazer deploy, verifique:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada
- [ ] `OPENAI_API_KEY` configurada (se usar IA)
- [ ] Todas as variáveis estão em **Production** e **Preview**
- [ ] Valores estão corretos (sem espaços extras)

---

## 🔍 Verificar Variáveis Configuradas

### Via Dashboard

1. Vercel Dashboard → Projeto → Settings → Environment Variables
2. Verifique se todas as variáveis estão listadas

### Via CLI

```bash
# Listar todas as variáveis
vercel env ls

# Ver valor de uma variável específica (não mostra o valor por segurança)
vercel env ls | grep SUPABASE
```

---

## ⚠️ Importante

1. **Nunca commitar** variáveis de ambiente no git
2. **Service Role Key** é sensível - nunca exponha no frontend
3. Variáveis com prefixo `NEXT_PUBLIC_` são expostas ao cliente
4. Após adicionar variáveis, **faça um novo deploy** para aplicá-las

---

## 🐛 Troubleshooting

### Variável não encontrada

**Erro**: `Environment variable not found`

**Solução**:
1. Verifique se a variável está configurada no Vercel
2. Verifique se está no ambiente correto (Production/Preview)
3. Faça um novo deploy após adicionar variáveis

### Variável não atualizada

**Solução**: Variáveis de ambiente são aplicadas apenas em novos deployments. Faça um novo deploy:

```bash
vercel --prod
```

### Build falha por variável ausente

**Solução**: Verifique o log do build no Vercel Dashboard para ver qual variável está faltando.

---

## 📝 Notas

- Variáveis são **case-sensitive**
- Não use aspas nos valores no Vercel Dashboard
- Variáveis `NEXT_PUBLIC_*` são acessíveis no browser
- Variáveis sem `NEXT_PUBLIC_` são apenas no servidor

---

**Status**: ✅ Documentação completa

