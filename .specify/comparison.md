# Comparação: Estado Atual vs. Especificação

**Data**: 2025-01-17  
**Objetivo**: Comparar o estado atual do projeto com as especificações do spec-kit

## Estrutura de Documentação

### Estado Atual (`docs/`)

```
docs/
├── components/
│   └── folder-tree.mdx
├── customization/
│   ├── font.mdx
│   ├── seo-and-social-sharing.mdx
│   ├── sidebar.mdx
│   └── toc.mdx
├── getting-started/
│   ├── installation.mdx
│   └── quick-start.mdx
├── exemplo-documento.mdx
├── index.mdx
├── search-bar.mdx
└── theme.mdx
```

### Especificação (Spec-Kit)

```
.specify/
├── constitution.md      ✅ Criado
├── current.md          ✅ Criado
├── plan.md             ✅ Criado
├── tasks.md            ✅ Criado
└── comparison.md       ✅ Este arquivo
```

## Funcionalidades

### ✅ Implementado (Alinhado com Spec)

| Funcionalidade | Status | Arquivo/Implementação |
|----------------|--------|----------------------|
| Autenticação | ✅ | `src/app/login/page.tsx`, `src/app/signup/page.tsx` |
| Multi-tenancy básico | ✅ | `supabase/migrations/20250113000000_initial_schema.sql` |
| Gerenciamento de documentos MDX | ✅ | `src/app/config/page.tsx` (Tab Documentos) |
| Configuração de IA | ✅ | `src/app/config/page.tsx` (Tab IA) |
| Geração de documentos com IA | ✅ | `src/app/api/ai/generate/route.ts` |
| Melhoria de documentos com IA | ✅ | `src/app/api/ai/improve/route.ts` |
| Interface de configuração | ✅ | `src/app/config/page.tsx` |
| Página de administração | ✅ | `src/app/admin/page.tsx` |

### ❌ Não Implementado (Gap)

| Funcionalidade | Prioridade | Status no Spec | Arquivo Necessário |
|----------------|------------|----------------|-------------------|
| Onboarding completo (superadmin → admin) | 🔴 Alta | ❌ | `src/app/onboarding/page.tsx` (refatorar) |
| Sistema de convites por email | 🔴 Alta | ❌ | `src/app/api/organization/invite/route.ts` |
| Upload de PDF/DOCX | 🔴 Alta | ❌ | `src/components/document-upload.tsx` |
| Conversão PDF → Markdown | 🔴 Alta | ❌ | `src/lib/converters/pdf-to-markdown.ts` |
| Conversão DOCX → Markdown | 🔴 Alta | ❌ | `src/lib/converters/docx-to-markdown.ts` |
| Vetorização de documentos | 🔴 Alta | ❌ | `src/lib/vectorization/` |
| RAG (Retrieval Augmented Generation) | 🔴 Alta | ❌ | `src/lib/rag/` |
| Templates Pinexio | 🟡 Média | ❌ | `src/lib/templates/pinexio-templates.ts` |

## Estrutura de Dados

### ✅ Tabelas Existentes

| Tabela | Status | Migração |
|--------|--------|----------|
| `organizations` | ✅ | `20250113000000_initial_schema.sql` |
| `organization_members` | ✅ | `20250113000000_initial_schema.sql` |
| `documents` | ✅ | `20250113000000_initial_schema.sql` |
| `ai_provider_config` | ✅ | `20250113000000_initial_schema.sql` |
| `ai_themes` | ✅ | `20250113000000_initial_schema.sql` |
| `superadmins` | ✅ | `20250113000000_initial_schema.sql` |

### ❌ Tabelas Faltantes

| Tabela | Prioridade | Uso |
|--------|------------|-----|
| `organization_invites` | 🔴 Alta | Sistema de convites |
| `document_processing_jobs` | 🔴 Alta | Processamento assíncrono |
| `document_chunks` | 🔴 Alta | Vetorização |
| `document_embeddings` | 🔴 Alta | Vetorização (pgvector) |
| `document_templates` | 🟡 Média | Templates Pinexio |

## APIs

### ✅ APIs Implementadas

| Endpoint | Método | Status | Arquivo |
|----------|--------|--------|---------|
| `/api/ingest` | GET, POST, PUT, DELETE | ✅ | `src/app/api/ingest/route.ts` |
| `/api/ai/providers` | GET, POST | ✅ | `src/app/api/ai/providers/route.ts` |
| `/api/ai/themes` | GET, POST | ✅ | `src/app/api/ai/themes/route.ts` |
| `/api/ai/generate` | POST | ✅ | `src/app/api/ai/generate/route.ts` |
| `/api/ai/improve` | POST | ✅ | `src/app/api/ai/improve/route.ts` |
| `/api/organization/create` | POST | ✅ | `src/app/api/organization/create/route.ts` |
| `/api/config/credentials` | GET, PUT | ✅ | `src/app/api/config/credentials/route.ts` |

### ❌ APIs Faltantes

| Endpoint | Método | Prioridade | Uso |
|----------|--------|------------|-----|
| `/api/organization/invite` | POST | 🔴 Alta | Enviar convite |
| `/api/ingest/upload` | POST | 🔴 Alta | Upload de arquivos |
| `/api/ingest/status` | GET | 🔴 Alta | Status de processamento |
| `/api/search/semantic` | GET | 🔴 Alta | Busca semântica |
| `/api/rag/query` | POST | 🔴 Alta | Query RAG |

## Componentes

### ✅ Componentes Existentes

| Componente | Status | Arquivo |
|------------|--------|---------|
| `MDXEditorWithPreview` | ✅ | `src/components/mdx-editor-with-preview.tsx` |
| `DocumentCard` | ✅ | `src/components/document-card.tsx` |
| `AIActions` | ✅ | `src/components/ai-actions.tsx` |
| `SearchDialog` | ✅ | `src/components/search-dialog.tsx` |
| `BrandingText` | ✅ | `src/components/branding-text.tsx` |
| `Sidebar` | ✅ | `src/components/sidebar.tsx` |

### ❌ Componentes Faltantes

| Componente | Prioridade | Uso |
|------------|------------|-----|
| `DocumentUpload` | 🔴 Alta | Upload de PDF/DOCX |
| `OnboardingWizard` | 🔴 Alta | Wizard de onboarding |
| `InviteForm` | 🔴 Alta | Formulário de convite |
| `TemplateEditor` | 🟡 Média | Editor de templates |

## Documentação

### ✅ Documentação Existente

| Documento | Status | Arquivo |
|-----------|--------|---------|
| README.md | ✅ | `README.md` |
| Guia do Usuário | ✅ | `GUIA-USUARIO-COMPLETO.md` |
| Guia de Configuração | ✅ | `GUIA-TELA-CONFIGURACAO.md` |
| Análise de Gap | ✅ | `ANALISE-GAP-FUNCIONAL.md` |
| Especificações (Spec-Kit) | ✅ | `.specify/` |

### 📝 Documentação a Atualizar

| Documento | Ação Necessária |
|-----------|-----------------|
| `README.md` | Adicionar referência ao spec-kit |
| `docs/index.mdx` | Adicionar seção sobre especificações |
| `GUIA-USUARIO-COMPLETO.md` | Atualizar com novas funcionalidades (quando implementadas) |

## Próximos Passos

### Imediato (Esta Semana)

1. ✅ Criar estrutura `.specify/` (concluído)
2. [ ] Atualizar `README.md` com referência ao spec-kit
3. [ ] Atualizar `docs/index.mdx` com link para especificações

### Curto Prazo (Próximas 2 Semanas)

1. [ ] Implementar Fase 1: Onboarding Completo
2. [ ] Criar sistema de convites
3. [ ] Refatorar criação de organização

### Médio Prazo (Próximas 4 Semanas)

1. [ ] Implementar Fase 2: Ingestão de Documentos
2. [ ] Sistema de upload
3. [ ] Conversão PDF/DOCX → Markdown

### Longo Prazo (Próximas 8 Semanas)

1. [ ] Implementar Fase 3: Vetorização e RAG
2. [ ] Configurar pgvector
3. [ ] Sistema de busca semântica

## Métricas de Alinhamento

### Cobertura de Funcionalidades

- **Implementado**: 8/16 funcionalidades (50%)
- **Pendente Alta Prioridade**: 8 funcionalidades
- **Pendente Média Prioridade**: 1 funcionalidade

### Cobertura de APIs

- **Implementado**: 7/12 APIs (58%)
- **Pendente Alta Prioridade**: 5 APIs

### Cobertura de Componentes

- **Implementado**: 6/10 componentes (60%)
- **Pendente Alta Prioridade**: 3 componentes
- **Pendente Média Prioridade**: 1 componente

## Conclusão

O projeto está **50% alinhado** com as especificações. As funcionalidades básicas estão implementadas, mas faltam funcionalidades críticas para tornar o projeto uma plataforma SaaS completa:

1. **Onboarding estruturado** (superadmin → admin)
2. **Ingestão de documentos** (PDF/DOCX → Markdown)
3. **Vetorização e RAG** (busca semântica)

O spec-kit foi criado e documentado em `.specify/`, permitindo comparação e acompanhamento do progresso.

