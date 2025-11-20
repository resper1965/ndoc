# Planejamento de Desenvolvimento - Melhorias de Ingestão e Transformação

**Data de Criação:** 2025-01-21  
**Versão:** 1.0  
**Baseado em:** AUDITORIA-INGESTAO-TRANSFORMACAO.md

---

## 1. Visão Geral

Este documento detalha o planejamento de desenvolvimento para implementar as melhorias identificadas na auditoria do processo de ingestão e transformação de documentos.

### 1.1 Objetivos
- Melhorar confiabilidade do sistema de ingestão
- Corrigir problemas críticos de segurança
- Otimizar performance do processamento
- Adicionar monitoramento e observabilidade

### 1.2 Escopo
- 18 recomendações priorizadas
- 4 fases de desenvolvimento
- Estimativa total: ~12-16 semanas (1 desenvolvedor full-time)

---

## 2. Fases de Desenvolvimento

### Fase 1: Fundação e Correções Críticas (3-4 semanas)
**Objetivo:** Corrigir problemas críticos que afetam confiabilidade e segurança

### Fase 2: Robustez e Validações (2-3 semanas)
**Objetivo:** Adicionar validações e melhorar tratamento de erros

### Fase 3: Performance e Otimizações (2-3 semanas)
**Objetivo:** Otimizar processamento e adicionar cache

### Fase 4: Monitoramento e Melhorias (2-3 semanas)
**Objetivo:** Adicionar observabilidade e melhorias de UX

---

## 3. Detalhamento de Tarefas

### FASE 1: Fundação e Correções Críticas

#### T1.1: Implementar Fila de Jobs Persistente
**Prioridade:** 🔴 CRÍTICA  
**Estimativa:** 5-7 dias  
**Complexidade:** Alta

**Descrição:**
Implementar sistema de fila de jobs persistente para garantir que processamentos não sejam perdidos em caso de reinicialização do servidor.

**Opções de Implementação:**
1. **BullMQ com Redis** (Recomendado)
   - Pros: Muito robusto, retry automático, prioridades
   - Contras: Requer Redis adicional
   - Esforço: Médio-Alto

2. **Supabase Edge Functions + pg_cron**
   - Pros: Integrado com Supabase, sem infraestrutura adicional
   - Contras: Menos flexível, pode ter limites
   - Esforço: Médio

3. **Supabase Realtime + Database Triggers**
   - Pros: Totalmente integrado
   - Contras: Menos robusto que BullMQ
   - Esforço: Baixo-Médio

**Decisão:** Usar BullMQ com Redis (mais robusto para produção)

**Tarefas:**
- [ ] Configurar Redis (Upstash ou local)
- [ ] Instalar e configurar BullMQ
- [ ] Criar worker para processamento de documentos
- [ ] Migrar `processDocumentAsync` para fila
- [ ] Adicionar retry automático com exponential backoff
- [ ] Implementar prioridades de jobs
- [ ] Adicionar dashboard de monitoramento (opcional)
- [ ] Testes de integração

**Critérios de Aceite:**
- Jobs persistem após reinicialização do servidor
- Retry automático para falhas transitórias
- Jobs podem ser reprocessados manualmente
- Métricas de jobs (pendentes, processando, falhados)

**Dependências:** Nenhuma

**Arquivos Afetados:**
- `src/app/api/ingest/upload/route.ts`
- `src/lib/vectorization/process-document.ts`
- Novo: `src/lib/queue/job-processor.ts`
- Novo: `src/lib/queue/document-queue.ts`

---

#### T1.2: Corrigir Descriptografia de API Keys
**Prioridade:** 🔴 CRÍTICA  
**Estimativa:** 2-3 dias  
**Complexidade:** Média

**Descrição:**
Implementar descriptografia de API keys antes de usar na geração de embeddings.

**Tarefas:**
- [ ] Verificar como as API keys são criptografadas (se houver)
- [ ] Implementar função de descriptografia
- [ ] Atualizar `getOpenAIKey` em `generate-embeddings.ts`
- [ ] Adicionar validação de API key antes de usar
- [ ] Testes unitários para descriptografia
- [ ] Testes de integração com API real

**Critérios de Aceite:**
- API keys descriptografadas corretamente
- Validação de chave antes de processar
- Erro claro se chave inválida
- Logs não expõem chaves completas

**Dependências:** Nenhuma

**Arquivos Afetados:**
- `src/lib/vectorization/generate-embeddings.ts`
- Novo: `src/lib/encryption/decrypt.ts` (se necessário)

---

#### T1.3: Validação de Tipo de Arquivo Real
**Prioridade:** 🔴 CRÍTICA  
**Estimativa:** 2-3 dias  
**Complexidade:** Baixa-Média

**Descrição:**
Validar tipo real do arquivo usando MIME type detection, não apenas extensão.

**Tarefas:**
- [ ] Instalar biblioteca `file-type` ou similar
- [ ] Criar função de validação de tipo real
- [ ] Atualizar `convert-document.ts` para validar antes de converter
- [ ] Adicionar whitelist de tipos permitidos
- [ ] Rejeitar arquivos com extensão falsa
- [ ] Testes com arquivos maliciosos (extensão falsa)

**Critérios de Aceite:**
- Validação de MIME type real do arquivo
- Rejeição de arquivos com extensão falsa
- Mensagem de erro clara para usuário
- Whitelist configurável

**Dependências:** Nenhuma

**Arquivos Afetados:**
- `src/lib/processing/convert-document.ts`
- `src/app/api/ingest/upload/route.ts`
- Novo: `src/lib/validation/file-type-validator.ts`

---

#### T1.4: Validação de Conteúdo Após Conversão
**Prioridade:** 🔴 CRÍTICA  
**Estimativa:** 1-2 dias  
**Complexidade:** Baixa

**Descrição:**
Validar se a conversão gerou conteúdo válido antes de armazenar.

**Tarefas:**
- [ ] Criar função de validação de conteúdo
- [ ] Validar tamanho mínimo de conteúdo
- [ ] Validar se conteúdo não é apenas espaços/caracteres especiais
- [ ] Rejeitar documentos vazios ou muito pequenos
- [ ] Adicionar validação em `upload/route.ts`
- [ ] Testes com arquivos que geram conteúdo vazio

**Critérios de Aceite:**
- Rejeição de documentos vazios
- Rejeição de documentos muito pequenos (< 10 caracteres)
- Mensagem de erro clara
- Log de tentativas de conversão inválida

**Dependências:** T1.3

**Arquivos Afetados:**
- `src/app/api/ingest/upload/route.ts`
- Novo: `src/lib/validation/content-validator.ts`

---

### FASE 2: Robustez e Validações

#### T2.1: Melhorar Conversão de DOC
**Prioridade:** 🟠 ALTA  
**Estimativa:** 3-4 dias  
**Complexidade:** Média-Alta

**Descrição:**
Implementar conversão adequada de arquivos .DOC usando biblioteca especializada.

**Opções:**
1. **LibreOffice via CLI** (Recomendado)
   - Converter DOC → DOCX → Markdown
   - Pros: Muito robusto, suporta todos os formatos
   - Contras: Requer LibreOffice instalado

2. **textract (Node.js)**
   - Pros: Fácil de usar
   - Contras: Pode ter limitações

3. **Conversão via API externa**
   - Pros: Sem dependências locais
   - Contras: Custo, latência

**Decisão:** Usar LibreOffice via CLI (mais robusto)

**Tarefas:**
- [ ] Instalar/configurar LibreOffice
- [ ] Criar função de conversão DOC → DOCX
- [ ] Atualizar `convertDOCToMarkdown` para usar conversão
- [ ] Adicionar fallback se LibreOffice não disponível
- [ ] Testes com vários arquivos DOC
- [ ] Documentar requisitos de sistema

**Critérios de Aceite:**
- Conversão de DOC funcional
- Preservação de formatação básica
- Fallback se LibreOffice não disponível
- Documentação de requisitos

**Dependências:** Nenhuma

**Arquivos Afetados:**
- `src/lib/processing/convert-document.ts`
- Novo: `src/lib/processing/libreoffice-converter.ts`

---

#### T2.2: Implementar Retry para Jobs Falhados
**Prioridade:** 🟠 ALTA  
**Estimativa:** 2-3 dias  
**Complexidade:** Média

**Descrição:**
Permitir reprocessamento manual e automático de jobs falhados.

**Tarefas:**
- [ ] Adicionar endpoint para reprocessar job
- [ ] Implementar retry automático com limite de tentativas
- [ ] Adicionar UI para reprocessar jobs falhados
- [ ] Adicionar contador de tentativas
- [ ] Implementar backoff exponencial
- [ ] Testes de retry

**Critérios de Aceite:**
- Reprocessamento manual via API/UI
- Retry automático com limite (ex: 3 tentativas)
- Backoff exponencial entre tentativas
- Histórico de tentativas

**Dependências:** T1.1 (Fila de Jobs)

**Arquivos Afetados:**
- `src/app/api/process/document/[id]/route.ts`
- `src/app/app/processing/page.tsx`
- `src/lib/queue/document-queue.ts`

---

#### T2.3: Usar Service Role para Processamento
**Prioridade:** 🟠 ALTA  
**Estimativa:** 1-2 dias  
**Complexidade:** Baixa

**Descrição:**
Garantir que todo processamento use service_role para evitar falhas por RLS.

**Tarefas:**
- [ ] Revisar todas as queries em `process-document.ts`
- [ ] Substituir `createClient()` por `createServiceRoleClient()`
- [ ] Garantir que busca de documento use service_role
- [ ] Testes de processamento com RLS ativo
- [ ] Documentar uso de service_role

**Critérios de Aceite:**
- Todas as queries de processamento usam service_role
- Processamento funciona mesmo com RLS restritivo
- Logs indicam uso de service_role

**Dependências:** Nenhuma

**Arquivos Afetados:**
- `src/lib/vectorization/process-document.ts`
- `src/lib/vectorization/store-embeddings.ts`

---

#### T2.4: Melhorar Estimativa de Tokens
**Prioridade:** 🟠 ALTA  
**Estimativa:** 2-3 dias  
**Complexidade:** Média

**Descrição:**
Usar tiktoken para estimativa precisa de tokens em vez de aproximação.

**Tarefas:**
- [ ] Instalar `tiktoken`
- [ ] Atualizar `estimateTokens` para usar tiktoken
- [ ] Configurar modelo correto (text-embedding-3-small)
- [ ] Adicionar cache de estimativas
- [ ] Manter fallback para aproximação
- [ ] Testes de precisão

**Critérios de Aceite:**
- Estimativa precisa usando tiktoken
- Cache de estimativas para performance
- Fallback se tiktoken falhar
- Testes validam precisão

**Dependências:** Nenhuma

**Arquivos Afetados:**
- `src/lib/vectorization/token-estimator.ts`
- `src/lib/vectorization/chunk-document.ts`

---

#### T2.5: Validação de Duplicatas
**Prioridade:** 🟠 ALTA  
**Estimativa:** 2-3 dias  
**Complexidade:** Média

**Descrição:**
Verificar hash do arquivo antes de processar para evitar duplicatas.

**Tarefas:**
- [ ] Calcular hash do arquivo (SHA-256)
- [ ] Verificar se hash já existe no banco
- [ ] Permitir atualização em vez de duplicação
- [ ] Adicionar coluna `file_hash` na tabela `documents`
- [ ] Criar índice para busca rápida
- [ ] UI para escolher atualizar ou criar novo
- [ ] Testes de duplicatas

**Critérios de Aceite:**
- Detecção de arquivos duplicados
- Opção de atualizar documento existente
- Hash armazenado no banco
- Busca rápida por hash

**Dependências:** Nenhuma

**Arquivos Afetados:**
- `src/app/api/ingest/upload/route.ts`
- `supabase/migrations/YYYYMMDD_add_file_hash.sql`
- `src/app/app/documents/new/page.tsx`

---

### FASE 3: Performance e Otimizações

#### T3.1: Buscar Templates do Banco de Dados
**Prioridade:** 🟡 MÉDIA  
**Estimativa:** 2-3 dias  
**Complexidade:** Média

**Descrição:**
Implementar busca de templates da tabela `document_templates` em vez de usar apenas templates padrão.

**Tarefas:**
- [ ] Criar função para buscar template do banco
- [ ] Atualizar `apply-template.ts` para buscar do banco
- [ ] Manter fallback para templates padrão
- [ ] Adicionar cache de templates
- [ ] Testes de busca de templates
- [ ] Documentar criação de templates

**Critérios de Aceite:**
- Templates buscados do banco de dados
- Fallback para templates padrão
- Cache de templates para performance
- Suporte a templates customizados por organização

**Dependências:** Nenhuma

**Arquivos Afetados:**
- `src/lib/processing/apply-template.ts`
- Novo: `src/lib/templates/get-template.ts`

---

#### T3.2: Sanitização de Conteúdo
**Prioridade:** 🟡 MÉDIA  
**Estimativa:** 2-3 dias  
**Complexidade:** Média

**Descrição:**
Sanitizar HTML/Markdown antes de armazenar para prevenir XSS.

**Tarefas:**
- [ ] Instalar DOMPurify (já usado em outros lugares)
- [ ] Criar função de sanitização de Markdown
- [ ] Sanitizar conteúdo após conversão
- [ ] Configurar whitelist de tags permitidas
- [ ] Testes com conteúdo malicioso
- [ ] Documentar tags permitidas

**Critérios de Aceite:**
- Conteúdo sanitizado antes de armazenar
- XSS prevenido
- Formatação válida preservada
- Testes de segurança

**Dependências:** Nenhuma

**Arquivos Afetados:**
- `src/lib/processing/convert-document.ts`
- `src/app/api/ingest/upload/route.ts`
- Novo: `src/lib/security/sanitize-content.ts`

---

#### T3.3: Cache de Conversões
**Prioridade:** 🟡 MÉDIA  
**Estimativa:** 3-4 dias  
**Complexidade:** Média-Alta

**Descrição:**
Cachear resultados de conversão por hash do arquivo para evitar reprocessamento.

**Opções:**
1. **Redis** (Recomendado)
   - Pros: Rápido, distribuído
   - Contras: Requer Redis

2. **Supabase Storage**
   - Pros: Integrado
   - Contras: Mais lento que Redis

3. **Database**
   - Pros: Sem infraestrutura adicional
   - Contras: Mais lento

**Decisão:** Redis (já necessário para BullMQ)

**Tarefas:**
- [ ] Configurar cache Redis
- [ ] Criar função de cache de conversões
- [ ] Cachear por hash do arquivo
- [ ] Implementar TTL (ex: 30 dias)
- [ ] Invalidar cache quando necessário
- [ ] Testes de cache

**Critérios de Aceite:**
- Conversões cacheadas por hash
- TTL configurável
- Invalidação de cache
- Redução de processamento redundante

**Dependências:** T1.1 (Redis já configurado)

**Arquivos Afetados:**
- `src/lib/processing/convert-document.ts`
- Novo: `src/lib/cache/conversion-cache.ts`

---

#### T3.4: Processamento Paralelo de Embeddings
**Prioridade:** 🟡 MÉDIA  
**Estimativa:** 2-3 dias  
**Complexidade:** Média

**Descrição:**
Processar múltiplos batches de embeddings em paralelo (com rate limiting).

**Tarefas:**
- [ ] Implementar processamento paralelo com limite
- [ ] Adicionar rate limiting para evitar exceder limites da API
- [ ] Configurar número máximo de batches paralelos
- [ ] Monitorar uso de API
- [ ] Testes de processamento paralelo
- [ ] Ajustar baseado em métricas

**Critérios de Aceite:**
- Processamento paralelo de batches
- Rate limiting funcional
- Redução de tempo total
- Sem exceder limites da API

**Dependências:** Nenhuma

**Arquivos Afetados:**
- `src/lib/vectorization/generate-embeddings.ts`

---

### FASE 4: Monitoramento e Melhorias

#### T4.1: Monitoramento e Métricas
**Prioridade:** 🟡 MÉDIA  
**Estimativa:** 4-5 dias  
**Complexidade:** Média-Alta

**Descrição:**
Adicionar métricas e monitoramento do processo de ingestão.

**Tarefas:**
- [ ] Definir métricas principais (sucesso, falha, tempo)
- [ ] Implementar coleta de métricas
- [ ] Integrar com sistema de monitoramento (ex: Vercel Analytics, Sentry)
- [ ] Criar dashboard de métricas
- [ ] Implementar alertas
- [ ] Documentar métricas

**Métricas a Implementar:**
- Taxa de sucesso de conversão por formato
- Tempo médio de processamento
- Taxa de falha de embeddings
- Número de jobs pendentes/falhados
- Uso de API (tokens, custo)

**Critérios de Aceite:**
- Métricas coletadas e armazenadas
- Dashboard de métricas
- Alertas configurados
- Documentação de métricas

**Dependências:** T1.1 (Fila de Jobs)

**Arquivos Afetados:**
- Novo: `src/lib/metrics/ingestion-metrics.ts`
- Novo: `src/app/api/metrics/ingestion/route.ts`
- Novo: `src/app/app/metrics/page.tsx`

---

#### T4.2: Progresso em Tempo Real
**Prioridade:** 🟢 BAIXA  
**Estimativa:** 3-4 dias  
**Complexidade:** Média-Alta

**Descrição:**
Adicionar progresso em tempo real durante processamento usando WebSocket ou SSE.

**Tarefas:**
- [ ] Escolher tecnologia (WebSocket ou Server-Sent Events)
- [ ] Implementar endpoint de progresso
- [ ] Atualizar jobs com progresso em tempo real
- [ ] Criar componente de UI para mostrar progresso
- [ ] Testes de progresso em tempo real
- [ ] Documentar uso

**Critérios de Aceite:**
- Progresso atualizado em tempo real
- UI mostra progresso visual
- Funciona mesmo com reconexão
- Testes de performance

**Dependências:** T1.1 (Fila de Jobs)

**Arquivos Afetados:**
- `src/app/app/documents/new/page.tsx`
- Novo: `src/lib/realtime/progress-tracker.ts`
- Novo: `src/app/api/progress/[jobId]/route.ts`

---

#### T4.3: Chunking Semântico
**Prioridade:** 🟢 BAIXA  
**Estimativa:** 5-7 dias  
**Complexidade:** Alta

**Descrição:**
Implementar estratégia de chunking semântico usando embeddings.

**Tarefas:**
- [ ] Pesquisar algoritmos de chunking semântico
- [ ] Implementar algoritmo básico
- [ ] Usar embeddings para dividir por contexto
- [ ] Comparar com chunking por parágrafo
- [ ] Testes de qualidade de chunks
- [ ] Documentar algoritmo

**Critérios de Aceite:**
- Chunking semântico funcional
- Chunks preservam contexto semântico
- Comparável ou melhor que chunking por parágrafo
- Documentação do algoritmo

**Dependências:** T2.4 (Estimativa de Tokens)

**Arquivos Afetados:**
- `src/lib/vectorization/chunk-document.ts`

---

#### T4.4: Validação de Dimensão de Embeddings
**Prioridade:** 🟢 BAIXA  
**Estimativa:** 1 dia  
**Complexidade:** Baixa

**Descrição:**
Validar dimensão de embeddings antes de armazenar.

**Tarefas:**
- [ ] Adicionar validação de dimensão
- [ ] Configurar dimensões por modelo
- [ ] Rejeitar embeddings com dimensão incorreta
- [ ] Testes de validação

**Critérios de Aceite:**
- Validação de dimensão antes de armazenar
- Suporte a múltiplos modelos
- Erro claro se dimensão incorreta

**Dependências:** Nenhuma

**Arquivos Afetados:**
- `src/lib/vectorization/store-embeddings.ts`

---

## 4. Roadmap Temporal

### Semana 1-2: Fase 1 (Fundação)
- T1.1: Fila de Jobs (5-7 dias)
- T1.2: Descriptografia API Keys (2-3 dias)
- T1.3: Validação Tipo Arquivo (2-3 dias)

### Semana 3: Fase 1 (Continuação) + Início Fase 2
- T1.4: Validação Conteúdo (1-2 dias)
- T2.3: Service Role (1-2 dias)
- T2.4: Estimativa Tokens (2-3 dias)

### Semana 4-5: Fase 2 (Robustez)
- T2.1: Conversão DOC (3-4 dias)
- T2.2: Retry Jobs (2-3 dias)
- T2.5: Validação Duplicatas (2-3 dias)

### Semana 6-7: Fase 3 (Performance)
- T3.1: Templates Banco (2-3 dias)
- T3.2: Sanitização (2-3 dias)
- T3.3: Cache Conversões (3-4 dias)

### Semana 8: Fase 3 (Continuação) + Início Fase 4
- T3.4: Processamento Paralelo (2-3 dias)
- T4.4: Validação Dimensão (1 dia)

### Semana 9-10: Fase 4 (Monitoramento)
- T4.1: Monitoramento (4-5 dias)
- T4.2: Progresso Tempo Real (3-4 dias)

### Semana 11-12: Fase 4 (Melhorias) + Buffer
- T4.3: Chunking Semântico (5-7 dias)
- Buffer para imprevistos e testes finais

---

## 5. Recursos Necessários

### 5.1 Infraestrutura
- **Redis**: Para BullMQ e cache (Upstash recomendado)
- **LibreOffice**: Para conversão de DOC (opcional, pode ser em container)
- **Monitoramento**: Vercel Analytics, Sentry, ou similar

### 5.2 Dependências NPM
- `bullmq` - Fila de jobs
- `ioredis` - Cliente Redis
- `file-type` - Validação de tipo de arquivo
- `tiktoken` - Estimativa precisa de tokens
- `crypto` - Hash de arquivos (built-in)
- `dompurify` - Sanitização (já instalado)

### 5.3 Migrações de Banco
- Adicionar coluna `file_hash` em `documents`
- Criar índice em `file_hash`
- Tabela de métricas (opcional)

---

## 6. Riscos e Mitigações

### 6.1 Riscos Técnicos

**Risco:** Redis pode ser custo adicional  
**Mitigação:** Usar Upstash (free tier generoso) ou Redis local para desenvolvimento

**Risco:** LibreOffice pode ser complexo de configurar  
**Mitigação:** Usar Docker container ou API externa como fallback

**Risco:** Mudanças podem quebrar processamento existente  
**Mitigação:** Implementar feature flags, testes extensivos, deploy gradual

### 6.2 Riscos de Prazo

**Risco:** Tarefas podem levar mais tempo que estimado  
**Mitigação:** Buffer de 2 semanas no final, priorizar itens críticos

**Risco:** Dependências externas podem atrasar  
**Mitigação:** Ter alternativas prontas, começar com itens sem dependências

### 6.3 Riscos de Qualidade

**Risco:** Novas features podem introduzir bugs  
**Mitigação:** Testes unitários e de integração, code review, testes em staging

---

## 7. Critérios de Sucesso

### 7.1 Métricas de Sucesso
- Taxa de sucesso de processamento > 95%
- Tempo médio de processamento reduzido em 30%
- Zero perda de jobs em reinicializações
- Taxa de falha de conversão < 2%

### 7.2 Qualidade
- Cobertura de testes > 80%
- Zero vulnerabilidades críticas de segurança
- Documentação completa de todas as features

### 7.3 Performance
- Processamento de arquivo de 10MB < 2 minutos
- Cache hit rate > 50% para conversões
- Uso de API reduzido em 30% (via cache)

---

## 8. Próximos Passos Imediatos

1. **Revisar e Aprovar Planejamento**
   - Revisar estimativas
   - Ajustar prioridades se necessário
   - Confirmar recursos disponíveis

2. **Configurar Ambiente de Desenvolvimento**
   - Configurar Redis (Upstash)
   - Instalar dependências
   - Configurar variáveis de ambiente

3. **Iniciar Fase 1**
   - Começar com T1.1 (Fila de Jobs)
   - Criar branch `feat/ingestion-improvements`
   - Setup inicial de BullMQ

4. **Criar Issues/Tasks**
   - Criar issues no GitHub para cada tarefa
   - Adicionar labels de prioridade
   - Definir milestones por fase

---

## 9. Notas de Implementação

### 9.1 Convenções
- Usar TypeScript strict mode
- Seguir padrões de código existentes
- Adicionar testes para todas as features
- Documentar funções complexas

### 9.2 Testes
- Testes unitários para funções puras
- Testes de integração para APIs
- Testes end-to-end para fluxos completos
- Testes de carga para performance

### 9.3 Documentação
- Atualizar README com novas features
- Documentar configuração de Redis
- Documentar métricas e monitoramento
- Criar guias de troubleshooting

---

**Versão:** 1.0  
**Última Atualização:** 2025-01-21  
**Próxima Revisão:** Após conclusão da Fase 1

