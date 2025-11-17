-- Migration: Grant RPC Permissions
-- Created: 2025-01-17
-- Description: Concede permissões explícitas para funções RPC serem acessíveis via PostgREST

-- ============================================
-- GRANT EXECUTE ON RPC FUNCTIONS
-- ============================================

-- Função: handle_new_user
-- Permitir execução por authenticated users e service_role
GRANT EXECUTE ON FUNCTION public.handle_new_user(uuid, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user(uuid, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user(uuid, text, jsonb) TO anon;

-- Função: handle_new_user_trigger
GRANT EXECUTE ON FUNCTION public.handle_new_user_trigger() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user_trigger() TO service_role;

-- Função: create_default_subscription
GRANT EXECUTE ON FUNCTION public.create_default_subscription() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_default_subscription() TO service_role;

-- Função: increment_ai_usage
GRANT EXECUTE ON FUNCTION public.increment_ai_usage(uuid, timestamp with time zone, timestamp with time zone) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_ai_usage(uuid, timestamp with time zone, timestamp with time zone) TO service_role;

-- Função: update_users_count
GRANT EXECUTE ON FUNCTION public.update_users_count() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_users_count() TO service_role;

-- Função: get_organization_limits_and_usage
GRANT EXECUTE ON FUNCTION public.get_organization_limits_and_usage(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_organization_limits_and_usage(uuid) TO service_role;

-- Função: accept_invite
GRANT EXECUTE ON FUNCTION public.accept_invite(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_invite(text, uuid) TO service_role;

-- Função: cancel_invite
GRANT EXECUTE ON FUNCTION public.cancel_invite(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_invite(uuid, uuid) TO service_role;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON FUNCTION public.handle_new_user(uuid, text, jsonb) IS
  'Cria automaticamente uma organização pessoal quando um usuário se cadastra (chamada via webhook ou API route)';

-- ============================================
-- RELOAD SCHEMA
-- ============================================
-- Forçar o PostgREST a recarregar o schema
-- Isso pode ser feito alterando algo trivial na função
ALTER FUNCTION public.handle_new_user(uuid, text, jsonb) SET search_path = public;

COMMENT ON SCHEMA public IS 'Standard public schema - updated to force PostgREST reload';
