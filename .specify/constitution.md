# Constituição do Projeto ndocs

**Versão**: 1.0  
**Data**: 2025-01-17  
**Status**: Ativo

## Visão Geral

O **ndocs** é uma plataforma SaaS de documentação inteligente desenvolvida pela **ness.** que permite organizações gerenciarem, criarem e compartilharem documentação técnica com suporte a IA.

## Princípios Fundamentais

1. **Multi-tenancy**: Cada organização tem seu próprio espaço isolado de dados
2. **IA-First**: Integração nativa com IA para geração e melhoria de documentos
3. **Flexibilidade**: Suporte a múltiplos formatos de entrada (MDX, PDF, DOCX)
4. **Escalabilidade**: Arquitetura preparada para crescimento
5. **Segurança**: RLS (Row Level Security) e controle de acesso granular

## Stack Tecnológico

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes, Supabase (PostgreSQL, Auth, Storage)
- **IA**: OpenAI, Anthropic (configurável por organização)
- **Deploy**: Vercel
- **Rate Limiting**: Upstash Redis

## Estrutura de Dados

### Entidades Principais

- **Organizations**: Organizações multi-tenant
- **Users**: Usuários do sistema (via Supabase Auth)
- **Organization Members**: Membros de organizações com roles
- **Documents**: Documentos MDX armazenados no Supabase
- **AI Providers**: Configuração de provedores de IA por organização
- **AI Themes**: Temas de IA para geração de documentos

### Roles

- **superadmin**: Administrador da plataforma
- **orgadmin**: Administrador da organização
- **admin**: Administrador (equivalente a orgadmin)
- **editor**: Editor de documentos
- **viewer**: Visualizador de documentos

## Funcionalidades Atuais

### ✅ Implementado

1. Autenticação e autorização (Supabase Auth)
2. Multi-tenancy básico (organizações isoladas)
3. Gerenciamento de documentos MDX (criação, edição, visualização)
4. Configuração de IA (provedores, temas)
5. Geração e melhoria de documentos com IA
6. Interface de configuração (`/config`)
7. Página de administração (`/admin`)
8. Onboarding básico (`/onboarding`)

### 🚧 Em Desenvolvimento

1. Processo de onboarding completo (superadmin → orgadmin)
2. Ingestão de documentos (PDF, DOCX → Markdown)
3. Vetorização e RAG (Retrieval Augmented Generation)
4. Templates baseados no Pinexio
5. Processamento assíncrono de documentos

## Arquitetura

### Estrutura de Pastas

```
ndocs/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # Componentes React
│   ├── lib/              # Utilitários e helpers
│   └── middleware.ts     # Middleware Next.js
├── config/               # Configurações (branding, sidebar, etc.)
├── docs/                 # Documentação MDX
├── supabase/             # Migrations e configurações Supabase
└── public/               # Arquivos estáticos
```

### Fluxo de Dados

1. **Autenticação**: Supabase Auth → RLS Policies → Acesso aos dados
2. **Documentos**: Editor MDX → Supabase (tabela `documents`) → Renderização
3. **IA**: Configuração → API Routes → Edge Functions → Resposta

## Regras de Negócio

1. Apenas superadmins podem criar organizações
2. Apenas orgadmins podem convidar membros
3. Documentos são isolados por organização (exceto publicados)
4. IA é configurável por organização
5. Rate limiting aplicado a todas as APIs

## Próximos Passos

Ver `ANALISE-GAP-FUNCIONAL.md` para detalhes sobre funcionalidades pendentes.

