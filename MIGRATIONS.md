# 📋 Guia de Migrations - n.doc

**Última atualização:** 2025-01-15

Este documento descreve todas as migrations do banco de dados e como executá-las.

---

## 📖 Índice

1. [Sobre Migrations](#sobre-migrations)
2. [Como Executar](#como-executar)
3. [Migrations Disponíveis](#migrations-disponíveis)
4. [Ordem de Execução](#ordem-de-execução)
5. [Troubleshooting](#troubleshooting)

---

## 🔍 Sobre Migrations

As migrations são arquivos SQL que definem a estrutura do banco de dados. Elas devem ser executadas **em ordem** para garantir que todas as tabelas, funções e triggers sejam criados corretamente.

**Localização:** `supabase/migrations/`

---

## 🚀 Como Executar

### Opção 1: Via Supabase CLI (Recomendado)

```bash
# 1. Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# 2. Login no Supabase
supabase login

# 3. Linkar projeto
supabase link --project-ref SEU_PROJECT_ID

# 4. Executar todas as migrations
supabase db push

# 5. Verificar status
supabase db diff
```

### Opção 2: Via Dashboard Supabase

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá para **Database** → **Migrations**
4. Clique em **New Migration**
5. Copie e cole cada arquivo `.sql` em ordem
6. Execute cada migration

### Opção 3: Via SQL Editor (Manual)

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá para **SQL Editor**
4. Copie e cole o conteúdo de cada migration
5. Execute **EM ORDEM**

---

## 📁 Migrations Disponíveis

### Migration 0: Schema Inicial
**Arquivo:** `20250113000000_initial_schema.sql`
**Status:** ✅ Base existente
**Descrição:** Schema inicial do projeto

**Cria:**
- ✅ Tabelas: `organizations`, `organization_members`, `documents`, `document_versions`, `ai_themes`, `ai_provider_config`
- ✅ Índices para performance
- ✅ RLS policies
- ✅ Triggers de `updated_at`

---

### Migration 1: Auto-criação de Organização
**Arquivo:** `20250115000000_auto_create_organization.sql`
**Criado:** 2025-01-15
**Dependências:** Migration 0

**Descrição:** Cria automaticamente uma organização pessoal quando um usuário se cadastra via Supabase Auth.

**Cria:**
- ✅ **Função:** `handle_new_user()`
  - Gera slug único a partir do email
  - Cria organização com nome baseado no usuário
  - Adiciona usuário como `owner` da organização

- ✅ **Trigger:** `on_auth_user_created`
  - Executa após `INSERT` em `auth.users`
  - Chama `handle_new_user()` automaticamente

**Impacto:**
- ✅ Elimina necessidade de criação manual de organização
- ✅ Melhora UX no signup
- ✅ Garante que todo usuário tenha uma organização

**Exemplo:**
```sql
-- Usuário: joao@example.com
-- Organização criada: "João's Organization" (slug: joao)
```

---

### Migration 2: Planos e Assinaturas
**Arquivo:** `20250115000001_plans_and_subscriptions.sql`
**Criado:** 2025-01-15
**Dependências:** Migration 0, 1

**Descrição:** Sistema completo de planos SaaS, assinaturas, tracking de uso e faturas.

**Cria:**

#### Tabelas

1. **`plans`** - Planos disponíveis
   ```sql
   - id (UUID)
   - name, slug, description
   - price_monthly, price_yearly
   - limits (JSONB): documentos, usuários, storage, IA
   - features (JSONB): flags de recursos
   - is_active, sort_order
   ```

2. **`subscriptions`** - Assinaturas das organizações
   ```sql
   - id (UUID)
   - organization_id (UNIQUE)
   - plan_id
   - status (active, trialing, past_due, canceled, unpaid)
   - current_period_start, current_period_end
   - trial_end
   - stripe_customer_id, stripe_subscription_id
   ```

3. **`usage_tracking`** - Rastreamento de uso
   ```sql
   - organization_id
   - documents_count, users_count, storage_used_mb, ai_requests_count
   - period_start, period_end
   ```

4. **`invoices`** - Faturas
   ```sql
   - organization_id, subscription_id
   - amount_due, amount_paid, currency
   - status (draft, open, paid, void)
   - stripe_invoice_id
   ```

#### Planos Seed

- ✅ **Free:** 10 docs, 1 usuário, 100MB, sem IA
- ✅ **Starter:** 100 docs, 5 usuários, 1GB, 100 IA req/mês - R$ 49/mês
- ✅ **Professional:** Ilimitado docs, 20 usuários, 10GB, 1000 IA req/mês - R$ 149/mês
- ✅ **Enterprise:** Tudo ilimitado - Preço customizado

#### Funções

- ✅ `create_default_subscription()` - Cria subscription Free com trial 14 dias
- ✅ `update_usage_tracking()` - Atualiza contadores de uso automaticamente

#### Triggers

- ✅ `on_organization_created` - Cria subscription ao criar organização
- ✅ `on_document_created/deleted` - Atualiza contador de documentos

**Impacto:**
- ✅ Base completa para monetização
- ✅ Tracking automático de uso
- ✅ Preparado para integração Stripe

---

### Migration 3: Auditoria (Audit Logs)
**Arquivo:** `20250115000002_audit_logs.sql`
**Criado:** 2025-01-15
**Dependências:** Migration 0, 1, 2

**Descrição:** Sistema completo de auditoria para rastrear todas as ações importantes.

**Cria:**

#### Tabela

**`audit_logs`**
```sql
- id (UUID)
- organization_id, user_id
- action (document_created, user_role_updated, etc.)
- resource_type, resource_id
- old_data, new_data, changes (JSONB)
- ip_address, user_agent
- metadata (JSONB)
- created_at
```

#### Funções

- ✅ `log_document_changes()` - Registra CREATE/UPDATE/DELETE de documentos
- ✅ `log_user_management_changes()` - Registra mudanças em membros
- ✅ `log_ai_config_changes()` - Registra mudanças em IA (sem expor API keys)
- ✅ `get_recent_activity()` - Busca atividades recentes

#### Triggers Automáticos

- ✅ `audit_document_changes` - Todas mudanças em `documents`
- ✅ `audit_user_management` - Todas mudanças em `organization_members`
- ✅ `audit_ai_themes` - Mudanças em `ai_themes`
- ✅ `audit_ai_providers` - Mudanças em `ai_provider_config`

**Impacto:**
- ✅ Compliance (LGPD, auditoria)
- ✅ Troubleshooting facilitado
- ✅ Detecção de ações suspeitas
- ✅ Histórico completo de mudanças

**Exemplo de uso:**
```sql
SELECT * FROM get_recent_activity('org-uuid', 50);
-- Retorna últimas 50 atividades da organização
```

---

### Migration 4: Sistema de Convites
**Arquivo:** `20250115000003_team_invites.sql`
**Criado:** 2025-01-15
**Dependências:** Migration 0, 1, 2, 3

**Descrição:** Sistema de convites por email para adicionar membros à organização.

**Cria:**

#### Tabela

**`organization_invites`**
```sql
- id (UUID)
- organization_id
- email, role
- token (único, 32 bytes hex)
- invited_by (user_id)
- status (pending, accepted, expired, canceled)
- expires_at (default: +7 dias)
- accepted_at, canceled_at
```

#### Funções

- ✅ `accept_invite(token, user_id)` - Aceitar convite
  - Valida token e email
  - Adiciona usuário à organização
  - Marca convite como aceito
  - Registra em audit log

- ✅ `cancel_invite(invite_id, user_id)` - Cancelar convite (admins)
  - Valida permissões
  - Marca como cancelado
  - Registra em audit log

- ✅ `expire_old_invites()` - Marca convites expirados
  - Marca `pending` com `expires_at < NOW()` como `expired`
  - Retorna quantidade de convites expirados

- ✅ `get_invite_by_token(token)` - Buscar convite (público)
  - Retorna informações do convite sem autenticação
  - Para página de aceitação de convite

**Impacto:**
- ✅ Colaboração em equipe facilitada
- ✅ Fluxo de convite seguro com tokens
- ✅ Expiração automática
- ✅ Auditoria de convites

**Exemplo de uso:**
```sql
-- Admin convida novo membro
INSERT INTO organization_invites (organization_id, email, role, invited_by)
VALUES ('org-uuid', 'novo@example.com', 'editor', 'admin-uuid');

-- Usuário aceita convite
SELECT accept_invite('token-gerado', 'user-uuid');
```

---

### Migration 5: Helpers de Uso
**Arquivo:** `20250115000004_usage_helpers.sql`
**Criado:** 2025-01-15
**Dependências:** Migration 2

**Descrição:** Funções helper para facilitar tracking de uso e limites.

**Cria:**

#### Funções

1. **`increment_ai_usage(org_id, period_start, period_end)`**
   - Incrementa contador de requisições de IA
   - Upsert automático (cria ou atualiza)
   - Usado pelas APIs de IA

2. **`update_users_count()`**
   - Trigger que atualiza contador de usuários
   - Executado em INSERT/DELETE de `organization_members`

3. **`get_organization_limits_and_usage(org_id)`**
   - Retorna limites do plano E uso atual em uma query
   - Útil para dashboards e verificações

#### Triggers

- ✅ `update_users_count_on_member_change` - Atualiza contador ao adicionar/remover usuários

**Impacto:**
- ✅ Simplifica verificação de limites
- ✅ Tracking automático e preciso
- ✅ Reduz queries complexas

**Exemplo de uso:**
```sql
-- Incrementar uso de IA
SELECT increment_ai_usage('org-uuid', '2025-01-01', '2025-02-01');

-- Buscar limites e uso
SELECT * FROM get_organization_limits_and_usage('org-uuid');
```

---

## 📋 Ordem de Execução

**IMPORTANTE:** Execute as migrations nesta ordem exata:

```
1. ✅ 20250113000000_initial_schema.sql (já existente)
2. ✅ 20250115000000_auto_create_organization.sql
3. ✅ 20250115000001_plans_and_subscriptions.sql
4. ✅ 20250115000002_audit_logs.sql
5. ✅ 20250115000003_team_invites.sql
6. ✅ 20250115000004_usage_helpers.sql
```

### Script de Execução Completa

```bash
#!/bin/bash
# executar-migrations.sh

echo "🚀 Executando migrations do n.doc..."

supabase db push

echo "✅ Migrations executadas com sucesso!"
echo "🔍 Verificando status..."

supabase db diff
```

---

## 🔧 Troubleshooting

### Erro: "relation already exists"

**Causa:** Migration já foi executada antes

**Solução:** Pule essa migration ou use `DROP TABLE IF EXISTS` antes

### Erro: "function already exists"

**Causa:** Função já criada

**Solução:** Use `CREATE OR REPLACE FUNCTION` (já configurado nas migrations)

### Erro: "permission denied"

**Causa:** Usuário sem permissões

**Solução:** Execute com usuário `postgres` ou admin

### Erro: "syntax error"

**Causa:** Versão PostgreSQL incompatível ou erro de cópia

**Solução:**
- Verifique se copiou o arquivo completo
- PostgreSQL 14+ requerido

### Rollback de Migration

Para reverter uma migration:

```sql
-- Exemplo: reverter migration de convites
DROP TRIGGER IF EXISTS ... ;
DROP FUNCTION IF EXISTS accept_invite CASCADE;
DROP TABLE IF EXISTS organization_invites CASCADE;
```

---

## 📊 Verificação Pós-Migration

Após executar todas as migrations, verifique:

```sql
-- 1. Verificar tabelas criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Verificar planos criados
SELECT name, slug, price_monthly FROM plans ORDER BY sort_order;

-- 3. Verificar triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- 4. Verificar RLS habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Resultado esperado:**
- ✅ 11 tabelas: organizations, organization_members, documents, document_versions, ai_themes, ai_provider_config, plans, subscriptions, usage_tracking, invoices, audit_logs, organization_invites
- ✅ 4 planos: free, starter, professional, enterprise
- ✅ 10+ triggers
- ✅ RLS habilitado em todas as tabelas

---

## 🔗 Links Úteis

- [Supabase Migrations](https://supabase.com/docs/guides/cli/managing-environments#creating-a-migration)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Última atualização:** 2025-01-15
**Versão do Schema:** 1.1.0
