-- Migration: Auto-create organization on signup
-- Created: 2025-01-15
-- Description: Cria automaticamente uma organização pessoal quando um usuário se cadastra
--
-- ⚠️ IMPORTANTE: Esta migration cria apenas a FUNÇÃO.
-- O trigger em auth.users NÃO pode ser criado via SQL (permissões).
-- Você deve configurar um Database Webhook no Supabase Dashboard.
-- Veja: WEBHOOK-SETUP.md para instruções completas.

-- ============================================
-- FUNCTION: Auto-create organization on signup
-- ============================================

-- Versão com parâmetros (para webhook)
CREATE OR REPLACE FUNCTION handle_new_user(user_id UUID, user_email TEXT, user_metadata JSONB)
RETURNS JSONB AS $$
DECLARE
  new_org_id UUID;
  org_slug TEXT;
  counter INT := 0;
  base_slug TEXT;
  user_name TEXT;
BEGIN
  -- Criar slug base a partir do email (antes do @)
  base_slug := LOWER(SPLIT_PART(user_email, '@', 1));

  -- Remover caracteres especiais e espaços
  base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9-]', '', 'g');

  -- Garantir que o slug não esteja vazio
  IF base_slug = '' THEN
    base_slug := 'org';
  END IF;

  org_slug := base_slug;

  -- Tentar criar slug único (se já existir, adicionar número)
  WHILE EXISTS (SELECT 1 FROM organizations WHERE slug = org_slug) LOOP
    counter := counter + 1;
    org_slug := base_slug || '-' || counter::TEXT;
  END LOOP;

  -- Extrair nome do usuário do metadata
  user_name := COALESCE(
    user_metadata->>'name',
    user_metadata->>'full_name',
    SPLIT_PART(user_email, '@', 1)
  );

  -- Criar organização pessoal
  INSERT INTO organizations (name, slug, plan, settings)
  VALUES (
    user_name || '''s Organization',
    org_slug,
    'free',
    jsonb_build_object(
      'auto_created', true,
      'created_from', 'signup',
      'user_email', user_email
    )
  )
  RETURNING id INTO new_org_id;

  -- Adicionar usuário como owner da organização
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (new_org_id, user_id, 'owner');

  -- Retornar informações da organização criada
  RETURN jsonb_build_object(
    'success', true,
    'organization_id', new_org_id,
    'organization_slug', org_slug,
    'message', 'Organization created successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, retornar detalhes
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'user_id', user_id,
      'user_email', user_email
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Versão compatível com trigger (fallback)
-- ============================================

-- Esta versão é compatível com triggers, mas NÃO será usada em auth.users
-- Mantida para compatibilidade caso seja necessária em outras tabelas
CREATE OR REPLACE FUNCTION handle_new_user_trigger()
RETURNS TRIGGER AS $$
DECLARE
  result JSONB;
BEGIN
  result := handle_new_user(
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data, '{}'::JSONB)
  );

  -- Log do resultado (opcional)
  RAISE NOTICE 'handle_new_user result: %', result;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ⚠️ TRIGGER NÃO CRIADO (Requer Webhook)
-- ============================================

-- O trigger abaixo NÃO pode ser criado via SQL porque auth.users
-- é uma tabela gerenciada pelo Supabase.
--
-- SOLUÇÃO: Configure um Database Webhook no Supabase Dashboard
--
-- Passos:
-- 1. Dashboard > Database > Webhooks
-- 2. Evento: auth.users INSERT
-- 3. Tipo: HTTP Request
-- 4. URL: https://[PROJECT_REF].supabase.co/rest/v1/rpc/handle_new_user
-- 5. Método: POST
-- 6. Headers:
--    - Content-Type: application/json
--    - apikey: [SUPABASE_SERVICE_ROLE_KEY]
-- 7. Payload template:
--    {
--      "user_id": "{{ record.id }}",
--      "user_email": "{{ record.email }}",
--      "user_metadata": {{ record.raw_user_meta_data }}
--    }
--
-- Veja WEBHOOK-SETUP.md para guia completo com screenshots.

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION handle_new_user(UUID, TEXT, JSONB) IS 'Cria automaticamente uma organização pessoal quando um usuário se cadastra (chamada via webhook)';
COMMENT ON FUNCTION handle_new_user_trigger() IS 'Wrapper da função handle_new_user para compatibilidade com triggers';

