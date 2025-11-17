# 📊 Análise de Gap Funcional - ndocs

**Data**: 2025-01-17  
**Objetivo**: Comparar o estado atual do projeto com a visão funcional esperada

---

## 🎯 Visão Esperada vs. Estado Atual

### ✅ O que JÁ EXISTE:

1. **Multi-tenancy básico**
   - ✅ Tabela `organizations`
   - ✅ Tabela `organization_members`
   - ✅ Isolamento de dados por organização

2. **Autenticação e Autorização**
   - ✅ Supabase Auth
   - ✅ Roles (superadmin, orgadmin, admin, editor, viewer)
   - ✅ RLS policies

3. **Gerenciamento de Documentos MDX**
   - ✅ Criação manual de documentos MDX
   - ✅ Editor MDX com preview
   - ✅ Armazenamento no Supabase (tabela `documents`)

4. **Configuração de IA**
   - ✅ Temas de IA
   - ✅ Provedores (OpenAI, Anthropic)
   - ✅ Geração e melhoria de documentos com IA

5. **Interface de Configuração**
   - ✅ Página `/config` com tabs
   - ✅ Gerenciamento de usuários
   - ✅ Gerenciamento de documentos

---

## ❌ O que FALTA (Gap):

### 1. **Processo de Onboarding Completo**

#### Estado Atual:
- ⚠️ Onboarding básico existe (`/onboarding`) mas não segue o fluxo esperado
- ⚠️ Organização é criada automaticamente no signup (não pelo superadmin)

#### Esperado:
- ❌ **Superadmin cria organização** e informa email do administrador
- ❌ **Administrador recebe convite por email**
- ❌ **Administrador completa onboarding** (configura IA, convida membros, faz primeira ingestão)

#### O que precisa ser feito:
1. Criar fluxo de onboarding para superadmin:
   - Formulário para criar organização
   - Campo para email do administrador
   - Envio de convite por email
   
2. Criar fluxo de onboarding para administrador:
   - Página de aceite de convite
   - Wizard de configuração inicial:
     - Configurar IA (provedor, temas)
     - Convidar primeiros membros
     - Fazer primeira ingestão de documentos

---

### 2. **Ingestão de Documentos (PDF, DOCX, etc.)**

#### Estado Atual:
- ❌ **NÃO EXISTE** - Apenas criação manual de MDX
- ❌ Sem conversão de PDF/DOCX para Markdown
- ❌ Sem upload de arquivos

#### Esperado:
- ❌ Upload de arquivos (PDF, DOCX, TXT, MD, etc.)
- ❌ Conversão automática para Markdown
- ❌ Aplicação de templates baseados no projeto Pinexio
- ❌ Processamento em background (queue/jobs)

#### O que precisa ser feito:
1. **Sistema de Upload**:
   - Componente de upload (drag & drop)
   - Validação de tipos de arquivo
   - Armazenamento no Supabase Storage

2. **Conversão de Documentos**:
   - **PDF → Markdown**: Usar biblioteca como `pdf-parse` ou `pdfjs-dist`
   - **DOCX → Markdown**: Usar biblioteca como `mammoth` ou `docx`
   - **TXT → Markdown**: Conversão simples
   - **MD → Markdown**: Já é markdown, apenas validar

3. **Templates de Formatação**:
   - Baseado no projeto Pinexio (precisa verificar referências)
   - Aplicar estrutura/template durante conversão
   - Extrair metadados (título, autor, data, etc.)

4. **API de Ingestão**:
   - Endpoint para upload de arquivos
   - Processamento assíncrono
   - Status de processamento
   - Notificações de conclusão

---

### 3. **Vetorização e RAG (Retrieval Augmented Generation)**

#### Estado Atual:
- ❌ **NÃO EXISTE** - Nenhum sistema de vetorização
- ❌ Sem banco de dados vetorial
- ❌ Sem embeddings
- ❌ Sem busca semântica

#### Esperado:
- ❌ Documentos ingeridos são automaticamente vetorizados
- ❌ Embeddings armazenados em banco vetorial
- ❌ Sistema RAG para busca e geração de conteúdo
- ❌ Integração com IA para respostas baseadas em documentos

#### O que precisa ser feito:
1. **Escolher Stack de Vetorização**:
   - **Opção 1**: Supabase Vector (pgvector) - Integrado ao Supabase
   - **Opção 2**: Pinecone - Serviço gerenciado
   - **Opção 3**: Weaviate - Open source
   - **Opção 4**: Qdrant - Open source, self-hosted
   - **Recomendação**: Supabase Vector (pgvector) - já está no stack

2. **Pipeline de Vetorização**:
   - Após conversão para Markdown
   - Chunking (dividir em pedaços)
   - Gerar embeddings (OpenAI, Cohere, etc.)
   - Armazenar no banco vetorial

3. **Sistema RAG**:
   - Busca semântica nos documentos
   - Retrieval de chunks relevantes
   - Context injection para IA
   - Geração de respostas baseadas em documentos

4. **Estrutura de Dados**:
   - Tabela `document_chunks` (chunks do documento)
   - Tabela `document_embeddings` (vetores)
   - Índices vetoriais para busca rápida

---

### 4. **Templates Baseados no Pinexio**

#### Estado Atual:
- ⚠️ Templates básicos existem (`src/lib/templates.ts`)
- ⚠️ Apenas para criação manual de documentos

#### Esperado:
- ❌ Templates específicos do Pinexio
- ❌ Aplicação automática durante conversão
- ❌ Estrutura padronizada de documentos

#### O que precisa ser feito:
1. **Analisar projeto Pinexio**:
   - Verificar estrutura de documentos
   - Identificar padrões de formatação
   - Extrair templates

2. **Criar sistema de templates**:
   - Templates por tipo de documento
   - Aplicação automática na conversão
   - Customização por organização

---

## 📋 Resumo do Gap

| Funcionalidade | Status Atual | Status Esperado | Prioridade |
|----------------|--------------|-----------------|------------|
| Onboarding Superadmin → Admin | ⚠️ Parcial | ❌ Completo | 🔴 Alta |
| Upload de PDF/DOCX | ❌ Não existe | ❌ Necessário | 🔴 Alta |
| Conversão PDF/DOCX → MDX | ❌ Não existe | ❌ Necessário | 🔴 Alta |
| Templates Pinexio | ⚠️ Básico | ❌ Completo | 🟡 Média |
| Vetorização de documentos | ❌ Não existe | ❌ Necessário | 🔴 Alta |
| Banco vetorial (RAG) | ❌ Não existe | ❌ Necessário | 🔴 Alta |
| Busca semântica | ❌ Não existe | ❌ Necessário | 🟡 Média |
| Processamento assíncrono | ❌ Não existe | ❌ Necessário | 🟡 Média |

---

## 🚀 Próximos Passos Recomendados

### Fase 1: Onboarding Completo (Prioridade Alta)
1. Refatorar fluxo de criação de organização
2. Sistema de convites por email
3. Wizard de onboarding para administrador

### Fase 2: Ingestão de Documentos (Prioridade Alta)
1. Sistema de upload de arquivos
2. Conversão PDF → Markdown
3. Conversão DOCX → Markdown
4. Aplicação de templates

### Fase 3: Vetorização e RAG (Prioridade Alta)
1. Configurar pgvector no Supabase
2. Pipeline de vetorização
3. Sistema de busca semântica
4. Integração RAG com IA

### Fase 4: Templates Pinexio (Prioridade Média)
1. Analisar estrutura Pinexio
2. Criar templates específicos
3. Sistema de aplicação automática

---

## 🔍 Perguntas para Clarificar

1. **Pinexio**: Onde está o projeto original Pinexio? Há referências ou código que possamos analisar?

2. **Templates**: Quais tipos de documentos precisam de templates específicos? (ex: manuais, tutoriais, especificações técnicas)

3. **RAG**: Qual o caso de uso principal do RAG? (ex: busca de documentos, geração de respostas, sugestões)

4. **Processamento**: Os documentos podem ser grandes? Precisa de processamento em background/queue?

5. **Embeddings**: Qual provedor de embeddings prefere? (OpenAI, Cohere, local, etc.)

---

**Última atualização**: 2025-01-17

