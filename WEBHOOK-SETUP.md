# 🔗 Guia de Configuração de Webhook (Auto-criação de Organização)

**Última atualização:** 2025-01-15

Este guia mostra como configurar um **Database Webhook** no Supabase para criar automaticamente uma organização quando um usuário se cadastra.

---

## 📖 Índice

1. [Por que Webhook?](#por-que-webhook)
2. [Pré-requisitos](#pré-requisitos)
3. [Passo a Passo](#passo-a-passo)
4. [Verificar se Está Funcionando](#verificar-se-está-funcionando)
5. [Troubleshooting](#troubleshooting)
6. [Alternativa: Edge Function](#alternativa-edge-function)

---

## 🔍 Por que Webhook?

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

1. No menu lateral esquerdo, clique em **"Database"**
2. Na aba superior, clique em **"Webhooks"**
3. Você verá a lista de webhooks (vazia inicialmente)

---

### Passo 3: Criar Novo Webhook

1. Clique em **"Create a new hook"** ou **"Enable Webhooks"**
2. Preencha o formulário:

---

### Passo 4: Configurar Detalhes do Webhook

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

## ✅ Checklist Final

Antes de considerar concluído:

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

**Última atualização:** 2025-01-15
**Tempo de configuração:** ~10 minutos
**Dificuldade:** Média
