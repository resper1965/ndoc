# 📊 Análise Completa da Aplicação n.doc

## 🎯 Visão Geral

**n.doc** é uma plataforma de documentação desenvolvida pela **ness.** que permite aos clientes criar, gerenciar e publicar documentação técnica usando MDX.

---

## 📦 Stack Tecnológico Atual

### Frontend
- **Next.js 15.2.4** (App Router)
- **React 19.0.0**
- **TypeScript 5**
- **Tailwind CSS 4.1.3**
- **Contentlayer2 0.5.4** (processamento MDX)

### Backend (Atual)
- **File System** (docs/*.mdx)
- **JSON Files** (config/*.json)
- **Next.js API Routes** (serverless)

### Backend (Planejado - Supabase)
- **PostgreSQL** (database)
- **Supabase Storage** (arquivos)
- **Supabase Auth** (autenticação)
- **Supabase Realtime** (colaboração)

### Deploy
- **Vercel** (frontend + API routes)
- **Supabase** (backend)

---

## 🏗️ Arquitetura Atual

### Persistência de Documentos

#### Estado Atual: File System

```
/docs/
├── index.mdx
├── exemplo-documento.mdx
├── guias/
│   └── ...
└── ...

Processamento:
1. Arquivos .mdx em /docs/
2. Contentlayer processa em build time
3. Gera tipos TypeScript
4. Sidebar gerada automaticamente
```

**Características:**
- ✅ Simples para desenvolvimento
- ✅ Versionamento via Git
- ✅ Editável diretamente
- ❌ Não escala para multi-tenancy
- ❌ Sem isolamento por cliente
- ❌ Sem colaboração em tempo real
- ❌ Sem histórico de versões

#### Estado Futuro: Supabase Database

```
PostgreSQL (Supabase)
├── organizations (tenants)
├── documents
│   ├── id
│   ├── organization_id (RLS)
│   ├── path
│   ├── title
│   ├── content (MDX)
│   ├── frontmatter (JSONB)
│   └── ...
├── document_versions (histórico)
└── document_comments (colaboração)

Storage (Supabase)
└── documents/
    └── {organization_id}/
        └── {path}.mdx
```

**Características:**
- ✅ Multi-tenancy (RLS)
- ✅ Isolamento por cliente
- ✅ Colaboração em tempo real
- ✅ Histórico de versões
- ✅ Busca avançada
- ✅ Escalável

### Resposta: Documentos serão persistidos em banco?

**SIM**, com a migração para Supabase:

1. **Conteúdo MDX** → Tabela `documents` (PostgreSQL)
   - Campo `content` (TEXT) - conteúdo MDX completo
   - Campo `frontmatter` (JSONB) - metadados parseados
   - Campo `path` - caminho do documento

2. **Arquivos grandes** → Supabase Storage (opcional)
   - Para assets/imagens grandes
   - Para backup de versões

3. **Vantagens:**
   - Queries SQL para busca
   - RLS para isolamento
   - Versionamento fácil
   - Colaboração em tempo real
   - Backup automático

---

## 📋 Funcionalidades Atuais

### ✅ Implementadas

1. **Gerenciamento de Documentos**
   - ✅ Criar documentos (modal com formulário)
   - ✅ Editar documentos (editor com validação)
   - ✅ Deletar documentos
   - ✅ Listar documentos
   - ✅ Visualizar documentos
   - ✅ Validação MDX em tempo real
   - ✅ Exportação ZIP

2. **Autenticação**
   - ✅ Sistema básico (usuário/senha)
   - ✅ Multi-usuário (read/write/admin)
   - ✅ Gerenciamento de credenciais
   - ⚠️ Sem sessão persistente (gap identificado)

3. **Interface**
   - ✅ Sidebar automática
   - ✅ Busca integrada
   - ✅ Tema claro/escuro
   - ✅ Responsivo
   - ✅ Branding configurável (n.doc)

4. **Contentlayer**
   - ✅ Processamento automático de MDX
   - ✅ Geração de tipos TypeScript
   - ✅ Sidebar gerada automaticamente
   - ✅ Suporte a Mermaid

### ⚠️ Gaps Identificados

1. **Autenticação**
   - ❌ Sem sessão persistente
   - ❌ Senha precisa ser digitada toda vez
   - ❌ Sem OAuth/SSO

2. **Editor**
   - ❌ Textarea simples (sem preview)
   - ❌ Sem syntax highlighting
   - ❌ Sem autocomplete

3. **Lista de Documentos**
   - ❌ Mostra apenas path/url
   - ❌ Sem título, descrição, data
   - ❌ Sem filtros/busca avançada

4. **Colaboração**
   - ❌ Sem comentários
   - ❌ Sem versionamento
   - ❌ Sem real-time

5. **IA**
   - ❌ Não implementado (planejado)

---

## 🎯 Funcionalidades Planejadas (Spec Kit)

### Phase 1: Autenticação com Sessão
- Sessão persistente (localStorage/cookies)
- Modo leitura sem auth
- Login/logout

### Phase 2: Editor Melhorado
- Preview lado a lado
- Syntax highlighting
- Templates pré-definidos
- Autocomplete

### Phase 3: Lista Aprimorada
- Cards informativos
- Busca avançada
- Filtros por tema/data
- Ordenação

### Phase 4-6: Agente de IA
- Configuração por tema
- Geração de documentos
- Melhoria de documentos

---

## 🔄 Migração para Supabase

### Impacto na Persistência

**Antes (File System):**
```typescript
// Criar documento
fs.writeFileSync(`docs/${path}.mdx`, content)

// Ler documento
const content = fs.readFileSync(`docs/${path}.mdx`, 'utf-8')
```

**Depois (Supabase):**
```typescript
// Criar documento
await supabase.from('documents').insert({
  organization_id: orgId,
  path: 'guides/introduction',
  content: mdxContent,
  frontmatter: { title: '...', description: '...' }
})

// Ler documento
const { data } = await supabase
  .from('documents')
  .select('*')
  .eq('organization_id', orgId)
  .eq('path', 'guides/introduction')
  .single()
```

### Contentlayer vs. Database

**Opção 1: Híbrida (Recomendada para migração)**
- Contentlayer continua processando MDX
- Database armazena conteúdo
- Contentlayer lê do database (via plugin customizado)

**Opção 2: Apenas Database**
- Remover Contentlayer
- Renderizar MDX diretamente (next-mdx-remote)
- Mais controle, menos "mágica"

**Recomendação:** Opção 1 durante migração, evoluir para Opção 2.

---

## 📊 Estrutura de Dados

### Schema Proposto (Supabase)

```sql
-- Organizations (tenants)
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  path TEXT NOT NULL, -- ex: "guides/introduction"
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL, -- MDX completo
  frontmatter JSONB, -- { title, description, date, order }
  order_index INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published', -- draft, published
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, path)
);

-- Document Versions (histórico)
CREATE TABLE document_versions (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  content TEXT NOT NULL,
  frontmatter JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Frontmatter como JSONB

**Vantagens:**
- ✅ Queries SQL em campos específicos
- ✅ Indexação
- ✅ Validação
- ✅ Busca avançada

**Exemplo:**
```sql
-- Buscar documentos com order < 10
SELECT * FROM documents 
WHERE frontmatter->>'order' < '10'
AND organization_id = 'xxx';

-- Buscar por descrição
SELECT * FROM documents 
WHERE frontmatter->>'description' ILIKE '%autenticação%';
```

---

## 🎨 Branding e Personalização

### Sistema Implementado

- **Aplicação**: n.doc
- **Produtor**: ness.
- **Cliente**: Configurável em `config/branding.ts`

**Campos configuráveis:**
- Nome
- Logo
- Website
- Email
- GitHub
- Twitter
- LinkedIn
- Tagline
- Descrição

**Onde aparece:**
- Cabeçalho
- Sidebar
- Página principal
- Meta tags (SEO)
- Footer (sempre mostra "Built with ❤️ by ness.")

---

## 🔐 Segurança

### Atual
- ✅ Autenticação básica (SHA-256)
- ✅ Permissões (read/write/admin)
- ✅ Validação de inputs
- ⚠️ Senha em texto no request (deveria ser HTTPS)

### Futuro (Supabase)
- ✅ Auth enterprise (JWT, OAuth, 2FA)
- ✅ RLS (Row Level Security)
- ✅ Encryption at rest
- ✅ HTTPS obrigatório

---

## 📈 Performance

### Atual
- ✅ Static generation (Contentlayer)
- ✅ CDN (Vercel)
- ⚠️ Rebuild necessário para novos documentos

### Futuro (Supabase)
- ✅ ISR (Incremental Static Regeneration)
- ✅ On-demand revalidation
- ✅ Cache de queries
- ✅ CDN para assets

---

## 🚀 Deploy

### Configuração Atual
- **Frontend**: Vercel (Next.js)
- **Backend**: File System (local)

### Configuração Futura
- **Frontend**: Vercel (Next.js)
- **Backend**: Supabase (PostgreSQL + Storage + Auth)
- **Edge Functions**: Supabase (IA)

---

## 📝 Documentação do Spec Kit

### Estrutura Atual

```
specs/
└── 003-melhorias-ux-ia/
    ├── spec.md (especificação)
    ├── plan.md (plano de implementação)
    ├── tasks.md (tasks detalhadas)
    └── research.md (pesquisa técnica)
```

### Status
- ✅ Especificação criada
- ✅ Plano de implementação criado
- ✅ Tasks detalhadas criadas
- ✅ Pesquisa técnica criada
- ⚠️ Precisa atualização para refletir:
  - Nome da aplicação (n.doc)
  - Produtor (ness.)
  - Stack Supabase
  - Persistência em banco

---

## 🎯 Próximos Passos

1. **Atualizar Spec Kit**
   - Refletir n.doc e ness.
   - Incluir Supabase
   - Atualizar persistência (banco)

2. **Migração para Supabase**
   - Setup do projeto
   - Schema do database
   - Migração de documentos
   - RLS policies

3. **Implementar Melhorias**
   - Autenticação com sessão
   - Editor melhorado
   - Lista aprimorada
   - Agente de IA

---

## ✅ Conclusão

### Estado Atual
- ✅ Template funcional
- ✅ Gerenciamento básico de documentos
- ✅ Branding configurável
- ⚠️ Gaps de UX identificados

### Estado Futuro
- ✅ Multi-tenancy (Supabase)
- ✅ Persistência em banco
- ✅ Colaboração em tempo real
- ✅ Agente de IA
- ✅ Escalabilidade

### Persistência de Documentos

**Resposta:** SIM, os documentos serão persistidos em banco (PostgreSQL) quando migrar para Supabase.

**Estrutura:**
- Conteúdo MDX → Tabela `documents` (campo `content`)
- Frontmatter → Tabela `documents` (campo `frontmatter` JSONB)
- Metadados → Campos da tabela (title, description, path, etc.)
- Versões → Tabela `document_versions`
- Assets → Supabase Storage (opcional)

**Benefícios:**
- Isolamento por tenant (RLS)
- Queries SQL poderosas
- Versionamento fácil
- Colaboração em tempo real
- Backup automático

---

**Análise completa finalizada. Pronto para atualizar Spec Kit.**

