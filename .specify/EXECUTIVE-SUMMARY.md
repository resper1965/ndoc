# Resumo Executivo - Projeto de Migração ndocs

**Data**: 2025-01-17  
**Versão**: 1.0

## 🎯 Objetivo

Transformar o **ndocs** em uma plataforma SaaS completa com:
- ✅ **Vetorização** de documentos (Supabase Vector/pgvector)
- ✅ **Busca semântica** para políticas, procedimentos e manuais
- ✅ **RAG** preparado para chatbot futuro
- ✅ **Templates estruturados** (Políticas, Procedimentos, Manuais)
- ✅ **Ingestão automática** (PDF/DOCX → Markdown)

## 📊 Decisões Técnicas

### Stack Escolhido

| Componente | Tecnologia | Justificativa |
|------------|------------|---------------|
| **Vetorização** | Supabase Vector (pgvector) | ✅ Já integrado, sem infra adicional |
| **Embeddings** | OpenAI `text-embedding-3-small` | ✅ Custo baixo ($0.02/1M tokens) |
| **Chunking** | Por parágrafo/sentença | ✅ Melhor para documentos estruturados |
| **Templates** | MDX com frontmatter | ✅ Compatível com Pinexio |

### Templates Definidos

1. **Política**: Estrutura para políticas organizacionais
2. **Procedimento**: Passo a passo para processos
3. **Manual**: Documentação completa e estruturada

## 📅 Cronograma

| Fase | Duração | Entregável |
|------|---------|------------|
| **Fase 1: Fundação** | 2 semanas | pgvector configurado |
| **Fase 2: Templates** | 2 semanas | 3 templates implementados |
| **Fase 3: Conversão** | 3 semanas | PDF/DOCX → Markdown |
| **Fase 4: Vetorização** | 3 semanas | Pipeline completo |
| **Fase 5: Busca** | 2 semanas | Busca semântica |
| **Fase 6: RAG** | 2 semanas | Preparação para chatbot |
| **TOTAL** | **14 semanas** | **Sistema completo** |

## 💰 Estimativa de Custos

### Infraestrutura (Mensal)

- **Supabase**: Já incluído (free tier suficiente)
- **OpenAI Embeddings**: ~$0.10 por 1000 documentos
- **Storage**: ~$5/mês para 10k documentos
- **Total**: **< $10/mês** para 10k documentos

### Desenvolvimento

- **1 desenvolvedor full-time**: 14 semanas
- **Estimativa**: 560 horas (14 semanas × 40h)

## 📈 Métricas de Sucesso

| Métrica | Meta | Status |
|---------|------|--------|
| **Performance de busca** | <100ms | ⏳ A implementar |
| **Precisão de busca** | >80% | ⏳ A implementar |
| **Taxa de conversão** | >95% | ⏳ A implementar |
| **Custo por documento** | <$0.01 | ⏳ A implementar |

## 🎯 Casos de Uso

### 1. Busca de Políticas
**Exemplo**: "Qual a política de férias?"

**Fluxo**:
1. Query → Embedding
2. Busca semântica no pgvector
3. Retorna políticas relevantes
4. (Futuro) Chatbot responde com citações

### 2. Consulta de Procedimentos
**Exemplo**: "Como fazer solicitação de reembolso?"

**Fluxo**:
1. Busca semântica em procedimentos
2. Retorna passo a passo relevante
3. Links para documentos completos

### 3. Referência de Manuais
**Exemplo**: "Onde está o manual de onboarding?"

**Fluxo**:
1. Busca por tipo "manual"
2. Filtro por categoria
3. Retorna manual completo

## 🚨 Riscos Principais

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Performance de busca | Média | Alto | Índices HNSW, cache |
| Custo de embeddings | Baixa | Médio | Modelo barato, batch processing |
| Qualidade de conversão | Média | Médio | Múltiplas bibliotecas, validação |

## ✅ Próximos Passos Imediatos

1. **Aprovar plano de migração** (`migration-plan.md`)
2. **Criar branch** `feature/vectorization-migration`
3. **Iniciar Fase 1**: Configuração de pgvector
4. **Setup de desenvolvimento**: Instalar dependências

## 📚 Documentação

- **Plano Completo**: `.specify/migration-plan.md`
- **Plano Geral**: `.specify/plan.md`
- **Tarefas**: `.specify/tasks.md`
- **Estado Atual**: `.specify/current.md`

---

**Status**: ✅ Plano aprovado e pronto para execução

