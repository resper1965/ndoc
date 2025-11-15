-- Migration: Auto-create organization on signup
-- Created: 2025-01-15
-- Description: Cria automaticamente uma organização pessoal quando um usuário se cadastra

-- ============================================
-- FUNCTION: Auto-create organization on signup
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  user_email TEXT;
  org_slug TEXT;
  counter INT := 0;
  base_slug TEXT;
BEGIN
  -- Obter email do usuário
  user_email := NEW.email;

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

  -- Criar organização pessoal
  INSERT INTO organizations (name, slug, plan, settings)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(user_email, '@', 1)) || '''s Organization',
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
  VALUES (new_org_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Call function on user creation
-- ============================================

-- Remover trigger se já existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION handle_new_user() IS 'Cria automaticamente uma organização pessoal quando um usuário se cadastra via Supabase Auth';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Trigger que executa handle_new_user() após criação de usuário';
