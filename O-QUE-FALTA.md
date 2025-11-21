# 📋 O Que Falta no Projeto - ndocs

**Data**: 2025-01-19  
**Status Atual**: ~70% completo

---

## 🎯 Resumo Executivo

### ✅ O que JÁ ESTÁ IMPLEMENTADO:

1. **Estrutura Base** ✅
   - Multi-tenancy (organizations, members)
   - Autenticação e autorização (RLS)
   - Layout /app com Dashboard e gestão
   - Layout /docs para documentação

2. **Documentos** ✅
   - Criação manual de MDX
   - Editor MDX com preview
   - Upload de arquivos (PDF, DOCX, etc.)
   - Conversão básica para Markdown
   - Listagem e edição de documentos

3. **Vetorização** ✅
   - Pipeline completo (chunking → embeddings → armazenamento)
   - Integração com OpenAI
   - Processamento assíncrono
   - Status de processamento em tempo real

4. **Busca Semântica** ✅
   - API de busca semântica
   - Integração com pgvector
   - Filtros por organização e tipo

5. **RAG** ✅
   - Sistema RAG básico
   - Geração de respostas com contexto
   - Citações de documentos

---

## ❌ O QUE FALTA (Priorizado)

### 🔴 **PRIORIDADE ALTA - Funcionalidades Críticas**

#### 1. **Criação de Documentos com IA** (Em breve)
- **Status**: Tab desabilitada em `/app/documents/new`
- **O que falta**:
  - [ ] Interface para criação com IA
  - [ ] Integração com OpenAI/Anthropic para gerar conteúdo
  - [ ] Templates pré-definidos para IA
  - [ ] Preview e edição do conteúdo gerado

**Arquivos afetados**:
- `src/app/app/documents/new/page.tsx` (tab "ai" está disabled)
- Criar: `src/components/ai-document-generator.tsx`

---

#### 2. **Conversores de Documentos Incompletos**
- **Status**: Alguns conversores têm TODOs
- **O que falta**:
  - [ ] Melhorar conversor RTF (atualmente básico)
  - [ ] Implementar conversor ODT completo
  - [ ] Melhorar conversor PPTX (parcialmente implementado)
  - [ ] Validação e sanitização de Markdown após conversão

**Arquivos afetados**:
- `src/lib/processing/convert-document.ts` (linhas 141, 180, 205)

---

#### 3. **Sistema de Templates do Banco de Dados**
- **Status**: Templates existem mas não são buscados do banco
- **O que falta**:
  - [ ] Buscar templates do banco ao invés de hardcoded
  - [ ] Aplicação automática de templates durante conversão
  - [ ] Interface para gerenciar templates (CRUD)

**Arquivos afetados**:
- `src/lib/processing/apply-template.ts` (linha 24: TODO)
- `src/app/app/settings/page.tsx` (adicionar seção de templates)

---

#### 4. **Processamento Automático Após Upload**
- **Status**: Upload funciona, mas vetorização é manual
- **O que falta**:
  - [ ] Trigger automático de vetorização após upload
  - [ ] Queue/worker para processamento em background
  - [ ] Retry automático para jobs falhados
  - [ ] Notificações de conclusão

**Arquivos afetados**:
- `src/app/api/ingest/upload/route.ts`
- Criar: `src/lib/processing/queue.ts` (ou usar Supabase Edge Functions)

---

#### 5. **Interface de Monitoramento de Jobs**
- **Status**: Jobs existem mas não há interface visual
- **O que falta**:
  - [ ] Dashboard de jobs em processamento
  - [ ] Lista de jobs falhados com opção de retry
  - [ ] Estatísticas de processamento
  - [ ] Logs de processamento

**Arquivos afetados**:
- Criar: `src/app/app/processing/page.tsx`
- Criar: `src/components/processing-dashboard.tsx`

---

### 🟡 **PRIORIDADE MÉDIA - Melhorias e Features**

#### 6. **Onboarding Completo**
- **Status**: Onboarding básico existe, mas não segue fluxo ideal
- **O que falta**:
  - [ ] Superadmin cria organização e convida admin
  - [ ] Sistema de convites por email
  - [ ] Wizard de onboarding para admin (configurar IA, convidar membros, primeira ingestão)
  - [ ] Página de aceite de convite

**Arquivos afetados**:
- `src/app/onboarding/page.tsx` (refatorar)
- Criar: `src/app/invite/[token]/page.tsx`
- Criar: `src/app/api/invites/route.ts`

---

#### 7. **Busca Semântica na Interface**
- **Status**: API existe, mas não está integrada na UI
- **O que falta**:
  - [ ] Integrar busca semântica no SearchDialog
  - [ ] Toggle entre busca tradicional e semântica
  - [ ] Highlight de resultados
  - [ ] Filtros visuais (tipo, data, organização)

**Arquivos afetados**:
- `src/components/semantic-search-dialog.tsx` (já existe, melhorar)
- `src/components/search-dialog.tsx` (integrar busca semântica)

---

#### 8. **RAG na Interface**
- **Status**: RAG funciona via API, mas sem interface
- **O que falta**:
  - [ ] Interface de chat para RAG
  - [ ] Exibição de citações e fontes
  - [ ] Histórico de conversas
  - [ ] Exportar conversas

**Arquivos afetados**:
- Criar: `src/app/app/chat/page.tsx`
- Criar: `src/components/rag-chat.tsx`

---

#### 9. **Gerenciamento de Templates**
- **Status**: Templates existem mas não há interface de gestão
- **O que falta**:
  - [ ] CRUD completo de templates
  - [ ] Preview de templates
  - [ ] Aplicação manual de templates
  - [ ] Templates por tipo de documento

**Arquivos afetados**:
- `src/app/app/settings/page.tsx` (adicionar seção)
- Criar: `src/components/template-manager.tsx`

---

#### 10. **Estatísticas e Analytics**
- **Status**: Dados existem mas não há dashboard
- **O que falta**:
  - [ ] Dashboard com métricas (documentos, processamento, uso)
  - [ ] Gráficos de uso ao longo do tempo
  - [ ] Relatórios de processamento
  - [ ] Exportação de dados

**Arquivos afetados**:
- `src/app/app/page.tsx` (melhorar dashboard)
- Criar: `src/components/analytics-dashboard.tsx`

---

### 🔵 **PRIORIDADE BAIXA - Polimento e Otimizações**

#### 11. **Testes**
- **Status**: Alguns testes existem, mas cobertura incompleta
- **O que falta**:
  - [ ] Testes unitários para conversores
  - [ ] Testes de integração para pipeline de vetorização
  - [ ] Testes E2E para fluxos principais
  - [ ] Testes de performance para busca semântica

**Arquivos afetados**:
- Criar: `src/test/converters/`
- Criar: `src/test/integration/vectorization.test.ts`
- Criar: `src/test/e2e/`

---

#### 12. **Documentação**
- **Status**: Documentação básica existe
- **O que falta**:
  - [ ] Documentação de API completa
  - [ ] Guia de desenvolvimento
  - [ ] Guia de deployment
  - [ ] Documentação de arquitetura

**Arquivos afetados**:
- Criar: `docs/api/`
- Criar: `docs/development/`
- Criar: `docs/architecture.md`

---

#### 13. **Performance e Otimizações**
- **Status**: Funcional mas pode melhorar
- **O que falta**:
  - [ ] Cache de embeddings
  - [ ] Otimização de queries de busca
  - [ ] Lazy loading de componentes
  - [ ] Compressão de assets

**Arquivos afetados**:
- `src/lib/vectorization/` (adicionar cache)
- `src/lib/search/` (otimizar queries)

---

#### 14. **Tratamento de Erros**
- **Status**: Básico implementado
- **O que falta**:
  - [ ] Logs estruturados
  - [ ] Sentry ou similar para monitoramento
  - [ ] Páginas de erro customizadas
  - [ ] Retry automático com backoff

**Arquivos afetados**:
- `src/lib/logger.ts` (melhorar)
- Criar: `src/app/error.tsx`
- Criar: `src/app/not-found.tsx`

---

#### 15. **Acessibilidade (a11y)**
- **Status**: Não verificado
- **O que falta**:
  - [ ] Audit de acessibilidade
  - [ ] Suporte a leitores de tela
  - [ ] Navegação por teclado
  - [ ] Contraste de cores adequado

---

#### 16. **Internacionalização (i18n)**
- **Status**: Apenas português
- **O que falta**:
  - [ ] Sistema de tradução
  - [ ] Suporte a múltiplos idiomas
  - [ ] Seleção de idioma na interface

---

## 📊 Resumo por Categoria

| Categoria | Total | Implementado | Faltando | % Completo |
|-----------|-------|--------------|----------|------------|
| **Estrutura Base** | 5 | 5 | 0 | 100% ✅ |
| **Documentos** | 8 | 6 | 2 | 75% |
| **Vetorização** | 6 | 5 | 1 | 83% |
| **Busca e RAG** | 4 | 2 | 2 | 50% |
| **Interface** | 10 | 6 | 4 | 60% |
| **Infraestrutura** | 5 | 3 | 2 | 60% |
| **Qualidade** | 4 | 1 | 3 | 25% |
| **TOTAL** | **42** | **28** | **14** | **67%** |

---

## 🚀 Próximos Passos Recomendados (Ordem)

### Sprint 1 (1-2 semanas)
1. ✅ Criação de documentos com IA
2. ✅ Processamento automático após upload
3. ✅ Interface de monitoramento de jobs

### Sprint 2 (1-2 semanas)
4. ✅ Busca semântica na interface
5. ✅ RAG na interface (chat)
6. ✅ Gerenciamento de templates

### Sprint 3 (1 semana)
7. ✅ Completar conversores (ODT, PPTX, RTF)
8. ✅ Sistema de templates do banco
9. ✅ Onboarding completo

### Sprint 4 (1 semana)
10. ✅ Estatísticas e analytics
11. ✅ Testes (cobertura mínima)
12. ✅ Documentação

---

## 📝 Notas Importantes

### Dependências Externas
- ✅ OpenAI API Key: Configurada
- ✅ Supabase: Configurado
- ✅ Vercel: Configurado
- ⚠️ Email service: Necessário para convites (SendGrid, Resend, etc.)

### Decisões Técnicas Pendentes
- [ ] Escolher sistema de queue (Supabase Edge Functions vs. Redis/BullMQ)
- [ ] Definir estratégia de cache (Redis vs. in-memory)
- [ ] Escolher serviço de email para convites
- [ ] Definir limites de rate limiting

### Riscos
- ⚠️ **Custo de OpenAI**: Monitorar uso de embeddings
- ⚠️ **Performance**: Busca semântica pode ser lenta com muitos documentos
- ⚠️ **Escalabilidade**: Processamento em background precisa de queue robusta

---

**Última atualização**: 2025-01-19

