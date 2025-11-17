# 🔧 Solução: Erro 404 NOT_FOUND após Deploy na Vercel

**Erro:** `404: NOT_FOUND Code: NOT_FOUND ID: gru1::8t5vj-1763381186820-2511372a20f6`

**Data:** 2025-01-17
**Status:** 🔧 Solução Disponível

---

## 📋 Resumo Executivo

O erro 404 ocorre quando a aplicação tenta chamar a função RPC `handle_new_user` do Supabase, mas o PostgREST (API REST do Supabase) não consegue encontrar a função.

**Causas identificadas:**
1. ❌ Falta de permissões GRANT explícitas nas funções RPC
2. ⏰ PostgREST não recarregou o schema após as migrations
3. 🔄 Cache do PostgREST desatualizado

---

## ✅ Solução Completa (Passo a Passo)

### Passo 1: Aplicar a Nova Migration no Supabase

1. **Acesse o Supabase Dashboard:**
   - URL: https://supabase.com/dashboard
   - Vá para o projeto: `ajyvonzyoyxmiczflfiz`

2. **Navegue para SQL Editor:**
   - Menu lateral: **SQL Editor**
   - Clique em **"+ New Query"**

3. **Execute a Migration de Permissões:**

   Copie e cole o conteúdo do arquivo `supabase/migrations/20250117000000_grant_rpc_permissions.sql` e execute.

   Ou execute diretamente este SQL:

   ```sql
   -- GRANT EXECUTE ON RPC FUNCTIONS

   -- Função: handle_new_user
   GRANT EXECUTE ON FUNCTION public.handle_new_user(UUID, TEXT, JSONB) TO authenticated;
   GRANT EXECUTE ON FUNCTION public.handle_new_user(UUID, TEXT, JSONB) TO service_role;
   GRANT EXECUTE ON FUNCTION public.handle_new_user(UUID, TEXT, JSONB) TO anon;

   -- Função: handle_new_user_trigger
   GRANT EXECUTE ON FUNCTION public.handle_new_user_trigger() TO authenticated;
   GRANT EXECUTE ON FUNCTION public.handle_new_user_trigger() TO service_role;

   -- Função: create_default_subscription
   GRANT EXECUTE ON FUNCTION public.create_default_subscription() TO authenticated;
   GRANT EXECUTE ON FUNCTION public.create_default_subscription() TO service_role;

   -- Função: increment_ai_usage
   GRANT EXECUTE ON FUNCTION public.increment_ai_usage(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
   GRANT EXECUTE ON FUNCTION public.increment_ai_usage(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO service_role;

   -- Função: get_organization_limits_and_usage
   GRANT EXECUTE ON FUNCTION public.get_organization_limits_and_usage(UUID) TO authenticated;
   GRANT EXECUTE ON FUNCTION public.get_organization_limits_and_usage(UUID) TO service_role;

   -- Função: accept_invite
   GRANT EXECUTE ON FUNCTION public.accept_invite(UUID, UUID) TO authenticated;
   GRANT EXECUTE ON FUNCTION public.accept_invite(UUID, UUID) TO service_role;

   -- Função: cancel_invite
   GRANT EXECUTE ON FUNCTION public.cancel_invite(UUID, UUID) TO authenticated;
   GRANT EXECUTE ON FUNCTION public.cancel_invite(UUID, UUID) TO service_role;

   -- Forçar reload do PostgREST
   ALTER FUNCTION public.handle_new_user(UUID, TEXT, JSONB) SET search_path = public;
   ```

4. **Clique em "Run" para executar**

### Passo 2: Verificar se a Função Está Acessível

Execute este SQL para verificar as permissões:

```sql
-- Verificar se a função existe
SELECT
  proname as function_name,
  prosecdef as is_security_definer,
  proargnames as argument_names
FROM pg_proc
WHERE proname = 'handle_new_user';

-- Verificar permissões
SELECT
  grantee,
  privilege_type,
  routine_name
FROM information_schema.routine_privileges
WHERE routine_name = 'handle_new_user';
```

**Resultado esperado:**
- A função deve existir com `is_security_definer = true`
- Deve haver permissões EXECUTE para: `anon`, `authenticated`, `service_role`

### Passo 3: Recarregar o Schema do PostgREST

O PostgREST precisa recarregar o schema para expor as funções com novas permissões.

**Opção A: Aguardar Recarga Automática (2-5 minutos)**
- O PostgREST recarrega automaticamente a cada poucos minutos
- Aguarde 5 minutos e teste novamente

**Opção B: Forçar Recarga (Imediato)**

1. **Via Supabase Dashboard:**
   - Vá para: **Database** → **API**
   - Procure por opção de "Reload Schema" ou "Refresh" (se disponível)

2. **Via SQL (já incluído na migration):**
   - O comando `ALTER FUNCTION ... SET search_path` força o reload
   - Já está incluído na migration acima

3. **Via Restart do Projeto (último recurso):**
   - Dashboard → Settings → General
   - "Pause Project" e depois "Resume Project"
   - ⚠️ Causará downtime de ~2 minutos

### Passo 4: Testar via API REST

Teste diretamente se a função está exposta pelo PostgREST:

```bash
curl -X POST \
  'https://ajyvonzyoyxmiczflfiz.supabase.co/rest/v1/rpc/handle_new_user' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqeXZvbnp5b3l4bWljemZsZml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczMDU4NjUsImV4cCI6MjA1Mjg4MTg2NX0.V_fh2Ij_OGlbP3YRBo3Z1kvdaHo5p90K2UW1yBOTPKg' \
  -H 'Content-Type: application/json' \
  -H 'Prefer: return=representation' \
  -d '{
    "user_id": "00000000-0000-0000-0000-000000000000",
    "user_email": "test@example.com",
    "user_metadata": {}
  }'
```

**Resultados esperados:**

✅ **Sucesso (função acessível):**
```json
{
  "success": true,
  "organization_id": "...",
  "organization_slug": "...",
  "message": "Organization created successfully"
}
```
ou erro de lógica de negócio (OK - significa que a função foi chamada):
```json
{
  "success": false,
  "error": "...",
  "user_id": "...",
  "user_email": "..."
}
```

❌ **Falha (função não encontrada - problema persiste):**
```json
{
  "code": "PGRST116",
  "message": "Could not find the function public.handle_new_user..."
}
```

### Passo 5: Testar na Aplicação

1. **Acesse:** https://ndoc-eight.vercel.app/signup
2. **Crie uma conta de teste:**
   - Nome: Teste
   - Email: teste@example.com
   - Senha: 123456
3. **Verifique os logs do navegador** (F12 → Console)
4. **Verifique no Supabase Dashboard:**
   - Vá para: **Table Editor** → `organizations`
   - Deve aparecer uma nova organização criada

---

## 🔍 Análise Técnica Detalhada

### Onde o Erro Ocorre

**Arquivo:** `src/app/api/organization/create/route.ts`
**Linha:** 44

```typescript
const { data, error } = await supabase.rpc('handle_new_user', {
  user_id: user.id,
  user_email: user.email || '',
  user_metadata: user.user_metadata || {},
});
```

### Fluxo Completo

```
Usuario → /signup
    ↓
Supabase Auth cria usuario
    ↓
Frontend chama POST /api/organization/create
    ↓
API route chama supabase.rpc('handle_new_user')
    ↓
[ERRO 404] PostgREST não encontra a função
    ↓
Tratamento de erro em src/app/api/organization/create/route.ts:56-66
```

### Por que o Erro Ocorre

1. **Funções RPC no Supabase precisam de permissões explícitas**
   - Mesmo sendo `SECURITY DEFINER`, funções RPC precisam de `GRANT EXECUTE`
   - Sem `GRANT EXECUTE`, o PostgREST não expõe a função via API

2. **PostgREST Cache**
   - O PostgREST mantém um cache do schema do banco
   - Mudanças nas funções só são visíveis após reload do cache
   - Reload automático acontece periodicamente (~5 minutos)

3. **Migrations não incluíam GRANT**
   - As migrations originais criaram as funções
   - Mas não concederam permissões de execução
   - Por isso a função existe no banco, mas não está acessível via API

### Código de Tratamento do Erro

A aplicação já tem tratamento específico para este erro:

```typescript
// src/app/api/organization/create/route.ts:56-66
if (error.code === 'PGRST116' || error.message?.includes('NOT_FOUND') || error.message?.includes('404')) {
  return NextResponse.json(
    {
      error: 'Função handle_new_user não encontrada via RPC. O PostgREST pode precisar recarregar o schema.',
      details: error.message,
      code: error.code,
      hint: 'Tente recarregar o schema do PostgREST no Supabase Dashboard ou aguarde alguns minutos. Veja TROUBLESHOOTING-RPC-404.md para mais detalhes.'
    },
    { status: 500 }
  );
}
```

---

## 📚 Referências

- [TROUBLESHOOTING-RPC-404.md](./TROUBLESHOOTING-RPC-404.md) - Guia original de troubleshooting
- [WEBHOOK-SETUP.md](./WEBHOOK-SETUP.md) - Configuração de webhooks (alternativa)
- [MIGRATIONS.md](./MIGRATIONS.md) - Guia de migrations
- [Supabase RPC Documentation](https://supabase.com/docs/guides/database/functions)
- [PostgREST Schema Cache](https://postgrest.org/en/stable/admin.html#schema-cache)

---

## ✅ Checklist de Verificação

Após aplicar a solução, verifique:

- [ ] Migration `20250117000000_grant_rpc_permissions.sql` executada
- [ ] Permissões GRANT verificadas via SQL
- [ ] PostgREST recarregado (aguardar 5 min ou forçar)
- [ ] Teste via curl retorna sucesso ou erro de lógica de negócio (não 404)
- [ ] Teste na aplicação: signup cria organização automaticamente
- [ ] Verificar no Supabase Dashboard: nova organização aparece em `organizations`

---

## 🆘 Se o Problema Persistir

Se após aplicar todas as soluções o erro continuar:

1. **Verifique os logs do Supabase:**
   - Dashboard → Logs → API Logs
   - Procure por erros relacionados a `handle_new_user`

2. **Verifique as variáveis de ambiente na Vercel:**
   - `NEXT_PUBLIC_SUPABASE_URL` está correto?
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` está correto?

3. **Teste em ambiente local:**
   ```bash
   npm run dev
   # Acesse http://localhost:3000/signup
   ```

4. **Contate o suporte do Supabase:**
   - Se nenhuma solução funcionar, pode ser um problema do PostgREST
   - https://supabase.com/support

---

**Última atualização:** 2025-01-17
**Criado por:** Análise automatizada do codebase
