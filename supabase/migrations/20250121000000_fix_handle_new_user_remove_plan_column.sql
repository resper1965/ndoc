-- Fix: Remover referência à coluna plan na função handle_new_user
-- A coluna plan pode não existir ou não ser mais necessária

-- Primeiro, verificar se a coluna plan existe e removê-la se necessário
DO $$
BEGIN
  -- Remover coluna plan se existir
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'organizations' 
    AND column_name = 'plan'
  ) THEN
    ALTER TABLE organizations DROP COLUMN plan;
    RAISE NOTICE 'Coluna plan removida da tabela organizations';
  ELSE
    RAISE NOTICE 'Coluna plan não existe na tabela organizations';
  END IF;
END $$;

-- Atualizar função handle_new_user para não usar coluna plan
CREATE OR REPLACE FUNCTION handle_new_user(user_id UUID, user_email TEXT, user_metadata JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  -- Criar organização pessoal (sem coluna plan)
  INSERT INTO organizations (name, slug, settings)
  VALUES (
    user_name || '''s Organization',
    org_slug,
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
$$;

COMMENT ON FUNCTION handle_new_user(UUID, TEXT, JSONB) IS 'Cria automaticamente uma organização pessoal quando um usuário se cadastra (sem coluna plan)';

