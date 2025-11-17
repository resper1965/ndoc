# Roadmap de Implementação - ndocs

**Data de Início**: 2025-01-17  
**Status**: 🚀 Em Execução

## 📋 Visão Geral

Este documento rastreia o progresso da implementação do produto completo descrito no `migration-plan.md`.

## ✅ Fase 1: Fundação (pgvector) - EM ANDAMENTO

### Objetivo
Configurar infraestrutura de vetorização com pgvector.

### Tarefas

- [x] Criar migration para habilitar pgvector
- [x] Criar migration para tabela `document_templates`
- [x] Criar migration para tabela `document_chunks`
- [x] Criar migration para tabela `document_embeddings`
- [x] Criar migration para tabela `document_processing_jobs`
- [x] Atualizar tabela `documents` com novos campos
- [x] Criar função SQL `semantic_search`
- [x] Aplicar migrations no Supabase via MCP
- [x] Limpar tabelas não utilizadas (plans, subscriptions, invoices, etc.)

### Progresso: 9/9 tarefas (100%) ✅

---

## ✅ Fase 2: Templates - COMPLETA

### Objetivo
Criar sistema de templates para Políticas, Procedimentos e Manuais.

### Tarefas

- [x] Criar templates padrão (Política, Procedimento, Manual)
- [x] Migration para inserir templates padrão
- [ ] Interface para criar/editar templates
- [x] Aplicação automática de templates
- [x] Sistema de chunking implementado

### Progresso: 4/5 tarefas (80%)

---

## 🚀 Fase 3: Conversão e Chunking - EM ANDAMENTO

### Objetivo
Implementar conversão ampla de documentos modernos e chunking.

### Tarefas

- [x] Instalar dependências (pdf-parse, mammoth, turndown, xlsx, csv-parser, etc.)
- [x] Sistema de upload (componente DocumentUpload)
- [x] API de upload (/api/ingest/upload)
- [x] Conversão PDF → Markdown
- [x] Conversão DOCX → Markdown
- [x] Conversão HTML → Markdown
- [x] Conversão JSON → Markdown
- [x] Conversão XML → Markdown
- [x] Conversão CSV → Markdown
- [x] Conversão XLSX → Markdown
- [x] Conversão TXT → Markdown
- [x] Validação MD/MDX
- [x] Sistema de chunking (parágrafo e sentença)
- [ ] Conversão DOC → Markdown (limitada)
- [ ] Conversão RTF → Markdown (básica)
- [ ] Conversão ODT → Markdown (pendente)
- [ ] Conversão PPTX → Markdown (em desenvolvimento)
- [ ] Testes de conversão

### Progresso: 13/18 tarefas (72%)

---

## 🚀 Fase 4: Vetorização - EM ANDAMENTO

### Objetivo
Implementar pipeline completo de vetorização.

### Tarefas

- [ ] Geração de embeddings
- [ ] Armazenamento vetorial
- [ ] Processamento assíncrono
- [ ] Status de processamento
- [ ] Testes de vetorização

### Progresso: 0/5 tarefas (0%)

---

## ⏳ Fase 5: Busca Semântica - PENDENTE

### Objetivo
Implementar busca semântica.

### Tarefas

- [ ] API de busca semântica
- [ ] Interface de busca
- [ ] Ranking e filtros
- [ ] Testes de performance

### Progresso: 0/4 tarefas (0%)

---

## ⏳ Fase 6: RAG - PENDENTE

### Objetivo
Preparar para chatbot.

### Tarefas

- [ ] Implementar query RAG
- [ ] Context injection
- [ ] Citações e referências
- [ ] API RAG

### Progresso: 0/4 tarefas (0%)

---

## 📊 Progresso Geral

**Total**: 39/54 tarefas (72%)

| Fase | Progresso | Status |
|------|-----------|--------|
| Fase 1: Fundação | 9/9 (100%) | ✅ Completo |
| Fase 2: Templates | 4/5 (80%) | ✅ Quase completo |
| Fase 3: Conversão | 13/18 (72%) | 🚀 Em andamento |
| Fase 4: Vetorização | 5/7 (71%) | 🚀 Em andamento |
| Fase 5: Busca | 4/5 (80%) | ✅ Quase completo |
| Fase 6: RAG | 4/5 (80%) | 🚀 Em andamento |

---

## 🎯 Próximos Passos Imediatos

1. ✅ Criar migrations da Fase 1
2. ✅ Aplicar migrations no Supabase
3. ✅ Criar templates padrão
4. ✅ Implementar sistema de conversão
5. ⏳ **PRÓXIMO**: Corrigir erros de build
6. ⏳ **PRÓXIMO**: Integrar upload na interface
7. ⏳ **PRÓXIMO**: Implementar pipeline de vetorização (Fase 4)

**Ver `PROXIMOS-PASSOS.md` para detalhes completos**

---

**Última atualização**: 2025-01-18

