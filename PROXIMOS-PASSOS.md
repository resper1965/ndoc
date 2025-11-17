# 🎯 Próximos Passos - ndocs

**Data**: 2025-01-18  
**Status Atual**: 54% completo (26/48 tarefas)

---

## 📋 Resumo do Estado Atual

### ✅ Concluído
- **Fase 1: Fundação** (100%) - Migrations aplicadas, pgvector habilitado
- **Fase 2: Templates** (80%) - Templates padrão criados e inseridos no banco
- **Fase 3: Conversão** (72%) - Sistema de upload e conversores implementados

### ⚠️ Pendente Imediato
- Corrigir erros de build (tipos TypeScript)
- Testar conversores de documentos
- Completar conversores pendentes (ODT, PPTX)

---

## 🚀 Próximos Passos (Ordem de Prioridade)

### 1. **Corrigir Build** (URGENTE - 30 min)
**Objetivo**: Resolver erros de compilação TypeScript

**Tarefas**:
- [ ] Corrigir tipos do `pptx-parser` (adicionar `as any` ou criar declaração de tipos)
- [ ] Verificar e corrigir outros erros de tipos
- [ ] Garantir que `pnpm build` compila sem erros

**Arquivos afetados**:
- `src/lib/processing/convert-document.ts`

---

### 2. **Completar Fase 3: Conversão** (1-2 horas)
**Objetivo**: Finalizar sistema de conversão de documentos

**Tarefas**:
- [ ] Testar conversores implementados (PDF, DOCX, HTML, JSON, CSV, XLSX)
- [ ] Melhorar conversor RTF (atualmente básico)
- [ ] Implementar conversor ODT completo
- [ ] Melhorar conversor PPTX (atualmente em desenvolvimento)
- [ ] Adicionar tratamento de erros robusto
- [ ] Criar testes unitários para conversores

**Arquivos**:
- `src/lib/processing/convert-document.ts`
- `src/app/api/ingest/upload/route.ts`
- `tests/converters/` (criar)

---

### 3. **Integrar Upload na Interface** (1 hora)
**Objetivo**: Adicionar componente de upload na página de configuração

**Tarefas**:
- [ ] Adicionar `DocumentUpload` na página `/config`
- [ ] Criar seção "Upload de Documentos" na aba "Documentos"
- [ ] Adicionar seleção de template durante upload
- [ ] Mostrar progresso de conversão
- [ ] Exibir lista de documentos processados

**Arquivos**:
- `src/app/config/page.tsx`
- `src/components/document-upload.tsx` (já criado)

---

### 4. **Fase 4: Pipeline de Vetorização** (4-6 horas)
**Objetivo**: Implementar processamento completo de documentos (chunking → embeddings → armazenamento)

**Tarefas**:
- [ ] Criar função `generateEmbeddings()` usando OpenAI
- [ ] Criar função `storeEmbeddings()` no Supabase
- [ ] Criar API route `/api/process/document/[id]` para processar documentos
- [ ] Implementar worker/queue para processamento assíncrono
- [ ] Criar endpoint para verificar status de processamento
- [ ] Atualizar `document_processing_jobs` com progresso
- [ ] Testar pipeline completo

**Arquivos a criar**:
- `src/lib/vectorization/generate-embeddings.ts`
- `src/lib/vectorization/store-embeddings.ts`
- `src/app/api/process/document/[id]/route.ts`
- `src/app/api/process/status/[id]/route.ts`

**Dependências**:
- OpenAI API Key configurada
- Função `chunkDocument()` já implementada ✅

---

### 5. **Fase 5: Busca Semântica** (3-4 horas)
**Objetivo**: Implementar busca semântica usando embeddings

**Tarefas**:
- [ ] Criar API route `/api/search/semantic` que:
  - Recebe query de texto
  - Gera embedding da query
  - Busca documentos similares usando `semantic_search()`
  - Retorna resultados ordenados por similaridade
- [ ] Criar componente `SearchDialog` melhorado com busca semântica
- [ ] Adicionar filtros (tipo de documento, organização, data)
- [ ] Implementar paginação
- [ ] Adicionar highlight de resultados
- [ ] Testar performance com diferentes queries

**Arquivos a criar/modificar**:
- `src/app/api/search/semantic/route.ts`
- `src/components/search-dialog.tsx` (melhorar existente)
- `src/lib/search/semantic-search.ts`

**Dependências**:
- Função `semantic_search()` já criada no banco ✅
- Embeddings já armazenados (Fase 4)

---

### 6. **Fase 6: RAG para Chatbot** (4-6 horas)
**Objetivo**: Preparar sistema para integração com chatbot

**Tarefas**:
- [ ] Criar função `ragQuery()` que:
  - Recebe pergunta do usuário
  - Busca contexto relevante usando busca semântica
  - Formata contexto para LLM
  - Retorna contexto + citações
- [ ] Criar API route `/api/rag/query`
- [ ] Implementar sistema de citações (referências aos documentos)
- [ ] Adicionar metadados de contexto (documento, chunk, similaridade)
- [ ] Criar interface de teste para RAG
- [ ] Documentar formato de resposta para integração com chatbot

**Arquivos a criar**:
- `src/lib/rag/query.ts`
- `src/app/api/rag/query/route.ts`
- `src/app/api/rag/test/page.tsx` (opcional - interface de teste)

**Dependências**:
- Busca semântica funcionando (Fase 5)
- OpenAI API configurada

---

### 7. **Melhorias e Polimento** (2-3 horas)
**Objetivo**: Melhorar UX e adicionar features finais

**Tarefas**:
- [ ] Interface para gerenciar templates (criar/editar)
- [ ] Dashboard de processamento (ver jobs em andamento)
- [ ] Estatísticas de documentos (quantos vetorizados, etc.)
- [ ] Melhorar tratamento de erros em toda aplicação
- [ ] Adicionar logs estruturados
- [ ] Documentação de API

---

## 📊 Cronograma Estimado

| Fase | Tempo Estimado | Prioridade |
|------|----------------|------------|
| 1. Corrigir Build | 30 min | 🔴 Crítica |
| 2. Completar Fase 3 | 1-2 horas | 🟡 Alta |
| 3. Integrar Upload | 1 hora | 🟡 Alta |
| 4. Fase 4: Vetorização | 4-6 horas | 🟢 Média |
| 5. Fase 5: Busca | 3-4 horas | 🟢 Média |
| 6. Fase 6: RAG | 4-6 horas | 🟢 Média |
| 7. Melhorias | 2-3 horas | 🔵 Baixa |

**Total estimado**: 15-22 horas de desenvolvimento

---

## 🎯 Meta Imediata (Próxima Sessão)

**Foco**: Corrigir build e completar Fase 3

1. ✅ Corrigir erros de build (30 min)
2. ✅ Testar conversores básicos (30 min)
3. ✅ Integrar upload na interface (1 hora)
4. ✅ Iniciar Fase 4 (vetorização) - se houver tempo

---

## 📝 Notas Importantes

### Dependências Externas
- **OpenAI API Key**: Necessária para embeddings e RAG
- **Supabase**: Já configurado ✅
- **Vercel**: Já configurado ✅

### Decisões Técnicas Pendentes
- [ ] Escolher biblioteca de queue para processamento assíncrono (ou usar Supabase Edge Functions?)
- [ ] Definir estratégia de chunking por tipo de documento
- [ ] Decidir sobre cache de embeddings

### Testes Necessários
- [ ] Testes unitários para conversores
- [ ] Testes de integração para pipeline de vetorização
- [ ] Testes de performance para busca semântica
- [ ] Testes end-to-end do fluxo completo

---

**Última atualização**: 2025-01-18
