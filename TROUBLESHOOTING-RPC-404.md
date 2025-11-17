# 🔧 Troubleshooting: Erro 404 NOT_FOUND em RPC do Supabase

**Erro:** `404: NOT_FOUND Code: NOT_FOUND ID: gru1::sdddv-1763380530723-fa976a3c857a`

---

## 🆕 SOLUÇÃO COMPLETA DISPONÍVEL

**⚠️ Este documento foi atualizado!**

Para a **solução completa e atualizada** deste erro após deploy na Vercel, consulte:

👉 **[SOLUCAO-ERRO-404-DEPLOY.md](./SOLUCAO-ERRO-404-DEPLOY.md)**

A solução inclui:
- ✅ Migration com permissões GRANT explícitas
- ✅ Passo a passo completo de aplicação
- ✅ Scripts de verificação e testes
- ✅ Análise técnica detalhada

---

## 🔍 Diagnóstico

Este erro ocorre quando o Supabase PostgREST não consegue encontrar a função RPC `handle_new_user`.

### ❌ Problema Identificado

1. ✅ Função existe no banco de dados
2. ✅ Função está no schema `public`
3. ❌ **Permissões EXECUTE NÃO foram concedidas explicitamente**
4. ✅ Função é SECURITY DEFINER

**Causa raiz:** Falta de comandos `GRANT EXECUTE` nas migrations originais.

### ⚠️ Possíveis Causas

1. **PostgREST não recarregou o schema** após criar a função
2. **Cache do PostgREST** desatualizado
3. **Problema de timing** - função criada mas ainda não exposta

---

## 🔧 Soluções

### Solução 1: Recarregar Schema do PostgREST (Recomendado)

O PostgREST precisa recarregar o schema para expor novas funções. Isso geralmente acontece automaticamente, mas pode levar alguns minutos.

**Como forçar recarregamento:**

1. Acesse: https://supabase.com/dashboard
2. Vá para: **Database** → **API**
3. Clique em **"Reload Schema"** ou **"Refresh"** (se disponível)
4. Aguarde alguns segundos
5. Teste novamente

**Ou via SQL:**
```sql
-- Não há comando direto, mas você pode:
-- 1. Fazer uma pequena alteração na função
ALTER FUNCTION public.handle_new_user(uuid, text, jsonb) SET search_path = public;
-- Isso força o PostgREST a recarregar
```

### Solução 2: Verificar se a Função Está Acessível

Teste diretamente via API REST:

```bash
curl -X POST \
  'https://ajyvonzyoyxmiczflfiz.supabase.co/rest/v1/rpc/handle_new_user' \
  -H 'apikey: SUA_ANON_KEY' \
  -H 'Authorization: Bearer SEU_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "00000000-0000-0000-0000-000000000000",
    "user_email": "test@example.com",
    "user_metadata": {}
  }'
```

Se retornar 404, o PostgREST não está vendo a função.

### Solução 3: Recriar a Função

Às vezes, recriar a função força o PostgREST a recarregar:

```sql
-- Recriar a função (isso força o PostgREST a recarregar)
DROP FUNCTION IF EXISTS public.handle_new_user(uuid, text, jsonb);

-- Depois executar a migration novamente
-- Ou copiar o conteúdo de: supabase/migrations/20250115000000_auto_create_organization.sql
```

### Solução 4: Aguardar (Temporária)

O PostgREST recarrega o schema automaticamente a cada poucos minutos. Se você acabou de criar a função, aguarde 2-5 minutos e tente novamente.

---

## ✅ Verificação Final

Após aplicar uma solução, verifique:

1. **Função existe:**
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';
   ```

2. **Permissões corretas:**
   ```sql
   SELECT grantee, privilege_type
   FROM information_schema.routine_privileges
   WHERE routine_name = 'handle_new_user';
   ```

3. **Teste via API:**
   - Use o curl acima ou
   - Teste via aplicação

---

## 📝 Notas

- O PostgREST do Supabase recarrega o schema automaticamente, mas pode levar alguns minutos
- Funções criadas via migrations podem não estar imediatamente disponíveis
- Se o problema persistir, pode ser necessário contatar o suporte do Supabase

---

**Última atualização:** 2025-01-17 (Solução completa adicionada em SOLUCAO-ERRO-404-DEPLOY.md)

