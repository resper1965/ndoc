# 🔧 Resolução: Erro 404 NOT_FOUND Após Deploy na Vercel

**Data:** 2025-01-17
**Status:** 🎯 Ferramentas de Diagnóstico Disponíveis
**Erro:** `404: NOT_FOUND Code: NOT_FOUND ID: gru1::z7kk9-1763383260946-6d4fbddc4af4`

---

## 📋 Resumo do Problema

Após o deploy na Vercel, a aplicação apresenta erro 404 NOT_FOUND ao tentar criar organizações automaticamente após o signup. Este erro ocorre quando o PostgREST (API REST do Supabase) não consegue encontrar a função RPC `handle_new_user`.

**Causas mais comuns:**
1. ❌ Falta de permissões `GRANT EXECUTE` nas funções RPC
2. ⏰ PostgREST não recarregou o schema após as migrations
3. 🔄 Cache do PostgREST desatualizado
4. 🚫 Migrations não foram aplicadas no Supabase

---

## 🎯 Ferramentas de Diagnóstico Criadas

### 1. Script SQL de Verificação

**Arquivo:** `scripts/verify_rpc_permissions.sql`

Este script verifica:
- ✅ Se as funções RPC existem no banco de dados
- ✅ Se as permissões EXECUTE foram concedidas
- ✅ Se as funções estão expostas pelo PostgREST
- ✅ Se as migrations foram aplicadas

**Como usar:**
1. Acesse: https://supabase.com/dashboard/project/ajyvonzyoyxmiczflfiz/sql
2. Copie o conteúdo de `scripts/verify_rpc_permissions.sql`
3. Cole no SQL Editor
4. Clique em "Run"
5. Analise os resultados (comentários explicam o que esperar)

### 2. Rota de Diagnóstico da API

**URL:** `https://ndoc-eight.vercel.app/api/diagnostic`

Esta rota verifica:
- ✅ Variáveis de ambiente configuradas
- ✅ Conexão com Supabase
- ✅ Autenticação funcionando
- ✅ Funções RPC acessíveis via PostgREST

**Como usar:**
```bash
curl https://ndoc-eight.vercel.app/api/diagnostic
```

Ou acesse diretamente no navegador:
https://ndoc-eight.vercel.app/api/diagnostic

**Resultado esperado (saudável):**
```json
{
  "summary": {
    "overall_status": "healthy",
    "total_checks": 5,
    "passed": 5,
    "failed": 0
  },
  "checks": {
    "environment_vars": { "status": "pass" },
    "supabase_connection": { "status": "pass" },
    "authentication": { "status": "info" },
    "rpc_handle_new_user": { "status": "pass" },
    "rpc_get_limits": { "status": "pass" }
  }
}
```

**Resultado com problema (RPC 404):**
```json
{
  "summary": {
    "overall_status": "degraded",
    "total_checks": 5,
    "passed": 3,
    "failed": 2
  },
  "checks": {
    "rpc_handle_new_user": {
      "status": "fail",
      "details": {
        "error": "Function not found by PostgREST",
        "hint": "Missing GRANT EXECUTE permissions or PostgREST needs reload"
      }
    }
  }
}
```

---

## ✅ Solução Passo a Passo

### Passo 1: Executar o Diagnóstico

1. **Execute a rota de diagnóstico:**
   ```bash
   curl https://ndoc-eight.vercel.app/api/diagnostic | jq
   ```

2. **Analise o resultado:**
   - Se `overall_status` for `"healthy"` → Problema resolvido! ✅
   - Se `overall_status` for `"degraded"` ou `"unhealthy"` → Continue para o Passo 2

### Passo 2: Verificar Permissões no Supabase

1. **Acesse o SQL Editor:**
   - URL: https://supabase.com/dashboard/project/ajyvonzyoyxmiczflfiz/sql

2. **Execute o script de verificação:**
   - Copie: `scripts/verify_rpc_permissions.sql`
   - Cole no editor
   - Clique em "Run"

3. **Analise Query 2 (Permissões EXECUTE):**

   **Se não houver permissões para `handle_new_user`:**
   - Você precisa aplicar a migration de permissões (Passo 3)

   **Se as permissões existirem:**
   - O PostgREST precisa recarregar o schema (Passo 4)

### Passo 3: Aplicar Migration de Permissões

**⚠️ Execute apenas se a Query 2 do Passo 2 não mostrou permissões**

1. **Acesse o SQL Editor:**
   - URL: https://supabase.com/dashboard/project/ajyvonzyoyxmiczflfiz/sql

2. **Execute a migration:**

   Copie o arquivo `supabase/migrations/20250117000000_grant_rpc_permissions.sql` OU execute diretamente:

   ```sql
   -- Função: handle_new_user
   GRANT EXECUTE ON FUNCTION public.handle_new_user(UUID, TEXT, JSONB) TO authenticated;
   GRANT EXECUTE ON FUNCTION public.handle_new_user(UUID, TEXT, JSONB) TO service_role;
   GRANT EXECUTE ON FUNCTION public.handle_new_user(UUID, TEXT, JSONB) TO anon;

   -- Função: get_organization_limits_and_usage
   GRANT EXECUTE ON FUNCTION public.get_organization_limits_and_usage(UUID) TO authenticated;
   GRANT EXECUTE ON FUNCTION public.get_organization_limits_and_usage(UUID) TO service_role;

   -- Função: accept_invite
   GRANT EXECUTE ON FUNCTION public.accept_invite(TEXT, UUID) TO authenticated;
   GRANT EXECUTE ON FUNCTION public.accept_invite(TEXT, UUID) TO service_role;

   -- Função: cancel_invite
   GRANT EXECUTE ON FUNCTION public.cancel_invite(UUID, UUID) TO authenticated;
   GRANT EXECUTE ON FUNCTION public.cancel_invite(UUID, UUID) TO service_role;

   -- Forçar reload do PostgREST
   ALTER FUNCTION public.handle_new_user(UUID, TEXT, JSONB) SET search_path = public;
   ```

3. **Clique em "Run"**

### Passo 4: Recarregar Schema do PostgREST

O PostgREST precisa recarregar o schema para expor as funções com novas permissões.

**Opção A: Aguardar Recarga Automática (Recomendado)**
- Aguarde 5 minutos
- O PostgREST recarrega automaticamente
- Execute novamente: `curl https://ndoc-eight.vercel.app/api/diagnostic`

**Opção B: Forçar Recarga (Imediato)**

Execute no SQL Editor:
```sql
-- Forçar reload alterando trivialmente as funções
ALTER FUNCTION public.handle_new_user(UUID, TEXT, JSONB) SET search_path = public;
ALTER FUNCTION public.get_organization_limits_and_usage(UUID) SET search_path = public;
ALTER FUNCTION public.accept_invite(TEXT, UUID) SET search_path = public;
ALTER FUNCTION public.cancel_invite(UUID, UUID) SET search_path = public;
```

**Opção C: Reiniciar Projeto Supabase (Último Recurso)**
1. Dashboard → Settings → General
2. "Pause Project"
3. Aguarde pausa completa
4. "Resume Project"
5. ⚠️ Causará downtime de ~2 minutos

### Passo 5: Verificar Resolução

1. **Execute o diagnóstico novamente:**
   ```bash
   curl https://ndoc-eight.vercel.app/api/diagnostic | jq
   ```

2. **Verifique se `overall_status` é `"healthy"`**

3. **Teste na aplicação:**
   - Acesse: https://ndoc-eight.vercel.app/signup
   - Crie uma conta de teste
   - Verifique se a organização é criada automaticamente
   - Verifique no Supabase Dashboard: Table Editor → `organizations`

---

## 🔍 Análise Técnica

### Onde o Erro Ocorre

**Arquivo:** `src/app/api/organization/create/route.ts:44`

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
Tratamento de erro em route.ts:56-66
```

### Por Que o Erro Ocorre

1. **Funções RPC no Supabase precisam de permissões explícitas**
   - Mesmo sendo `SECURITY DEFINER`, funções RPC precisam de `GRANT EXECUTE`
   - Sem `GRANT EXECUTE`, o PostgREST não expõe a função via API REST

2. **PostgREST Cache**
   - O PostgREST mantém um cache do schema do banco
   - Mudanças nas funções só são visíveis após reload do cache
   - Reload automático acontece periodicamente (~5 minutos)

3. **Migrations não incluíam GRANT inicialmente**
   - As migrations originais criaram as funções
   - Mas não concederam permissões de execução
   - Por isso a função existe no banco, mas não está acessível via API

---

## 📊 Checklist de Resolução

Use este checklist para garantir que tudo está correto:

- [ ] **Executei a rota de diagnóstico**: `curl https://ndoc-eight.vercel.app/api/diagnostic`
- [ ] **Executei o script SQL de verificação**: `scripts/verify_rpc_permissions.sql`
- [ ] **Verifiquei que as funções existem**: Query 1 retornou 8 funções
- [ ] **Verifiquei permissões EXECUTE**: Query 2 mostrou permissões para `anon`, `authenticated`, `service_role`
- [ ] **Apliquei a migration de permissões** (se necessário): `20250117000000_grant_rpc_permissions.sql`
- [ ] **Forçei reload do PostgREST** ou aguardei 5 minutos
- [ ] **Executei diagnóstico novamente**: `overall_status` = `"healthy"`
- [ ] **Testei na aplicação**: Signup cria organização automaticamente
- [ ] **Verifiquei no Supabase**: Nova organização aparece em `organizations`

---

## 🆘 Se o Problema Persistir

### 1. Verificar Logs do Supabase

1. Acesse: https://supabase.com/dashboard/project/ajyvonzyoyxmiczflfiz/logs
2. Vá para: **API Logs**
3. Procure por erros relacionados a `handle_new_user`
4. Procure por códigos: `PGRST116`, `NOT_FOUND`, `404`

### 2. Verificar Variáveis de Ambiente na Vercel

1. Acesse: https://vercel.com/resper1965/ndoc/settings/environment-variables
2. Verifique se estão corretas:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://ajyvonzyoyxmiczflfiz.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (sua chave anon)

3. Se alterou, faça redeploy:
   ```bash
   git commit --allow-empty -m "trigger redeploy"
   git push
   ```

### 3. Testar em Ambiente Local

```bash
# Clone o repositório
git clone https://github.com/resper1965/ndoc.git
cd ndoc

# Instale dependências
pnpm install

# Configure .env.local
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Execute localmente
pnpm dev

# Acesse http://localhost:3000/signup e teste
```

### 4. Teste Direto via curl

```bash
# Teste se a função está exposta pelo PostgREST
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

**Resultado esperado (função acessível):**
```json
{
  "success": false,
  "error": "...",
  "user_id": "00000000-0000-0000-0000-000000000000",
  "user_email": "test@example.com"
}
```

**Resultado de erro (função não encontrada - problema persiste):**
```json
{
  "code": "PGRST116",
  "message": "Could not find the function public.handle_new_user..."
}
```

### 5. Contatar Suporte do Supabase

Se nenhuma solução funcionar:
- Pode ser um problema específico do PostgREST
- Contate: https://supabase.com/support
- Forneça:
  - Project ID: `ajyvonzyoyxmiczflfiz`
  - Erro: `404: NOT_FOUND ao chamar RPC handle_new_user`
  - Contexto: "Funções existem e têm GRANT EXECUTE, mas PostgREST não expõe via API"

---

## 📚 Arquivos Relacionados

- **Script de verificação SQL:** `scripts/verify_rpc_permissions.sql`
- **Rota de diagnóstico:** `src/app/api/diagnostic/route.ts`
- **Migration de permissões:** `supabase/migrations/20250117000000_grant_rpc_permissions.sql`
- **Migration de criação da função:** `supabase/migrations/20250115000000_auto_create_organization.sql`
- **Rota que chama a RPC:** `src/app/api/organization/create/route.ts`

## 📖 Documentação Relacionada

- [TROUBLESHOOTING-RPC-404.md](./TROUBLESHOOTING-RPC-404.md) - Troubleshooting original
- [SOLUCAO-ERRO-404-DEPLOY.md](./SOLUCAO-ERRO-404-DEPLOY.md) - Solução anterior
- [WEBHOOK-SETUP.md](./WEBHOOK-SETUP.md) - Configuração de webhooks (alternativa)
- [MIGRATIONS.md](./MIGRATIONS.md) - Guia de migrations
- [Supabase RPC Documentation](https://supabase.com/docs/guides/database/functions)
- [PostgREST Schema Cache](https://postgrest.org/en/stable/admin.html#schema-cache)

---

## 📝 Notas Finais

- Este documento foi criado após análise do erro persistente 404 após deploy
- As ferramentas de diagnóstico criadas devem facilitar muito o troubleshooting
- A rota `/api/diagnostic` pode ser usada em monitoring e health checks
- O script SQL pode ser executado periodicamente para verificar integridade

**Última atualização:** 2025-01-17
**Autor:** Sistema de diagnóstico automatizado
