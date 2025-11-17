-- Migration: Limpeza de tabelas não utilizadas no projeto final
-- Data: 2025-01-18
-- Descrição: Remove tabelas relacionadas a SaaS (billing, plans) que não fazem parte do foco de documentação

-- Remover tabelas na ordem correta (respeitando foreign keys)

-- 1. Remover invoices (depende de subscriptions)
DROP TABLE IF EXISTS invoices CASCADE;

-- 2. Remover subscriptions (depende de plans e organizations)
DROP TABLE IF EXISTS subscriptions CASCADE;

-- 3. Remover plans
DROP TABLE IF EXISTS plans CASCADE;

-- 4. Remover usage_tracking (depende de organizations)
DROP TABLE IF EXISTS usage_tracking CASCADE;

-- 5. Remover audit_logs (depende de organizations e users)
DROP TABLE IF EXISTS audit_logs CASCADE;

-- 6. Remover user_profiles (tabela antiga não utilizada)
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Comentário
COMMENT ON SCHEMA public IS 'Schema limpo - apenas tabelas essenciais para documentação';

