# Tarefas Detalhadas - ndocs

**Última atualização**: 2025-01-17

## Tarefas por Fase

### Fase 1: Onboarding Completo

#### 1.1 Refatorar Criação de Organização

- [ ] **Tarefa 1.1.1**: Remover criação automática de organização no signup
  - Arquivo: `src/app/signup/page.tsx`
  - Ação: Remover chamada para `createOrganization()` após signup
  - Teste: Verificar que signup não cria organização automaticamente

- [ ] **Tarefa 1.1.2**: Criar endpoint `/api/organization/create` (apenas superadmin)
  - Arquivo: `src/app/api/organization/create/route.ts`
  - Ação: Verificar se usuário é superadmin, criar organização, criar membro admin
  - Teste: Testar criação de organização via API

- [ ] **Tarefa 1.1.3**: Formulário na página `/admin` para criar organização
  - Arquivo: `src/app/admin/page.tsx`
  - Ação: Adicionar formulário com campos: nome, slug, email do administrador
  - Teste: Testar criação de organização via UI

#### 1.2 Sistema de Convites

- [ ] **Tarefa 1.2.1**: Criar tabela `organization_invites` no Supabase
  - Arquivo: `supabase/migrations/YYYYMMDD_create_organization_invites.sql`
  - Campos: `id`, `organization_id`, `email`, `role`, `token`, `expires_at`, `accepted_at`, `created_by`, `created_at`
  - RLS: Apenas superadmin/orgadmin pode criar convites

- [ ] **Tarefa 1.2.2**: Endpoint para enviar convite por email
  - Arquivo: `src/app/api/organization/invite/route.ts`
  - Ação: Criar registro em `organization_invites`, enviar email
  - Teste: Testar envio de convite

- [ ] **Tarefa 1.2.3**: Template de email de convite
  - Arquivo: `src/lib/emails/invite-email.tsx`
  - Ação: Criar template React Email ou HTML
  - Teste: Verificar renderização do email

- [ ] **Tarefa 1.2.4**: Página de aceite de convite
  - Arquivo: `src/app/invite/accept/page.tsx`
  - Ação: Validar token, criar `organization_member`, redirecionar para onboarding
  - Teste: Testar aceite de convite

#### 1.3 Wizard de Onboarding para Administrador

- [ ] **Tarefa 1.3.1**: Criar estrutura de steps no `/onboarding`
  - Arquivo: `src/app/onboarding/page.tsx`
  - Ação: Implementar wizard com 3 steps
  - Teste: Testar navegação entre steps

- [ ] **Tarefa 1.3.2**: Step 1 - Configurar IA
  - Arquivo: `src/app/onboarding/page.tsx` (Step 1)
  - Ação: Formulário para configurar provedor e temas
  - Teste: Testar configuração de IA

- [ ] **Tarefa 1.3.3**: Step 2 - Convidar Membros
  - Arquivo: `src/app/onboarding/page.tsx` (Step 2)
  - Ação: Formulário para convidar membros
  - Teste: Testar convite de membros

- [ ] **Tarefa 1.3.4**: Step 3 - Primeira Ingestão
  - Arquivo: `src/app/onboarding/page.tsx` (Step 3)
  - Ação: Upload de documento ou criação manual
  - Teste: Testar ingestão inicial

---

### Fase 2: Ingestão de Documentos

#### 2.1 Sistema de Upload

- [ ] **Tarefa 2.1.1**: Componente de upload (drag & drop)
  - Arquivo: `src/components/document-upload.tsx`
  - Ação: Criar componente com drag & drop, validação de tipos
  - Teste: Testar upload de arquivos

- [ ] **Tarefa 2.1.2**: Validação de tipos de arquivo
  - Arquivo: `src/lib/validations/document-upload.ts`
  - Ação: Validar PDF, DOCX, TXT, MD
  - Teste: Testar validação de tipos

- [ ] **Tarefa 2.1.3**: Armazenamento no Supabase Storage
  - Arquivo: `src/lib/supabase/storage.ts`
  - Ação: Upload para bucket `documents` no Supabase Storage
  - Teste: Testar upload para storage

- [ ] **Tarefa 2.1.4**: Endpoint `/api/ingest/upload`
  - Arquivo: `src/app/api/ingest/upload/route.ts`
  - Ação: Receber arquivo, validar, upload para storage, iniciar processamento
  - Teste: Testar endpoint de upload

#### 2.2 Conversão de Documentos

- [ ] **Tarefa 2.2.1**: Instalar dependências de conversão
  - Arquivo: `package.json`
  - Ação: Adicionar `pdf-parse`, `mammoth`
  - Teste: Verificar instalação

- [ ] **Tarefa 2.2.2**: PDF → Markdown
  - Arquivo: `src/lib/converters/pdf-to-markdown.ts`
  - Ação: Extrair texto e estrutura, converter para Markdown
  - Teste: Testar conversão de PDF

- [ ] **Tarefa 2.2.3**: DOCX → Markdown
  - Arquivo: `src/lib/converters/docx-to-markdown.ts`
  - Ação: Extrair texto e formatação, converter para Markdown
  - Teste: Testar conversão de DOCX

- [ ] **Tarefa 2.2.4**: TXT → Markdown
  - Arquivo: `src/lib/converters/txt-to-markdown.ts`
  - Ação: Conversão simples
  - Teste: Testar conversão de TXT

- [ ] **Tarefa 2.2.5**: MD → Markdown (validação)
  - Arquivo: `src/lib/converters/md-validator.ts`
  - Ação: Validar e sanitizar Markdown
  - Teste: Testar validação de MD

#### 2.3 Aplicação de Templates

- [ ] **Tarefa 2.3.1**: Analisar projeto Pinexio
  - Arquivo: `docs/pinexio-analysis.md`
  - Ação: Documentar estrutura e padrões
  - Teste: N/A

- [ ] **Tarefa 2.3.2**: Criar templates por tipo
  - Arquivo: `src/lib/templates/pinexio-templates.ts`
  - Ação: Criar templates baseados no Pinexio
  - Teste: Testar aplicação de templates

- [ ] **Tarefa 2.3.3**: Aplicar template durante conversão
  - Arquivo: `src/lib/converters/apply-template.ts`
  - Ação: Aplicar template após conversão
  - Teste: Testar aplicação de template

- [ ] **Tarefa 2.3.4**: Extrair metadados
  - Arquivo: `src/lib/converters/extract-metadata.ts`
  - Ação: Extrair título, autor, data do documento
  - Teste: Testar extração de metadados

#### 2.4 Processamento Assíncrono

- [ ] **Tarefa 2.4.1**: Criar tabela `document_processing_jobs`
  - Arquivo: `supabase/migrations/YYYYMMDD_create_processing_jobs.sql`
  - Campos: `id`, `document_id`, `status`, `error`, `created_at`, `updated_at`
  - Teste: Testar criação de jobs

- [ ] **Tarefa 2.4.2**: Queue system (Supabase Edge Functions)
  - Arquivo: `supabase/functions/process-document/index.ts`
  - Ação: Processar documento em background
  - Teste: Testar processamento assíncrono

- [ ] **Tarefa 2.4.3**: Status de processamento
  - Arquivo: `src/app/api/ingest/status/route.ts`
  - Ação: Retornar status do processamento
  - Teste: Testar consulta de status

- [ ] **Tarefa 2.4.4**: Notificações de conclusão
  - Arquivo: `src/lib/notifications/document-processed.ts`
  - Ação: Enviar notificação quando processamento concluir
  - Teste: Testar notificações

---

### Fase 3: Vetorização e RAG

#### 3.1 Configuração de pgvector

- [ ] **Tarefa 3.1.1**: Habilitar extensão pgvector
  - Arquivo: `supabase/migrations/YYYYMMDD_enable_pgvector.sql`
  - Ação: `CREATE EXTENSION IF NOT EXISTS vector;`
  - Teste: Verificar extensão habilitada

- [ ] **Tarefa 3.1.2**: Criar tabela `document_chunks`
  - Arquivo: `supabase/migrations/YYYYMMDD_create_document_chunks.sql`
  - Campos: `id`, `document_id`, `chunk_index`, `content`, `created_at`
  - Teste: Testar criação de chunks

- [ ] **Tarefa 3.1.3**: Criar tabela `document_embeddings`
  - Arquivo: `supabase/migrations/YYYYMMDD_create_document_embeddings.sql`
  - Campos: `id`, `chunk_id`, `embedding` (vector), `created_at`
  - Teste: Testar criação de embeddings

- [ ] **Tarefa 3.1.4**: Criar índices vetoriais
  - Arquivo: `supabase/migrations/YYYYMMDD_create_vector_indexes.sql`
  - Ação: Criar índice HNSW para busca rápida
  - Teste: Testar performance de busca

#### 3.2 Pipeline de Vetorização

- [ ] **Tarefa 3.2.1**: Chunking de documentos
  - Arquivo: `src/lib/vectorization/chunk-document.ts`
  - Ação: Dividir documento em chunks de ~500 tokens
  - Teste: Testar chunking

- [ ] **Tarefa 3.2.2**: Geração de embeddings
  - Arquivo: `src/lib/vectorization/generate-embeddings.ts`
  - Ação: Usar OpenAI `text-embedding-3-small`
  - Teste: Testar geração de embeddings

- [ ] **Tarefa 3.2.3**: Armazenamento de embeddings
  - Arquivo: `src/lib/vectorization/store-embeddings.ts`
  - Ação: Salvar embeddings na tabela `document_embeddings`
  - Teste: Testar armazenamento

- [ ] **Tarefa 3.2.4**: Processamento em background
  - Arquivo: `supabase/functions/vectorize-document/index.ts`
  - Ação: Processar vetorização em background
  - Teste: Testar processamento assíncrono

#### 3.3 Sistema de Busca Semântica

- [ ] **Tarefa 3.3.1**: Endpoint `/api/search/semantic`
  - Arquivo: `src/app/api/search/semantic/route.ts`
  - Ação: Buscar documentos por similaridade
  - Teste: Testar busca semântica

- [ ] **Tarefa 3.3.2**: Busca por similaridade (cosine similarity)
  - Arquivo: `src/lib/vectorization/semantic-search.ts`
  - Ação: Calcular similaridade entre query e embeddings
  - Teste: Testar cálculo de similaridade

- [ ] **Tarefa 3.3.3**: Ranking de resultados
  - Arquivo: `src/lib/vectorization/rank-results.ts`
  - Ação: Ordenar resultados por relevância
  - Teste: Testar ranking

- [ ] **Tarefa 3.3.4**: Filtros por organização
  - Arquivo: `src/lib/vectorization/filter-by-org.ts`
  - Ação: Filtrar resultados por organização
  - Teste: Testar filtros

#### 3.4 Integração RAG com IA

- [ ] **Tarefa 3.4.1**: Retrieval de chunks relevantes
  - Arquivo: `src/lib/rag/retrieve-chunks.ts`
  - Ação: Buscar chunks mais relevantes para query
  - Teste: Testar retrieval

- [ ] **Tarefa 3.4.2**: Context injection para IA
  - Arquivo: `src/lib/rag/inject-context.ts`
  - Ação: Injetar chunks no prompt da IA
  - Teste: Testar injeção de contexto

- [ ] **Tarefa 3.4.3**: Geração de respostas baseadas em documentos
  - Arquivo: `src/app/api/rag/query/route.ts`
  - Ação: Gerar resposta usando RAG
  - Teste: Testar geração de respostas

- [ ] **Tarefa 3.4.4**: Citações e referências
  - Arquivo: `src/lib/rag/add-citations.ts`
  - Ação: Adicionar citações às respostas
  - Teste: Testar citações

---

### Fase 4: Templates Pinexio

#### 4.1 Análise do Pinexio

- [ ] **Tarefa 4.1.1**: Localizar projeto Pinexio original
  - Arquivo: `docs/pinexio-analysis.md`
  - Ação: Encontrar repositório ou código fonte
  - Teste: N/A

- [ ] **Tarefa 4.1.2**: Analisar estrutura de documentos
  - Arquivo: `docs/pinexio-analysis.md`
  - Ação: Documentar estrutura
  - Teste: N/A

- [ ] **Tarefa 4.1.3**: Identificar padrões de formatação
  - Arquivo: `docs/pinexio-analysis.md`
  - Ação: Documentar padrões
  - Teste: N/A

- [ ] **Tarefa 4.1.4**: Extrair templates
  - Arquivo: `src/lib/templates/pinexio-templates.ts`
  - Ação: Criar templates baseados na análise
  - Teste: Testar templates

#### 4.2 Sistema de Templates

- [ ] **Tarefa 4.2.1**: Criar tabela `document_templates`
  - Arquivo: `supabase/migrations/YYYYMMDD_create_document_templates.sql`
  - Campos: `id`, `organization_id`, `name`, `type`, `template`, `created_at`, `updated_at`
  - Teste: Testar criação de templates

- [ ] **Tarefa 4.2.2**: Templates por tipo de documento
  - Arquivo: `src/lib/templates/template-types.ts`
  - Ação: Definir tipos (manual, tutorial, spec, etc.)
  - Teste: Testar tipos

- [ ] **Tarefa 4.2.3**: Aplicação automática na conversão
  - Arquivo: `src/lib/converters/apply-template.ts`
  - Ação: Aplicar template durante conversão
  - Teste: Testar aplicação automática

- [ ] **Tarefa 4.2.4**: Customização por organização
  - Arquivo: `src/lib/templates/customize-template.ts`
  - Ação: Permitir customização por organização
  - Teste: Testar customização

#### 4.3 Editor de Templates

- [ ] **Tarefa 4.3.1**: Interface para criar/editar templates
  - Arquivo: `src/app/config/templates/page.tsx`
  - Ação: Criar interface de edição
  - Teste: Testar criação/edição

- [ ] **Tarefa 4.3.2**: Preview de templates
  - Arquivo: `src/components/template-preview.tsx`
  - Ação: Mostrar preview do template
  - Teste: Testar preview

- [ ] **Tarefa 4.3.3**: Variáveis e placeholders
  - Arquivo: `src/lib/templates/parse-variables.ts`
  - Ação: Suportar variáveis no template
  - Teste: Testar variáveis

---

## Tarefas de Manutenção

### Documentação

- [ ] Atualizar `README.md` com novas funcionalidades
- [ ] Atualizar `GUIA-USUARIO-COMPLETO.md`
- [ ] Criar documentação de API

### Testes

- [ ] Testes unitários para conversores
- [ ] Testes de integração para RAG
- [ ] Testes E2E para onboarding

### Performance

- [ ] Otimizar queries de busca semântica
- [ ] Cache de embeddings
- [ ] Otimizar processamento de documentos

