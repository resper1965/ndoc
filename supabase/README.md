# Supabase Setup - n.doc

## 📋 Visão Geral

Este diretório contém as migrations e configurações do Supabase para a aplicação **n.doc**.

## 🚀 Setup Inicial

### 1. Criar Projeto Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Preencha:
   - **Name**: n.doc (ou seu nome preferido)
   - **Database Password**: Escolha uma senha forte
   - **Region**: Escolha a região mais próxima
5. Aguarde o provisionamento (2-3 minutos)

### 2. Obter Credenciais

1. No dashboard do Supabase, vá em **Settings** > **API**
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (mantenha segura!)

### 3. Configurar Variáveis de Ambiente

1. Copie `.env.local.example` para `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edite `.env.local` e preencha com suas credenciais:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
   SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
   ```

### 4. Aplicar Migrations

#### Opção A: Via Dashboard (Recomendado para início)

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Copie o conteúdo de `supabase/migrations/20250113000000_initial_schema.sql`
4. Cole no editor e clique em **Run**
5. Aguarde a execução (pode levar alguns segundos)

#### Opção B: Via Supabase CLI (Avançado)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref seu-project-ref

# Aplicar migrations
supabase db push
```

### 5. Verificar Setup

1. No dashboard, vá em **Table Editor**
2. Verifique se as tabelas foram criadas:
   - `organizations`
   - `organization_members`
   - `documents`
   - `document_versions`
   - `ai_themes`
   - `ai_provider_config`

3. Vá em **Authentication** > **Policies**
4. Verifique se as RLS policies foram criadas

## 📊 Schema do Database

### Tabelas Principais

- **organizations**: Organizações (tenants) para multi-tenancy
- **organization_members**: Membros e permissões por organização
- **documents**: Documentos MDX
- **document_versions**: Histórico de versões
- **ai_themes**: Temas para geração de documentos com IA
- **ai_provider_config**: Configuração de provedores de IA

### Row Level Security (RLS)

Todas as tabelas têm RLS habilitado com policies que garantem:
- ✅ Isolamento por organização (multi-tenancy)
- ✅ Leitura pública de documentos publicados
- ✅ Escrita apenas para editores/admins
- ✅ Deleção apenas para admins

## 🔐 Segurança

- **Nunca commite** `.env.local` no Git
- **Nunca exponha** `SUPABASE_SERVICE_ROLE_KEY` no frontend
- Use apenas `NEXT_PUBLIC_SUPABASE_ANON_KEY` no cliente
- RLS garante isolamento mesmo com anon key

## 📝 Próximos Passos

Após o setup:

1. ✅ Verificar se as migrations foram aplicadas
2. ✅ Testar conexão com Supabase
3. ✅ Criar primeira organização (via API ou dashboard)
4. ✅ Seguir para Phase 1: Autenticação

## 🆘 Troubleshooting

### Erro: "relation does not exist"
- Verifique se as migrations foram aplicadas
- Confira se está usando o projeto correto

### Erro: "permission denied"
- Verifique as RLS policies
- Confira se o usuário está autenticado (se necessário)

### Erro: "invalid API key"
- Verifique se as variáveis de ambiente estão corretas
- Confira se copiou as keys corretas do dashboard

---

**Desenvolvido pela ness.** 🚀

