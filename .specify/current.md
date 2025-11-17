# Estado Atual do Projeto ndocs

**Última atualização**: 2025-01-17

## Resumo Executivo

O projeto **ndocs** está em um estado funcional básico, com autenticação, multi-tenancy, gerenciamento de documentos MDX e integração com IA implementados. No entanto, ainda faltam funcionalidades críticas para atender à visão completa do SaaS, especialmente ingestão de documentos, vetorização/RAG e processo de onboarding completo.

## Funcionalidades Implementadas

### 1. Autenticação e Autorização ✅

- **Status**: Completo
- **Implementação**: Supabase Auth
- **Features**:
  - Login/Logout
  - Signup com criação automática de organização
  - Recuperação de senha (`/forgot-password`)
  - Roles: superadmin, orgadmin, admin, editor, viewer
  - RLS (Row Level Security) policies

### 2. Multi-tenancy ✅

- **Status**: Básico (funcional, mas incompleto)
- **Implementação**: Tabelas `organizations` e `organization_members`
- **Features**:
  - Isolamento de dados por organização
  - Membros de organização com roles
  - RLS policies para isolamento

**Limitações**:
- Organização criada automaticamente no signup (não pelo superadmin)
- Falta fluxo de convites por email

### 3. Gerenciamento de Documentos MDX ✅

- **Status**: Completo
- **Implementação**: Tabela `documents` no Supabase
- **Features**:
  - Criação manual de documentos MDX
  - Editor MDX com preview (`MDXEditorWithPreview`)
  - Armazenamento no Supabase
  - Renderização com `next-mdx-remote`
  - Busca básica de documentos

**Limitações**:
- Apenas criação manual (sem upload de PDF/DOCX)
- Sem conversão automática de formatos
- Sem templates aplicados automaticamente

### 4. Configuração de IA ✅

- **Status**: Completo
- **Implementação**: Tabelas `ai_provider_config` e `ai_themes`
- **Features**:
  - Configuração de provedores (OpenAI, Anthropic)
  - Temas de IA personalizáveis
  - Geração de documentos com IA
  - Melhoria de documentos com IA

### 5. Interface de Configuração ✅

- **Status**: Completo
- **Implementação**: `/config` com tabs
- **Features**:
  - Tab Credenciais (alteração de senha)
  - Tab Documentos (gerenciamento de documentos)
  - Tab Inteligência Artificial (configuração de IA)
  - Tab Usuários (gerenciamento de membros)
  - Tab Administração (superadmin)
  - Tab API (ingestão de documentos)

### 6. Página de Administração ✅

- **Status**: Completo
- **Implementação**: `/admin`
- **Features**:
  - Listagem de organizações (superadmin)
  - Criação de organizações
  - Navegação global

## Funcionalidades Pendentes

### 1. Processo de Onboarding Completo ❌

**Status**: Parcial (básico existe, mas não segue o fluxo esperado)

**O que falta**:
- Superadmin cria organização e informa email do administrador
- Administrador recebe convite por email
- Wizard de onboarding para administrador:
  - Configurar IA
  - Convidar primeiros membros
  - Fazer primeira ingestão de documentos

### 2. Ingestão de Documentos (PDF, DOCX) ❌

**Status**: Não implementado

**O que falta**:
- Upload de arquivos (PDF, DOCX, TXT, MD)
- Conversão automática para Markdown
- Aplicação de templates baseados no Pinexio
- Processamento em background (queue/jobs)
- Armazenamento no Supabase Storage

### 3. Vetorização e RAG ❌

**Status**: Não implementado

**O que falta**:
- Configuração de pgvector no Supabase
- Pipeline de vetorização (chunking, embeddings)
- Banco de dados vetorial
- Sistema de busca semântica
- Integração RAG com IA

### 4. Templates Pinexio ❌

**Status**: Básico (templates existem, mas não aplicados automaticamente)

**O que falta**:
- Análise do projeto Pinexio original
- Templates específicos por tipo de documento
- Aplicação automática durante conversão
- Customização por organização

## Estrutura de Dados Atual

### Tabelas Principais

1. **organizations**
   - `id`, `name`, `slug`, `created_at`, `updated_at`

2. **organization_members**
   - `id`, `organization_id`, `user_id`, `role`, `created_at`

3. **documents**
   - `id`, `path`, `title`, `description`, `content`, `frontmatter`, `status`, `organization_id`, `order_index`, `created_at`, `updated_at`

4. **ai_provider_config**
   - `id`, `organization_id`, `provider`, `api_key`, `model`, `config`, `created_at`, `updated_at`

5. **ai_themes**
   - `id`, `organization_id`, `name`, `description`, `prompt_template`, `created_at`, `updated_at`

6. **superadmins**
   - `id`, `user_id`, `created_at`

## APIs Implementadas

### Documentos
- `GET /api/ingest?list=true` - Listar documentos
- `GET /api/ingest?path=...` - Obter documento específico
- `POST /api/ingest` - Criar documento
- `PUT /api/ingest` - Atualizar documento
- `DELETE /api/ingest` - Deletar documento

### IA
- `GET /api/ai/providers` - Listar provedores
- `POST /api/ai/providers` - Criar provedor
- `GET /api/ai/themes` - Listar temas
- `POST /api/ai/themes` - Criar tema
- `POST /api/ai/generate` - Gerar documento
- `POST /api/ai/improve` - Melhorar documento

### Organização
- `POST /api/organization/create` - Criar organização (via RPC)

### Configuração
- `GET /api/config/credentials` - Obter credenciais
- `PUT /api/config/credentials` - Atualizar credenciais

## Deploy e Infraestrutura

- **Plataforma**: Vercel
- **URL Produção**: https://ndocs-rho.vercel.app/
- **Banco de Dados**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (não utilizado ainda)
- **Rate Limiting**: Upstash Redis

## Variáveis de Ambiente

### Produção (Vercel)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `OPENAI_API_KEY`

## Documentação

### Documentação Técnica
- `README.md` - Visão geral do projeto
- `ANALISE-GAP-FUNCIONAL.md` - Análise de gap funcional
- `GUIA-USUARIO-COMPLETO.md` - Guia do usuário
- `GUIA-TELA-CONFIGURACAO.md` - Guia da tela de configuração

### Documentação de Deploy
- `VERCEL-SETUP.md` - Configuração do Vercel
- `MIGRATIONS.md` - Migrações do Supabase
- `WEBHOOK-SETUP.md` - Configuração de webhooks

## Próximos Passos Prioritários

1. **Onboarding Completo** (Prioridade Alta)
   - Refatorar fluxo de criação de organização
   - Sistema de convites por email
   - Wizard de onboarding para administrador

2. **Ingestão de Documentos** (Prioridade Alta)
   - Sistema de upload de arquivos
   - Conversão PDF → Markdown
   - Conversão DOCX → Markdown
   - Aplicação de templates

3. **Vetorização e RAG** (Prioridade Alta)
   - Configurar pgvector no Supabase
   - Pipeline de vetorização
   - Sistema de busca semântica
   - Integração RAG com IA

