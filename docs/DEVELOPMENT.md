# Guia de Desenvolvimento - ndocs

Este documento fornece informações técnicas para desenvolvedores que desejam contribuir ou entender o funcionamento interno do ndocs.

## 📋 Índice

- [Arquitetura](#arquitetura)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Fluxos Principais](#fluxos-principais)
- [APIs](#apis)
- [Testes](#testes)

## 🏗️ Arquitetura

### Stack Tecnológico

- **Frontend**: Next.js 15.2.4 (React 19)
- **Backend**: Next.js API Routes + Supabase
- **Banco de Dados**: PostgreSQL (via Supabase)
- **Autenticação**: Supabase Auth
- **IA**: OpenAI (embeddings e geração de conteúdo)
- **Vetorização**: pgvector (PostgreSQL extension)
- **Estilização**: Tailwind CSS

### Arquitetura de Dados

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│   Next.js App   │
│  (API Routes)   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│    Supabase     │
│  - PostgreSQL   │
│  - Auth         │
│  - Storage      │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   OpenAI API    │
│  - Embeddings   │
│  - Chat GPT     │
└─────────────────┘
```

## 📁 Estrutura do Projeto

```
ndocs/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── ingest/        # Ingestão de documentos
│   │   │   ├── search/        # Busca semântica
│   │   │   ├── rag/           # RAG queries
│   │   │   └── process/       # Processamento de documentos
│   │   ├── app/               # Área administrativa (/app)
│   │   │   ├── documents/     # Gerenciamento de documentos
│   │   │   ├── chat/          # Chat RAG
│   │   │   ├── processing/    # Monitoramento de jobs
│   │   │   └── settings/      # Configurações
│   │   └── docs/              # Área pública de documentação (/docs)
│   ├── components/            # Componentes React
│   │   ├── semantic-search-dialog.tsx
│   │   ├── document-editor.tsx
│   │   ├── ai-document-generator.tsx
│   │   └── ...
│   ├── lib/                   # Bibliotecas e utilitários
│   │   ├── vectorization/     # Pipeline de vetorização
│   │   ├── search/            # Busca semântica
│   │   ├── rag/               # RAG implementation
│   │   ├── processing/        # Conversores de documentos
│   │   └── supabase/          # Cliente Supabase
│   └── types/                 # TypeScript types
├── supabase/
│   └── migrations/            # Migrações do banco
└── docs/                      # Documentação
```

## 🛠️ Tecnologias Utilizadas

### Principais Dependências

- **next**: Framework React para produção
- **@supabase/supabase-js**: Cliente Supabase
- **openai**: SDK OpenAI para embeddings e chat
- **pdf-parse**: Conversão de PDF
- **mammoth**: Conversão de DOCX
- **xlsx**: Conversão de planilhas
- **react-markdown**: Renderização de Markdown

### Extensões do Banco

- **pgvector**: Armazenamento e busca de vetores
- **uuid-ossp**: Geração de UUIDs

## ⚙️ Configuração do Ambiente

### Variáveis de Ambiente

Crie um arquivo `.env.local` com:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# Aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Instalação

```bash
# Instalar dependências
npm install

# Executar migrações do Supabase
npx supabase migration up

# Iniciar servidor de desenvolvimento
npm run dev
```

## 🔄 Fluxos Principais

### 1. Ingestão de Documentos

```
Upload → Conversão → Chunking → Embedding → Armazenamento
```

1. Usuário faz upload de arquivo
2. Sistema converte para Markdown
3. Documento é dividido em chunks
4. Cada chunk é convertido em embedding
5. Embeddings são armazenados no banco

### 2. Busca Semântica

```
Query → Embedding → Busca Vetorial → Resultados
```

1. Usuário digita query
2. Query é convertida em embedding
3. Busca por similaridade usando pgvector
4. Retorna chunks mais relevantes

### 3. RAG (Retrieval Augmented Generation)

```
Query → Busca Semântica → Contexto → LLM → Resposta
```

1. Query do usuário
2. Busca semântica retorna contexto relevante
3. Contexto é formatado para prompt
4. LLM gera resposta baseada no contexto
5. Resposta é retornada com fontes

## 🔌 APIs

### Principais Endpoints

#### `/api/ingest`
- **POST**: Criar ou atualizar documento
- **GET**: Buscar documento por path
- **DELETE**: Deletar documento

#### `/api/ingest/upload`
- **POST**: Upload e conversão de arquivo

#### `/api/search/semantic`
- **POST/GET**: Busca semântica em documentos

#### `/api/rag/query`
- **POST**: Query RAG com geração de resposta

#### `/api/process/document/[id]`
- **POST**: Iniciar processamento de documento
- **GET**: Verificar status do processamento

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
npm test

# Com UI
npm run test:ui

# Com cobertura
npm run test:coverage

# Modo watch
npm run test:watch
```

### Estrutura de Testes

```
src/test/
├── api/              # Testes de API routes
├── lib/              # Testes de bibliotecas
└── components/       # Testes de componentes
```

## 📝 Convenções

### Commits

Seguimos o padrão Conventional Commits:

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Tarefas de manutenção

### Código

- TypeScript strict mode
- ESLint + Prettier
- Componentes funcionais com hooks
- Server Components quando possível

## 🚀 Deploy

### Vercel

O projeto está configurado para deploy automático na Vercel:

1. Push para branch `main` ou `feat/*`
2. Vercel detecta mudanças
3. Build e deploy automáticos

### Variáveis de Ambiente no Vercel

Configure as mesmas variáveis de `.env.local` no painel da Vercel.

## 📚 Recursos Adicionais

- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação OpenAI](https://platform.openai.com/docs)
- [pgvector](https://github.com/pgvector/pgvector)

