-- Script de Verificação: Permissões RPC do Supabase
-- Execute este script no SQL Editor do Supabase Dashboard
-- Para verificar se todas as funções RPC estão acessíveis

-- ============================================
-- 1. VERIFICAR SE AS FUNÇÕES EXISTEM
-- ============================================
SELECT
  proname as function_name,
  prosecdef as is_security_definer,
  proargnames as argument_names,
  pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND proname IN (
    'handle_new_user',
    'handle_new_user_trigger',
    'create_default_subscription',
    'increment_ai_usage',
    'update_users_count',
    'get_organization_limits_and_usage',
    'accept_invite',
    'cancel_invite'
  )
ORDER BY proname;

-- ============================================
-- 2. VERIFICAR PERMISSÕES EXECUTE
-- ============================================
SELECT
  routine_name as function_name,
  grantee as role,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
  AND routine_name IN (
    'handle_new_user',
    'handle_new_user_trigger',
    'create_default_subscription',
    'increment_ai_usage',
    'update_users_count',
    'get_organization_limits_and_usage',
    'accept_invite',
    'cancel_invite'
  )
ORDER BY routine_name, grantee;

-- ============================================
-- 3. VERIFICAR SE handle_new_user ESTÁ EXPOSTA PELO POSTGREST
-- ============================================
-- Esta query verifica se a função está no schema público
-- e tem as permissões corretas para ser exposta pelo PostgREST
SELECT
  p.proname as function_name,
  n.nspname as schema_name,
  p.prosecdef as is_security_definer,
  pg_get_function_arguments(p.oid) as arguments,
  pg_catalog.obj_description(p.oid, 'pg_proc') as description
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'handle_new_user';

-- ============================================
-- 4. TESTE DIRETO DA FUNÇÃO (SIMULAÇÃO)
-- ============================================
-- Teste com dados fictícios para verificar se a função funciona
SELECT handle_new_user(
  '00000000-0000-0000-0000-000000000000'::UUID,
  'test-verification@example.com',
  '{}'::JSONB
) AS test_result;

-- ⚠️ NOTA: O teste acima vai tentar criar uma organização
-- Se você não quiser criar uma organização de teste, comente a linha acima

-- ============================================
-- 5. VERIFICAR MIGRATIONS APLICADAS
-- ============================================
-- Verifica se a migration de permissões foi aplicada
SELECT * FROM public.schema_migrations
ORDER BY version DESC
LIMIT 10;

-- ============================================
-- RESULTADOS ESPERADOS
-- ============================================
-- Query 1: Deve retornar 8 funções com is_security_definer = true
-- Query 2: Deve retornar permissões EXECUTE para anon, authenticated, service_role
--          - handle_new_user: anon, authenticated, service_role
--          - handle_new_user_trigger: authenticated, service_role
--          - create_default_subscription: authenticated, service_role
--          - increment_ai_usage: authenticated, service_role
--          - update_users_count: authenticated, service_role
--          - get_organization_limits_and_usage: authenticated, service_role
--          - accept_invite: authenticated, service_role
--          - cancel_invite: authenticated, service_role
-- Query 3: Deve retornar 1 linha com a função handle_new_user
-- Query 4: Deve retornar um JSON com {"success": false, "error": "..."}
--          (erro porque o user_id não existe)
-- Query 5: Deve incluir a versão 20250117000000

-- ============================================
-- TROUBLESHOOTING
-- ============================================
-- Se alguma query não retornar os resultados esperados:
--
-- 1. SE FUNÇÕES NÃO EXISTEM (Query 1):
--    - Execute as migrations na ordem:
--      - 20250113000000_initial_schema.sql
--      - 20250115000000_auto_create_organization.sql
--      - 20250115000001_plans_and_subscriptions.sql
--      - 20250115000002_audit_logs.sql
--      - 20250115000003_team_invites.sql
--      - 20250115000004_usage_helpers.sql
--
-- 2. SE PERMISSÕES NÃO EXISTEM (Query 2):
--    - Execute a migration: 20250117000000_grant_rpc_permissions.sql
--    - Aguarde 5 minutos para o PostgREST recarregar
--    - Ou force o reload: ALTER FUNCTION handle_new_user(...) SET search_path = public;
--
-- 3. SE POSTGREST NÃO EXPÕE A FUNÇÃO (Erro 404 na API):
--    - Verifique se o schema está recarregado (Query 3 deve retornar 1 linha)
--    - Force reload do PostgREST via Dashboard: Database → API → Reload Schema
--    - Ou pause/resume o projeto no Supabase
--    - Aguarde 5 minutos e teste novamente
--
-- 4. SE MIGRATIONS NÃO FORAM APLICADAS (Query 5):
--    - Verifique se você executou as migrations no projeto correto
--    - O Supabase Dashboard deve mostrar todas as migrations aplicadas
--    - Se não aparece 20250117000000, execute manualmente

-- ============================================
-- FORÇAR RELOAD DO POSTGREST
-- ============================================
-- Execute apenas se as permissões foram concedidas mas o erro persiste
-- ALTER FUNCTION public.handle_new_user(UUID, TEXT, JSONB) SET search_path = public;
-- ALTER FUNCTION public.get_organization_limits_and_usage(UUID) SET search_path = public;
-- ALTER FUNCTION public.accept_invite(TEXT, UUID) SET search_path = public;
-- ALTER FUNCTION public.cancel_invite(UUID, UUID) SET search_path = public;
-- ALTER FUNCTION public.increment_ai_usage(UUID, TIMESTAMPTZ, TIMESTAMPTZ) SET search_path = public;

-- ============================================
-- TESTE VIA CURL (FORA DO SUPABASE)
-- ============================================
-- Depois de verificar as permissões, teste via curl:
--
-- curl -X POST \
--   'https://ajyvonzyoyxmiczflfiz.supabase.co/rest/v1/rpc/handle_new_user' \
--   -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqeXZvbnp5b3l4bWljemZsZml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczMDU4NjUsImV4cCI6MjA1Mjg4MTg2NX0.V_fh2Ij_OGlbP3YRBo3Z1kvdaHo5p90K2UW1yBOTPKg' \
--   -H 'Content-Type: application/json' \
--   -H 'Prefer: return=representation' \
--   -d '{
--     "user_id": "00000000-0000-0000-0000-000000000000",
--     "user_email": "test@example.com",
--     "user_metadata": {}
--   }'
--
-- Resultado esperado (função acessível):
-- {"success": false, "error": "...", ...}
--
-- Resultado de erro (função não encontrada):
-- {"code": "PGRST116", "message": "Could not find the function public.handle_new_user..."}
