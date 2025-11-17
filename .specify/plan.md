# Plano de Desenvolvimento - ndocs

**Versão**: 1.0  
**Data**: 2025-01-17  
**Status**: Em Planejamento

## Objetivo

Transformar o **ndocs** em uma plataforma SaaS completa de documentação inteligente, com processo de onboarding estruturado, ingestão de documentos multi-formato, vetorização/RAG e templates baseados no Pinexio.

## Fases de Desenvolvimento

### Fase 1: Onboarding Completo 🔴 Alta Prioridade

**Objetivo**: Implementar fluxo completo de onboarding onde superadmin cria organizações e administradores recebem convites.

#### Tarefas

1. **Refatorar Criação de Organização**
   - [ ] Remover criação automática de organização no signup
   - [ ] Criar endpoint `/api/organization/create` (apenas superadmin)
   - [ ] Formulário na página `/admin` para criar organização
   - [ ] Campo para email do administrador

2. **Sistema de Convites**
   - [ ] Criar tabela `organization_invites` no Supabase
   - [ ] Endpoint para enviar convite por email
   - [ ] Template de email de convite
   - [ ] Página de aceite de convite (`/invite/accept?token=...`)
   - [ ] Validação de token e criação de `organization_member`

3. **Wizard de Onboarding para Administrador**
   - [ ] Página `/onboarding` com steps:
     - [ ] Step 1: Configurar IA (provedor, temas)
     - [ ] Step 2: Convidar primeiros membros
     - [ ] Step 3: Fazer primeira ingestão de documentos
   - [ ] Persistência de progresso
   - [ ] Navegação entre steps

**Estimativa**: 2-3 semanas

---

### Fase 2: Ingestão de Documentos 🔴 Alta Prioridade

**Objetivo**: Permitir upload e conversão automática de PDF, DOCX e outros formatos para Markdown.

#### Tarefas

1. **Sistema de Upload**
   - [ ] Componente de upload (drag & drop)
   - [ ] Validação de tipos de arquivo (PDF, DOCX, TXT, MD)
   - [ ] Armazenamento no Supabase Storage
   - [ ] Endpoint `/api/ingest/upload`

2. **Conversão de Documentos**
   - [ ] **PDF → Markdown**:
     - [ ] Instalar `pdf-parse` ou `pdfjs-dist`
     - [ ] Extrair texto e estrutura
     - [ ] Converter para Markdown
   - [ ] **DOCX → Markdown**:
     - [ ] Instalar `mammoth` ou `docx`
     - [ ] Extrair texto e formatação
     - [ ] Converter para Markdown
   - [ ] **TXT → Markdown**: Conversão simples
   - [ ] **MD → Markdown**: Validação e sanitização

3. **Aplicação de Templates**
   - [ ] Analisar projeto Pinexio original
   - [ ] Criar templates por tipo de documento
   - [ ] Aplicar template durante conversão
   - [ ] Extrair metadados (título, autor, data)

4. **Processamento Assíncrono**
   - [ ] Queue system (Supabase Edge Functions ou Vercel Queue)
   - [ ] Status de processamento (pending, processing, completed, failed)
   - [ ] Notificações de conclusão
   - [ ] Retry logic para falhas

**Estimativa**: 3-4 semanas

---

### Fase 3: Vetorização e RAG 🔴 Alta Prioridade

**Objetivo**: Implementar sistema de vetorização e busca semântica para documentos.

#### Tarefas

1. **Configuração de pgvector**
   - [ ] Habilitar extensão `pgvector` no Supabase
   - [ ] Criar tabela `document_chunks`
   - [ ] Criar tabela `document_embeddings`
   - [ ] Criar índices vetoriais

2. **Pipeline de Vetorização**
   - [ ] Chunking de documentos (dividir em pedaços)
   - [ ] Geração de embeddings (OpenAI `text-embedding-3-small`)
   - [ ] Armazenamento de embeddings
   - [ ] Processamento em background

3. **Sistema de Busca Semântica**
   - [ ] Endpoint `/api/search/semantic`
   - [ ] Busca por similaridade (cosine similarity)
   - [ ] Ranking de resultados
   - [ ] Filtros por organização

4. **Integração RAG com IA**
   - [ ] Retrieval de chunks relevantes
   - [ ] Context injection para IA
   - [ ] Geração de respostas baseadas em documentos
   - [ ] Citações e referências

**Estimativa**: 3-4 semanas

---

### Fase 4: Templates Pinexio 🟡 Média Prioridade

**Objetivo**: Implementar templates baseados no projeto Pinexio original.

#### Tarefas

1. **Análise do Pinexio**
   - [ ] Localizar projeto Pinexio original
   - [ ] Analisar estrutura de documentos
   - [ ] Identificar padrões de formatação
   - [ ] Extrair templates

2. **Sistema de Templates**
   - [ ] Criar tabela `document_templates`
   - [ ] Templates por tipo de documento
   - [ ] Aplicação automática na conversão
   - [ ] Customização por organização

3. **Editor de Templates**
   - [ ] Interface para criar/editar templates
   - [ ] Preview de templates
   - [ ] Variáveis e placeholders

**Estimativa**: 2 semanas

---

## Dependências entre Fases

```
Fase 1 (Onboarding)
    ↓
Fase 2 (Ingestão) ──→ Fase 3 (RAG)
    ↓                      ↓
Fase 4 (Templates) ────────┘
```

## Riscos e Mitigações

### Risco 1: Complexidade da Conversão PDF/DOCX
- **Mitigação**: Usar bibliotecas maduras (`pdf-parse`, `mammoth`)
- **Fallback**: Permitir upload manual de Markdown

### Risco 2: Performance de Vetorização
- **Mitigação**: Processamento assíncrono, cache de embeddings
- **Otimização**: Chunking inteligente, índices vetoriais

### Risco 3: Custo de Embeddings
- **Mitigação**: Usar modelo `text-embedding-3-small` (mais barato)
- **Otimização**: Cache de embeddings, processamento em lote

## Métricas de Sucesso

### Fase 1
- ✅ Superadmin pode criar organizações
- ✅ Administradores recebem convites por email
- ✅ Wizard de onboarding completo

### Fase 2
- ✅ Upload de PDF/DOCX funcional
- ✅ Conversão automática para Markdown
- ✅ Templates aplicados corretamente

### Fase 3
- ✅ Documentos vetorizados automaticamente
- ✅ Busca semântica funcional
- ✅ RAG integrado com IA

### Fase 4
- ✅ Templates Pinexio implementados
- ✅ Aplicação automática na conversão

## Próximos Passos Imediatos

1. **Semana 1-2**: Fase 1 - Onboarding Completo
2. **Semana 3-6**: Fase 2 - Ingestão de Documentos
3. **Semana 7-10**: Fase 3 - Vetorização e RAG
4. **Semana 11-12**: Fase 4 - Templates Pinexio

## Recursos Necessários

- **Desenvolvimento**: 1 desenvolvedor full-time
- **Infraestrutura**: Supabase (já configurado), Vercel (já configurado)
- **APIs Externas**: OpenAI (embeddings e geração), Supabase (banco e storage)

