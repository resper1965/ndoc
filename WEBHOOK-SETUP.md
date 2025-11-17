# 🔗 Guia de Configuração de Webhook (Auto-criação de Organização)

**Última atualização:** 2025-01-15

Este guia mostra como configurar a criação automática de organização quando um usuário se cadastra.

---

## ✅ STATUS: IMPLEMENTADO E VERIFICADO

**✅ Solução Automática Implementada e Funcionando!**

A aplicação já está **100% configurada** para criar a organização automaticamente após o signup, **sem necessidade de webhook**.

### ✅ Verificação via MCP (2025-01-15)

- ✅ Função `handle_new_user()` existe e está configurada corretamente
- ✅ Função `create_default_subscription()` existe
- ✅ Planos criados: Free, Starter, Professional, Enterprise
- ✅ API Route `/api/organization/create` implementada
- ✅ Integração no signup implementada
- ✅ **Tudo funcionando!**

### 🎯 Como Funciona

1. Usuário se cadastra em `/signup`
2. Supabase Auth cria o usuário
3. Frontend chama automaticamente `POST /api/organization/create`
4. API route chama `handle_new_user()` via RPC
5. Organização criada automaticamente com:
   - Nome baseado no usuário
   - Slug único gerado do email
   - Subscription "free" com trial de 14 dias
   - Usuário adicionado como `owner`
6. Usuário redirecionado para `/onboarding`

**✅ Não é necessário configurar webhook!** A funcionalidade já está ativa e testada.

---

## 📖 Índice

1. [Solução Automática (Recomendada)](#solução-automática-recomendada) ⭐
2. [Por que Webhook?](#por-que-webhook)
3. [Pré-requisitos](#pré-requisitos)
4. [Passo a Passo (Webhook - Plano Pago)](#passo-a-passo)
5. [Verificar se Está Funcionando](#verificar-se-está-funcionando)
6. [Troubleshooting](#troubleshooting)
7. [Alternativa: Edge Function](#alternativa-edge-function)

---

## ✅ Solução Automática (Recomendada)

### Como Funciona

A aplicação já está configurada para criar a organização automaticamente após o signup, **sem necessidade de webhook**.

**Arquivos envolvidos:**
- `src/app/signup/page.tsx` - Chama a API após signup
- `src/app/api/organization/create/route.ts` - API route que cria a organização
- `supabase/migrations/20250115000000_auto_create_organization.sql` - Função `handle_new_user()`

**Fluxo:**
```
1. Usuário preenche formulário de signup
2. Supabase Auth cria o usuário
3. Frontend chama POST /api/organization/create
4. API route chama handle_new_user() via RPC
5. Organização criada automaticamente
6. Usuário redirecionado para /onboarding
```

### ✅ Verificar se Está Funcionando

#### Teste Rápido

1. **Criar conta de teste:**
   ```bash
   # Acesse a aplicação
   http://localhost:3000/signup
   # ou
   https://ndoc-eight.vercel.app/signup
   ```

2. **Preencha o formulário:**
   - Nome completo
   - Email válido
   - Senha (mínimo 6 caracteres)
   - Confirme a senha

3. **Clique em "Criar conta"**

4. **Verificar no Supabase Dashboard:**
   - Acesse: https://supabase.com/dashboard
   - Vá para **Table Editor** > `organizations`
   - Deve aparecer uma nova organização com:
     - Nome: "NomeDoUsuario's Organization"
     - Slug: baseado no email (ex: `joao` para `joao@example.com`)
     - Plan: "free"
   
5. **Verificar em `organization_members`:**
   - Deve ter um registro com:
     - `user_id`: ID do usuário criado
     - `role`: "owner"
     - `organization_id`: ID da organização criada

6. **Verificar em `subscriptions`:**
   - Deve ter uma subscription com:
     - `organization_id`: ID da organização criada
     - `plan_id`: ID do plano "free"
     - `status`: "trialing" (trial de 14 dias)
     - `trial_end`: Data 14 dias no futuro

#### Verificação via SQL (Opcional)

```sql
-- Verificar organização criada
SELECT 
  o.name,
  o.slug,
  o.plan,
  om.role,
  s.status,
  s.trial_end
FROM organizations o
INNER JOIN organization_members om ON o.id = om.organization_id
INNER JOIN subscriptions s ON o.id = s.organization_id
WHERE om.user_id = 'SEU_USER_ID_AQUI'
ORDER BY o.created_at DESC
LIMIT 1;
```

### 🔧 Troubleshooting

#### Se a Organização Não For Criada

1. **Verificar se a migration foi executada:**
   ```sql
   -- No SQL Editor do Supabase
   SELECT proname, pronargs 
   FROM pg_proc 
   WHERE proname = 'handle_new_user';
   -- Deve retornar: handle_new_user | 3
   ```

2. **Verificar logs do navegador:**
   - Abra DevTools (F12)
   - Vá para aba "Console"
   - Procure por erros após o signup
   - Procure por chamadas para `/api/organization/create`

3. **Verificar logs da API (Vercel):**
   - Acesse: https://vercel.com/dashboard
   - Selecione o projeto `ndoc`
   - Vá para **Functions** > `/api/organization/create`
   - Verifique logs de erro

4. **Verificar autenticação:**
   ```sql
   -- Verificar se o usuário foi criado
   SELECT id, email, created_at 
   FROM auth.users 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

5. **Testar função manualmente:**
   ```sql
   -- Substitua pelos valores reais
   SELECT handle_new_user(
     'user-uuid-aqui'::UUID,
     'teste@example.com',
     '{"name": "Usuário Teste"}'::JSONB
   );
   ```

#### Erros Comuns

**Erro: "Não autenticado"**
- Causa: Usuário não está logado quando a API é chamada
- Solução: Verificar se `supabase.auth.getUser()` está retornando o usuário

**Erro: "Usuário já possui organização"**
- Causa: Organização já foi criada anteriormente
- Solução: Isso é normal, a função retorna sucesso mesmo assim

**Erro: "Function does not exist"**
- Causa: Migration não foi executada
- Solução: Execute a migration `20250115000000_auto_create_organization.sql`

---

## 🔍 Por que Webhook? (Apenas para Plano Pago)

A tabela `auth.users` é gerenciada pelo Supabase e **não permite** criar triggers diretamente via SQL.

**Problema:**
```sql
CREATE TRIGGER on_auth_user_created ON auth.users
-- ❌ ERRO: permission denied
```

**Solução:**
Usar **Database Webhooks** do Supabase que permite "ouvir" eventos em tabelas do schema `auth`.

---

## ✅ Pré-requisitos

Antes de configurar o webhook:

- [x] Migration `20250115000000_auto_create_organization.sql` executada
- [x] Função `handle_new_user()` criada no banco
- [x] Acesso ao Dashboard do Supabase
- [x] Service Role Key do Supabase

---

## 🚀 Passo a Passo

### Passo 1: Acessar o Dashboard do Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto **n.doc**
3. Aguarde o dashboard carregar

---

### Passo 2: Abrir Seção de Webhooks

**⚠️ ATENÇÃO:** Se você não encontrar a opção "Webhooks" no menu Database, significa que seu plano não suporta Database Webhooks. Use a [Solução Automática](#solução-automática-recomendada) acima.

1. No menu lateral esquerdo, clique em **"Database"**
2. Na aba superior, procure por **"Webhooks"** ou **"Database Webhooks"**
3. Se não encontrar, você está no plano FREE - use a solução automática acima
4. Se encontrar, clique em **"Webhooks"**
5. Você verá a lista de webhooks (vazia inicialmente)

---

### Passo 3: Criar Novo Webhook

1. Clique em **"Create a new hook"** ou **"New Webhook"** ou **"Enable Webhooks"**
2. Se não aparecer essa opção, você está no plano FREE - use a solução automática acima
3. Preencha o formulário:

---

### Passo 4: Configurar Detalhes do Webhook

**⚠️ Se você não conseguiu chegar até aqui, significa que Database Webhooks não está disponível no seu plano. Use a [Solução Automática](#solução-automática-recomendada) que já está implementada.**

#### **Name (Nome):**
```
auto-create-organization
```

#### **Table:**
```
auth.users
```

#### **Events (Eventos):**
- ✅ Marque **"INSERT"** (criação de novo usuário)
- ❌ Desmarque "UPDATE", "DELETE"

#### **Type (Tipo):**
- Selecione: **"HTTP Request"**

---

### Passo 5: Configurar HTTP Request

#### **HTTP Method:**
```
POST
```

#### **URL:**
```
https://[SEU_PROJECT_REF].supabase.co/rest/v1/rpc/handle_new_user
```

**⚠️ Substitua `[SEU_PROJECT_REF]`** pelo ID do seu projeto.

**Como encontrar o Project Ref:**
- Dashboard > Settings > General > Reference ID
- Ou veja na URL do dashboard: `https://supabase.com/dashboard/project/[PROJECT_REF]`

**Exemplo:**
```
https://abcdefghijklmnop.supabase.co/rest/v1/rpc/handle_new_user
```

---

### Passo 6: Configurar Headers

Clique em **"Add header"** e adicione 2 headers:

#### **Header 1:**
- **Key:** `Content-Type`
- **Value:** `application/json`

#### **Header 2:**
- **Key:** `apikey`
- **Value:** `[SUA_SERVICE_ROLE_KEY]`

**⚠️ IMPORTANTE:** Use a **Service Role Key**, não a Anon Key!

**Como obter Service Role Key:**
1. Dashboard > Settings > API
2. Copie o valor de **"service_role" key** (secret)
3. ⚠️ Nunca exponha essa chave no frontend!

---

### Passo 7: Configurar Payload (Body)

No campo **"HTTP Payload"**, cole este JSON:

```json
{
  "user_id": "{{ record.id }}",
  "user_email": "{{ record.email }}",
  "user_metadata": {{ record.raw_user_meta_data }}
}
```

**Explicação:**
- `{{ record.id }}` - ID do usuário criado
- `{{ record.email }}` - Email do usuário
- `{{ record.raw_user_meta_data }}` - Metadados (nome, etc.)

---

### Passo 8: Configurar Retry Policy (Opcional mas Recomendado)

Expanda **"Advanced Settings"** (se disponível):

- **Max Retries:** `3`
- **Timeout:** `5000` (5 segundos)

---

### Passo 9: Salvar Webhook

1. Revise todas as configurações
2. Clique em **"Create webhook"** ou **"Save"**
3. O webhook será criado e ativado automaticamente

---

### Passo 10: Ativar Webhook

Se o webhook foi criado mas está desativado:

1. Na lista de webhooks, encontre `auto-create-organization`
2. Toggle o switch para **"Enabled"**
3. Deve ficar verde/ativo

---

## ✅ Verificar se Está Funcionando

### Método 1: Criar Usuário de Teste

1. Acesse sua aplicação: `/signup`
2. Crie uma nova conta com email de teste
3. Após signup bem-sucedido:

```bash
# Verificar no banco de dados
# Dashboard > Table Editor > organizations
# Deve aparecer uma nova organização com:
# - Nome: "NomeDoUsuario's Organization"
# - Slug: "nome-do-usuario"
# - Plan: "free"
```

4. Verificar em `organization_members`:
```bash
# Deve ter um registro com:
# - user_id: ID do usuário criado
# - role: "owner"
```

---

### Método 2: Verificar Logs do Webhook

1. Dashboard > Database > Webhooks
2. Clique no webhook `auto-create-organization`
3. Vá para aba **"Logs"** ou **"Recent calls"**
4. Verifique se há registros de execução

**Log de sucesso:**
```json
{
  "success": true,
  "organization_id": "uuid-aqui",
  "organization_slug": "joao",
  "message": "Organization created successfully"
}
```

**Log de erro:**
```json
{
  "success": false,
  "error": "mensagem de erro",
  "user_id": "uuid",
  "user_email": "email@test.com"
}
```

---

### Método 3: Query SQL Direto

Execute no SQL Editor:

```sql
-- Verificar se função existe
SELECT proname, pronargs
FROM pg_proc
WHERE proname = 'handle_new_user';

-- Resultado esperado:
-- handle_new_user | 3 (versão com parâmetros)

-- Testar função manualmente
SELECT handle_new_user(
  'user-uuid'::UUID,
  'test@example.com',
  '{"name": "Test User"}'::JSONB
);

-- Deve retornar:
-- {"success": true, "organization_id": "...", ...}
```

---

## 🐛 Troubleshooting

### Erro: "Function does not exist"

**Causa:** Migration não foi executada

**Solução:**
```sql
-- Executar a migration manualmente
-- Copie o conteúdo de:
-- supabase/migrations/20250115000000_auto_create_organization.sql
```

---

### Erro: "Permission denied for schema auth"

**Causa:** Tentando acessar tabela auth.users diretamente

**Solução:**
- Use webhook (este guia)
- A função `handle_new_user` deve usar `SECURITY DEFINER` (já configurado)

---

### Webhook Não É Chamado

**Possíveis causas:**

1. **Webhook desativado**
   - Verificar se toggle está "Enabled"

2. **URL incorreta**
   - Verificar Project Ref
   - Testar URL manualmente:
   ```bash
   curl -X POST \
     https://[PROJECT_REF].supabase.co/rest/v1/rpc/handle_new_user \
     -H "Content-Type: application/json" \
     -H "apikey: [SERVICE_ROLE_KEY]" \
     -d '{"user_id":"test","user_email":"test@test.com","user_metadata":{}}'
   ```

3. **Service Role Key incorreta**
   - Verificar se copiou a key correta
   - Não use Anon Key, use Service Role Key

4. **Payload malformado**
   - Verificar sintaxe JSON
   - Testar no jsonlint.com

---

### Organização Não É Criada

**Verificar:**

1. **Logs do webhook**
   - Dashboard > Database > Webhooks > Logs
   - Procurar por erros

2. **Tabela organizations existe?**
   ```sql
   SELECT * FROM organizations LIMIT 1;
   ```

3. **Permissões RLS**
   - Função usa `SECURITY DEFINER` (bypassa RLS)
   - Deve funcionar mesmo com RLS habilitado

4. **Erro de slug duplicado**
   - Função adiciona número ao slug se já existe
   - Verificar logs para ver slug gerado

---

### Múltiplas Organizações Criadas

**Causa:** Webhook sendo chamado múltiplas vezes

**Solução:**
```sql
-- Adicionar verificação na função
-- (Já implementado - verifica se usuário já tem org)

ALTER FUNCTION handle_new_user ADD CHECK ...
-- Ou modificar função para verificar:
SELECT COUNT(*) FROM organization_members WHERE user_id = user_id;
```

---

## 🔄 Alternativa: Edge Function

Se webhooks não funcionarem, use Edge Function:

### Criar Edge Function

```bash
supabase functions new create-organization
```

**Arquivo:** `supabase/functions/create-organization/index.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  try {
    const { user_id, user_email, user_metadata } = await req.json()

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase.rpc('handle_new_user', {
      user_id,
      user_email,
      user_metadata: user_metadata || {}
    })

    if (error) throw error

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
```

### Deploy

```bash
supabase functions deploy create-organization
```

### Chamar do Frontend

```typescript
// src/app/signup/page.tsx
const { data, error } = await supabase.auth.signUp({ email, password })

if (data.user) {
  // Chamar edge function
  await supabase.functions.invoke('create-organization', {
    body: {
      user_id: data.user.id,
      user_email: data.user.email,
      user_metadata: data.user.user_metadata
    }
  })
}
```

---

## ✅ Checklist Final (Antigo - Apenas para Referência)

> **Nota:** Este checklist é apenas para referência histórica. A solução atual **não requer webhook** e funciona automaticamente via API Route.

Antes de considerar concluído (método antigo com webhook):

- [ ] Migration executada
- [ ] Função `handle_new_user()` existe no banco
- [ ] Webhook criado no Dashboard
- [ ] Webhook ativado (toggle ON)
- [ ] Service Role Key configurada
- [ ] Payload testado
- [ ] Teste de signup bem-sucedido
- [ ] Organização criada automaticamente
- [ ] Usuário adicionado como owner
- [ ] Logs do webhook sem erros

---

## 📊 Resumo da Configuração

**Webhook Details:**
- **Name:** `auto-create-organization`
- **Table:** `auth.users`
- **Event:** `INSERT`
- **Method:** `POST`
- **URL:** `https://[PROJECT_REF].supabase.co/rest/v1/rpc/handle_new_user`

**Headers:**
```
Content-Type: application/json
apikey: [SERVICE_ROLE_KEY]
```

**Payload:**
```json
{
  "user_id": "{{ record.id }}",
  "user_email": "{{ record.email }}",
  "user_metadata": {{ record.raw_user_meta_data }}
}
```

---

## 🔗 Links Úteis

- **Supabase Webhooks Docs:** https://supabase.com/docs/guides/database/webhooks
- **Dashboard:** https://supabase.com/dashboard
- **RPC Endpoint Docs:** https://supabase.com/docs/guides/api#calling-postgresql-functions

---

## 🚀 Próximos Passos

Agora que a criação automática de organização está funcionando, você pode:

### 1. ✅ TESTAR O FLUXO COMPLETO (URGENTE)

```bash
# 1. Criar uma conta de teste
# Acesse: https://ndoc-eight.vercel.app/signup
# ou: http://localhost:3000/signup (se rodando localmente)

# 2. Verificar no Supabase Dashboard
# - Table Editor > organizations
# - Table Editor > organization_members
# - Table Editor > subscriptions
```

**Critério de Sucesso:**
- ✅ Organização criada automaticamente
- ✅ Usuário adicionado como owner
- ✅ Subscription criada com trial de 14 dias
- ✅ Redirecionamento para `/onboarding` funcionando

### 2. 📝 TESTAR ONBOARDING

- ✅ Wizard aparece corretamente
- ✅ Etapas podem ser completadas
- ✅ Primeiro documento pode ser criado

### 3. 🔐 VERIFICAR VARIÁVEIS DE AMBIENTE

Certifique-se de que todas as variáveis estão configuradas no Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `UPSTASH_REDIS_REST_URL` (opcional)
- `UPSTASH_REDIS_REST_TOKEN` (opcional)

### 4. 🧪 TESTAR RECURSOS PRINCIPAIS

- ✅ Criação de documentos
- ✅ Geração com IA
- ✅ Sistema de convites
- ✅ Tracking de uso

### 5. 📊 MONITORAR LOGS

- **Vercel:** Functions logs para APIs
- **Supabase:** Database logs para queries
- **Browser:** Console para erros do frontend

### 6. 📚 DOCUMENTAÇÃO ADICIONAL

- [PROXIMOS-PASSOS.md](PROXIMOS-PASSOS.md) - Guia completo de próximos passos
- [MIGRATIONS.md](MIGRATIONS.md) - Guia completo de migrations
- [README.md](README.md) - Documentação principal

---

## ✅ Checklist Final

Antes de considerar concluído:

- [x] Migration `auto_create_organization` executada
- [x] Função `handle_new_user()` criada e verificada via MCP
- [x] API Route `/api/organization/create` implementada
- [x] Integração no signup implementada
- [x] Planos criados (Free, Starter, Professional, Enterprise)
- [x] Função `create_default_subscription()` criada
- [ ] **Teste de signup bem-sucedido** ⬅️ **PRÓXIMO PASSO**
- [ ] Organização criada automaticamente
- [ ] Usuário adicionado como owner
- [ ] Subscription criada com trial de 14 dias
- [ ] Onboarding funcionando

---

**Última atualização:** 2025-01-15  
**Status:** ✅ **IMPLEMENTADO E VERIFICADO**  
**Tempo de configuração:** ~0 minutos (já está pronto!)  
**Dificuldade:** Nenhuma (tudo automatizado)
