# Projeto Detalhado de Migração - ndocs

**Versão**: 1.0  
**Data**: 2025-01-17  
**Status**: Planejamento Detalhado

## 📋 Visão Geral

Este documento detalha o projeto de migração do **ndocs** para uma plataforma SaaS completa com:
- **Vetorização**: Supabase Vector (pgvector) para indexação e busca semântica
- **RAG**: Preparação para chatbot futuro e indexação de documentos
- **Templates**: Políticas, Procedimentos e Manuais
- **Ingestão**: PDF, DOCX → Markdown com aplicação automática de templates

## 🎯 Objetivos da Migração

### Objetivos Principais

1. **Indexação Inteligente**: Todos os documentos vetorizados automaticamente
2. **Busca Semântica**: Busca por significado, não apenas palavras-chave
3. **Preparação para Chatbot**: RAG pronto para integração futura
4. **Templates Estruturados**: Políticas, Procedimentos e Manuais padronizados
5. **Ingestão Automática**: Conversão automática de PDF/DOCX para Markdown

### Casos de Uso

- **Busca de Políticas**: "Qual a política de férias?"
- **Consulta de Procedimentos**: "Como fazer solicitação de reembolso?"
- **Referência de Manuais**: "Onde está o manual de onboarding?"
- **Chatbot Futuro**: Respostas baseadas em documentos indexados

---

## 🏗️ Arquitetura da Solução

### Stack Escolhido

#### Vetorização: **Supabase Vector (pgvector)** ✅

**Por quê?**
- ✅ Já integrado ao Supabase (sem infraestrutura adicional)
- ✅ PostgreSQL nativo (performance e confiabilidade)
- ✅ Suporte a busca por similaridade (cosine, L2, inner product)
- ✅ Índices HNSW para busca rápida
- ✅ Gratuito até certo volume

**Especificações Técnicas:**
- **Modelo de Embedding**: OpenAI `text-embedding-3-small` (1536 dimensões)
- **Custo**: ~$0.02 por 1M tokens (muito barato)
- **Performance**: <100ms para busca em 10k documentos

### Fluxo de Dados

```
Upload (PDF/DOCX)
    ↓
Conversão → Markdown
    ↓
Aplicação de Template (Política/Procedimento/Manual)
    ↓
Armazenamento no Supabase (tabela documents)
    ↓
Chunking (dividir em pedaços de ~500 tokens)
    ↓
Geração de Embeddings (OpenAI)
    ↓
Armazenamento Vetorial (pgvector)
    ↓
Indexação Completa ✅
```

### Fluxo de Busca (RAG)

```
Query do Usuário
    ↓
Geração de Embedding da Query
    ↓
Busca por Similaridade (pgvector)
    ↓
Retrieval dos Top-K Chunks
    ↓
Context Injection para IA
    ↓
Geração de Resposta (com citações)
```

---

## 📚 Templates: Políticas, Procedimentos e Manuais

### Análise do Pinexio

O [Pinexio](https://github.com/sanjayc208/pinexio) é um template de documentação Next.js que usa:
- **MDX** para conteúdo
- **Contentlayer** para indexação
- **Estrutura hierárquica** de documentos
- **Componentes reutilizáveis** (FolderTree, CodeTabs, etc.)

### Templates para ndocs

#### 1. **Template de Política**

**Estrutura:**
```markdown
---
title: [Nome da Política]
type: policy
category: [RH | Financeiro | TI | Operacional]
version: 1.0
effective_date: YYYY-MM-DD
review_date: YYYY-MM-DD
approver: [Nome]
status: [Ativa | Rascunho | Revogada]
---

# [Nome da Política]

## Objetivo
[Objetivo da política]

## Escopo
[Quem se aplica]

## Definições
[Termos importantes]

## Política
[Conteúdo da política]

## Responsabilidades
[Quem é responsável pelo quê]

## Conformidade
[Como garantir conformidade]

## Referências
[Links para documentos relacionados]

## Histórico de Revisões
| Data | Versão | Mudanças | Autor |
|------|--------|----------|-------|
| YYYY-MM-DD | 1.0 | Criação inicial | [Nome] |
```

#### 2. **Template de Procedimento**

**Estrutura:**
```markdown
---
title: [Nome do Procedimento]
type: procedure
category: [RH | Financeiro | TI | Operacional]
version: 1.0
effective_date: YYYY-MM-DD
owner: [Departamento]
status: [Ativo | Rascunho | Desativado]
---

# [Nome do Procedimento]

## Objetivo
[Objetivo do procedimento]

## Escopo
[Quando aplicar este procedimento]

## Responsáveis
[Quem executa cada etapa]

## Materiais Necessários
[Lista de materiais/ferramentas]

## Passo a Passo

### Passo 1: [Nome do Passo]
1. [Ação específica]
2. [Ação específica]
3. [Ação específica]

### Passo 2: [Nome do Passo]
...

## Fluxograma
[Diagrama do processo - opcional]

## Exceções
[Quando não seguir o procedimento]

## Referências
[Links para políticas/procedimentos relacionados]

## Histórico de Revisões
| Data | Versão | Mudanças | Autor |
|------|--------|----------|-------|
| YYYY-MM-DD | 1.0 | Criação inicial | [Nome] |
```

#### 3. **Template de Manual**

**Estrutura:**
```markdown
---
title: [Nome do Manual]
type: manual
category: [Onboarding | Sistema | Processo]
version: 1.0
target_audience: [Novos funcionários | Usuários do sistema | Equipe]
status: [Ativo | Rascunho]
---

# [Nome do Manual]

## Introdução
[Contexto e propósito do manual]

## Índice
1. [Seção 1](#secao-1)
2. [Seção 2](#secao-2)
...

## [Seção 1]

### [Subseção 1.1]
[Conteúdo]

### [Subseção 1.2]
[Conteúdo]

## [Seção 2]
...

## Glossário
| Termo | Definição |
|-------|-----------|
| Termo 1 | Definição 1 |
| Termo 2 | Definição 2 |

## FAQ
**P: Pergunta frequente?**  
R: Resposta.

## Recursos Adicionais
[Links para recursos externos]

## Contato
[Como obter ajuda]
```

---

## 🗄️ Estrutura de Banco de Dados

### Novas Tabelas

#### 1. `document_templates`

```sql
CREATE TABLE document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('policy', 'procedure', 'manual')),
  description TEXT,
  template_content TEXT NOT NULL, -- Template MDX com placeholders
  metadata_schema JSONB, -- Schema para frontmatter
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view templates in their organization"
  ON document_templates FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
    OR is_superadmin()
  );

CREATE POLICY "Admins can manage templates"
  ON document_templates FOR ALL
  USING (
    is_superadmin()
    OR is_orgadmin(organization_id, auth.uid())
  );
```

#### 2. `document_chunks`

```sql
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  token_count INTEGER,
  metadata JSONB, -- Informações adicionais (seção, página, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, chunk_index)
);

-- RLS (herda da tabela documents)
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chunks of accessible documents"
  ON document_chunks FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM documents
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
      OR status = 'published'
    )
    OR is_superadmin()
  );
```

#### 3. `document_embeddings`

```sql
-- Habilitar extensão pgvector
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_id UUID REFERENCES document_chunks(id) ON DELETE CASCADE,
  embedding vector(1536) NOT NULL, -- OpenAI text-embedding-3-small
  model VARCHAR(100) DEFAULT 'text-embedding-3-small',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chunk_id)
);

-- Índice HNSW para busca rápida
CREATE INDEX ON document_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- RLS (herda da tabela document_chunks)
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view embeddings of accessible chunks"
  ON document_embeddings FOR SELECT
  USING (
    chunk_id IN (
      SELECT id FROM document_chunks
      WHERE document_id IN (
        SELECT id FROM documents
        WHERE organization_id IN (
          SELECT organization_id FROM organization_members
          WHERE user_id = auth.uid()
        )
        OR status = 'published'
      )
    )
    OR is_superadmin()
  );
```

#### 4. `document_processing_jobs`

```sql
CREATE TABLE document_processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  stage VARCHAR(50), -- 'conversion', 'chunking', 'embedding', 'complete'
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE document_processing_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view jobs for their documents"
  ON document_processing_jobs FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM documents
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
    OR is_superadmin()
  );
```

### Atualizações na Tabela `documents`

```sql
-- Adicionar campos para templates
ALTER TABLE documents
ADD COLUMN template_id UUID REFERENCES document_templates(id),
ADD COLUMN document_type VARCHAR(50) CHECK (document_type IN ('policy', 'procedure', 'manual', 'other')),
ADD COLUMN is_vectorized BOOLEAN DEFAULT false,
ADD COLUMN vectorized_at TIMESTAMPTZ;
```

---

## 🔄 Pipeline de Processamento

### 1. Upload e Conversão

**Arquivo**: `src/lib/processing/convert-document.ts`

```typescript
export async function convertDocument(
  file: File,
  organizationId: string
): Promise<{
  content: string;
  metadata: Record<string, any>;
}> {
  const fileType = getFileType(file.name);
  
  switch (fileType) {
    case 'pdf':
      return await convertPDFToMarkdown(file);
    case 'docx':
      return await convertDOCXToMarkdown(file);
    case 'txt':
      return await convertTXTToMarkdown(file);
    case 'md':
      return await validateMarkdown(file);
    default:
      throw new Error(`Tipo de arquivo não suportado: ${fileType}`);
  }
}
```

### 2. Aplicação de Template

**Arquivo**: `src/lib/processing/apply-template.ts`

```typescript
export async function applyTemplate(
  content: string,
  templateId: string,
  metadata: Record<string, any>
): Promise<string> {
  const template = await getTemplate(templateId);
  
  // Extrair metadados do documento original
  const extractedMetadata = extractMetadata(content, template.metadata_schema);
  
  // Aplicar template
  const templatedContent = renderTemplate(
    template.template_content,
    { ...metadata, ...extractedMetadata }
  );
  
  // Combinar frontmatter + conteúdo
  return combineFrontmatterAndContent(templatedContent, content);
}
```

### 3. Chunking

**Arquivo**: `src/lib/vectorization/chunk-document.ts`

```typescript
export function chunkDocument(
  content: string,
  options: {
    chunkSize?: number; // tokens
    chunkOverlap?: number; // tokens
    strategy?: 'sentence' | 'paragraph' | 'semantic';
  } = {}
): DocumentChunk[] {
  const {
    chunkSize = 500,
    chunkOverlap = 50,
    strategy = 'paragraph'
  } = options;
  
  // Dividir por parágrafos (melhor para políticas/procedimentos)
  if (strategy === 'paragraph') {
    return chunkByParagraphs(content, chunkSize, chunkOverlap);
  }
  
  // Dividir por sentenças (melhor para manuais)
  if (strategy === 'sentence') {
    return chunkBySentences(content, chunkSize, chunkOverlap);
  }
  
  // Dividir semanticamente (futuro)
  return chunkSemantically(content, chunkSize, chunkOverlap);
}
```

### 4. Geração de Embeddings

**Arquivo**: `src/lib/vectorization/generate-embeddings.ts`

```typescript
export async function generateEmbeddings(
  chunks: DocumentChunk[],
  organizationId: string
): Promise<Embedding[]> {
  const apiKey = await getOpenAIKey(organizationId);
  
  const embeddings = await Promise.all(
    chunks.map(async (chunk) => {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunk.content,
      });
      
      return {
        chunkId: chunk.id,
        embedding: response.data[0].embedding,
        model: 'text-embedding-3-small',
      };
    })
  );
  
  return embeddings;
}
```

### 5. Armazenamento Vetorial

**Arquivo**: `src/lib/vectorization/store-embeddings.ts`

```typescript
export async function storeEmbeddings(
  embeddings: Embedding[],
  supabase: SupabaseClient
): Promise<void> {
  const inserts = embeddings.map((emb) => ({
    chunk_id: emb.chunkId,
    embedding: emb.embedding,
    model: emb.model,
  }));
  
  const { error } = await supabase
    .from('document_embeddings')
    .insert(inserts);
  
  if (error) {
    throw new Error(`Erro ao armazenar embeddings: ${error.message}`);
  }
}
```

---

## 🔍 Sistema de Busca Semântica

### Função SQL para Busca

**Arquivo**: `supabase/migrations/YYYYMMDD_create_semantic_search_function.sql`

```sql
CREATE OR REPLACE FUNCTION semantic_search(
  query_embedding vector(1536),
  organization_id_filter UUID DEFAULT NULL,
  document_type_filter VARCHAR(50) DEFAULT NULL,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  chunk_id UUID,
  document_id UUID,
  content TEXT,
  similarity FLOAT,
  document_title TEXT,
  document_type VARCHAR(50),
  chunk_index INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    de.chunk_id,
    dc.document_id,
    dc.content,
    1 - (de.embedding <=> query_embedding) AS similarity,
    d.title AS document_title,
    d.document_type,
    dc.chunk_index
  FROM document_embeddings de
  JOIN document_chunks dc ON de.chunk_id = dc.id
  JOIN documents d ON dc.document_id = d.id
  WHERE
    (organization_id_filter IS NULL OR d.organization_id = organization_id_filter)
    AND (document_type_filter IS NULL OR d.document_type = document_type_filter)
    AND (1 - (de.embedding <=> query_embedding)) >= match_threshold
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### API de Busca

**Arquivo**: `src/app/api/search/semantic/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const { query, organizationId, documentType, limit = 10 } = await request.json();
  
  // Gerar embedding da query
  const queryEmbedding = await generateEmbedding(query);
  
  // Buscar no banco
  const { data, error } = await supabase.rpc('semantic_search', {
    query_embedding: queryEmbedding,
    organization_id_filter: organizationId || null,
    document_type_filter: documentType || null,
    match_threshold: 0.7,
    match_count: limit,
  });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ results: data });
}
```

---

## 🤖 Preparação para Chatbot (RAG)

### Estrutura RAG

**Arquivo**: `src/lib/rag/query.ts`

```typescript
export async function queryRAG(
  question: string,
  context: {
    organizationId: string;
    documentType?: string;
    maxChunks?: number;
  }
): Promise<{
  answer: string;
  sources: Array<{
    documentId: string;
    documentTitle: string;
    chunkIndex: number;
    similarity: number;
  }>;
}> {
  // 1. Buscar chunks relevantes
  const relevantChunks = await semanticSearch(question, context);
  
  // 2. Construir contexto
  const contextText = relevantChunks
    .map((chunk, idx) => `[${idx + 1}] ${chunk.content}`)
    .join('\n\n');
  
  // 3. Gerar resposta com IA
  const answer = await generateAnswer(question, contextText);
  
  // 4. Extrair citações
  const sources = relevantChunks.map((chunk) => ({
    documentId: chunk.document_id,
    documentTitle: chunk.document_title,
    chunkIndex: chunk.chunk_index,
    similarity: chunk.similarity,
  }));
  
  return { answer, sources };
}
```

### Endpoint RAG (Futuro)

**Arquivo**: `src/app/api/rag/query/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const { question, organizationId, documentType } = await request.json();
  
  const result = await queryRAG(question, {
    organizationId,
    documentType,
    maxChunks: 5,
  });
  
  return NextResponse.json(result);
}
```

---

## 📅 Cronograma de Implementação

### Fase 1: Fundação (Semana 1-2)

**Objetivo**: Configurar infraestrutura de vetorização

- [ ] Habilitar pgvector no Supabase
- [ ] Criar migrations para novas tabelas
- [ ] Implementar funções SQL de busca
- [ ] Testes de performance

**Entregáveis**:
- ✅ pgvector habilitado
- ✅ Tabelas criadas
- ✅ Funções SQL testadas

### Fase 2: Templates (Semana 3-4)

**Objetivo**: Criar sistema de templates

- [ ] Criar tabela `document_templates`
- [ ] Implementar templates de Política, Procedimento e Manual
- [ ] Interface para criar/editar templates
- [ ] Aplicação automática de templates

**Entregáveis**:
- ✅ 3 templates padrão criados
- ✅ Interface de gerenciamento
- ✅ Aplicação automática funcionando

### Fase 3: Conversão e Chunking (Semana 5-7)

**Objetivo**: Implementar conversão ampla de documentos modernos e preparação para vetorização

#### Tipos de Documentos Suportados

**Documentos de Texto:**
- [ ] PDF → Markdown
- [ ] DOCX → Markdown
- [ ] DOC (Word antigo) → Markdown
- [ ] RTF → Markdown
- [ ] ODT (OpenDocument) → Markdown
- [ ] TXT → Markdown
- [ ] MD/MDX → Validação e sanitização

**Documentos Estruturados:**
- [ ] HTML → Markdown
- [ ] JSON → Markdown (formatado)
- [ ] XML → Markdown (formatado)
- [ ] CSV → Markdown (tabela)

**Planilhas e Apresentações:**
- [ ] XLSX (Excel) → Markdown (tabelas)
- [ ] PPTX (PowerPoint) → Markdown (slides)

**Tarefas:**
- [ ] Sistema de upload (drag & drop)
- [ ] Detecção automática de tipo de arquivo
- [ ] Conversores para cada tipo
- [ ] Aplicação de templates
- [ ] Sistema de chunking
- [ ] Extração de metadados

**Entregáveis**:
- ✅ Upload funcionando
- ✅ Conversão de todos os tipos funcionando
- ✅ Templates aplicados automaticamente
- ✅ Chunking implementado

### Fase 4: Vetorização (Semana 8-10)

**Objetivo**: Implementar pipeline completo de vetorização

- [ ] Geração de embeddings
- [ ] Armazenamento vetorial
- [ ] Processamento assíncrono
- [ ] Status de processamento

**Entregáveis**:
- ✅ Pipeline completo funcionando
- ✅ Documentos vetorizados automaticamente
- ✅ Dashboard de status

### Fase 5: Busca Semântica (Semana 11-12)

**Objetivo**: Implementar busca semântica

- [ ] API de busca semântica
- [ ] Interface de busca
- [ ] Ranking e filtros
- [ ] Testes de performance

**Entregáveis**:
- ✅ Busca semântica funcionando
- ✅ Interface de busca
- ✅ Performance <100ms

### Fase 6: RAG (Semana 13-14)

**Objetivo**: Preparar para chatbot

- [ ] Implementar query RAG
- [ ] Context injection
- [ ] Citações e referências
- [ ] API RAG (preparação)

**Entregáveis**:
- ✅ RAG funcionando
- ✅ API pronta para chatbot
- ✅ Citações implementadas

---

## 📊 Métricas de Sucesso

### Performance

- ✅ **Busca semântica**: <100ms para 10k documentos
- ✅ **Vetorização**: <30s por documento (médio)
- ✅ **Chunking**: <1s por documento

### Qualidade

- ✅ **Precisão de busca**: >80% de relevância
- ✅ **Cobertura de templates**: 100% dos documentos com template
- ✅ **Taxa de sucesso de conversão**: >95%

### Custo

- ✅ **Embeddings**: <$0.10 por 1000 documentos
- ✅ **Storage**: <$5/mês para 10k documentos

---

## 🚨 Riscos e Mitigações

### Risco 1: Performance de Busca

**Risco**: Busca lenta com muitos documentos

**Mitigação**:
- Índices HNSW otimizados
- Cache de queries frequentes
- Limite de resultados

### Risco 2: Custo de Embeddings

**Risco**: Custo alto com muitos documentos

**Mitigação**:
- Usar modelo `text-embedding-3-small` (mais barato)
- Processamento em lote
- Cache de embeddings

### Risco 3: Qualidade de Conversão

**Risco**: PDF/DOCX mal formatados

**Mitigação**:
- Múltiplas bibliotecas (fallback)
- Validação pós-conversão
- Opção de edição manual

---

## 📝 Próximos Passos

1. **Revisar e aprovar** este plano
2. **Criar branch** `feature/vectorization-migration`
3. **Iniciar Fase 1**: Configuração de pgvector
4. **Seguir cronograma** fase por fase

---

**Última atualização**: 2025-01-17

