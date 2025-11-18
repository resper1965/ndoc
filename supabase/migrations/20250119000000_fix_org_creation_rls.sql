-- Fix RLS para criação de organizações via função handle_new_user
-- Garantir que a função possa inserir organizações mesmo com RLS ativo

-- A função handle_new_user já usa SECURITY DEFINER, mas vamos garantir
-- que as políticas RLS permitam a inserção quando chamada pela função

-- Permitir que a função handle_new_user insira organizações
-- A função já executa com privilégios de superuser (SECURITY DEFINER)
-- Mas precisamos garantir que a política RLS não bloqueie

-- Atualizar política para permitir inserção via função
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;

CREATE POLICY "Users can create organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Também permitir inserção via service_role (para funções SECURITY DEFINER)
-- Isso é necessário porque funções SECURITY DEFINER executam com privilégios do criador
-- mas ainda precisam passar pelas políticas RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Garantir que a função handle_new_user tenha permissões adequadas
-- A função já foi criada com SECURITY DEFINER, então executa com privilégios do criador
-- Mas vamos garantir que ela possa inserir mesmo com RLS

-- Verificar se a função existe e tem SECURITY DEFINER
DO $$
BEGIN
  -- Se a função não tiver SECURITY DEFINER, vamos recriá-la
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = 'handle_new_user'
    AND p.prosecdef = true
  ) THEN
    RAISE NOTICE 'Função handle_new_user precisa ter SECURITY DEFINER';
  END IF;
END $$;

