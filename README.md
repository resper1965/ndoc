# 📚 n.doc - Plataforma de Documentação Inteligente

**Versão**: 1.0.0  
**Status**: ✅ **Em Produção**

**n.doc** é uma aplicação completa e moderna para criação, gerenciamento e publicação de documentação técnica. Desenvolvida pela **ness.**, oferece recursos avançados como geração e melhoria de documentos usando Inteligência Artificial, editor avançado, autenticação robusta e multi-tenancy.

---

## 🎯 Visão Geral

**n.doc** é uma plataforma de documentação desenvolvida pela **ness.** que combina:

- ✨ **Editor avançado** com CodeMirror 6 e preview em tempo real
- 🤖 **Geração e melhoria de documentos** usando IA (OpenAI/Anthropic)
- 🔐 **Autenticação e autorização** robusta com Supabase
- 🏢 **Multi-tenancy** completo
- 📝 **Templates pré-definidos** para diferentes tipos de documentos
- 🔍 **Busca e filtros** avançados
- 🎨 **Interface moderna** e responsiva

---

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 20+ e pnpm
- Conta no Supabase (já configurada)
- (Opcional) Conta OpenAI ou Anthropic para recursos de IA

### Instalação Local

```bash
# Clone o repositório
git clone https://github.com/resper1965/ndoc.git
cd ndoc

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase
```

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

# Rate Limiting (Opcional - Upstash Redis)
UPSTASH_REDIS_REST_URL=sua_url_do_redis
UPSTASH_REDIS_REST_TOKEN=seu_token_do_redis
```

### Executar em Desenvolvimento

```bash
pnpm dev
```

Acesse `http://localhost:3000`

### Build para Produção

```bash
pnpm build
pnpm start
```

---

## 📖 Guias de Configuração

### 🗄️ Migrations do Banco de Dados

Para configurar o banco de dados pela primeira vez ou aplicar atualizações:

**➡️ Veja o guia completo:** [MIGRATIONS.md](./MIGRATIONS.md)

- Todas as 5 migrations documentadas
- Como executar via Supabase CLI ou Dashboard
- Ordem correta de execução
- Troubleshooting completo

### ⚡ Configurar Redis (Upstash)

**⚠️ OBRIGATÓRIO EM PRODUÇÃO** para rate limiting distribuído.

**➡️ Veja o guia completo:** [REDIS-SETUP.md](./REDIS-SETUP.md)

- Como criar conta no Upstash
- Configurar database Redis
- Obter credenciais
- Configurar variáveis de ambiente
- Verificação e troubleshooting

### 🔀 Fazer Merge no GitHub

Para integrar mudanças da branch de desenvolvimento para main:

**➡️ Veja o guia completo:** [MERGE-GUIDE.md](./MERGE-GUIDE.md)

- Criar Pull Request no GitHub
- Revisar mudanças
- Fazer merge com segurança
- Passos pós-merge
- Troubleshooting

---

## 🔑 Configuração de Chaves de IA

### Quando Preciso Configurar a Chave de IA?

Você **precisa configurar chaves de IA** apenas se quiser usar os recursos de **geração e melhoria de documentos** com Inteligência Artificial. A aplicação funciona perfeitamente sem IA para:

- ✅ Criar e editar documentos manualmente
- ✅ Visualizar documentos
- ✅ Gerenciar usuários
- ✅ Buscar e filtrar documentos
- ✅ Usar templates pré-definidos

### Como Configurar

1. **Acesse a página de Configuração** (`/config`)
2. **Vá para a seção "Configuração de IA"**
3. **Configure um Provedor de IA**:
   - Clique em "Novo Provedor"
   - Selecione o provedor (OpenAI ou Anthropic)
   - Escolha o modelo (ex: GPT-4, Claude 3 Opus)
   - **Cole sua API Key**
   - Salve

4. **Crie um Tema de IA** (opcional):
   - Clique em "Novo Tema"
   - Defina nome, descrição e system prompt
   - O system prompt define como a IA deve gerar/melhorar documentos

### Onde Obter as Chaves?

- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/settings/keys

### Segurança

- ✅ As chaves são **armazenadas de forma segura** no Supabase
- ✅ Apenas usuários autenticados podem configurar chaves
- ✅ As chaves são **isoladas por organização** (multi-tenancy)
- ✅ As chaves **nunca são expostas** no frontend
- ✅ As Edge Functions usam as chaves apenas no servidor

---

## 📖 Funcionalidades Principais

### 1. Editor de Documentos

#### Recursos do Editor
- **Syntax Highlighting**: Markdown e YAML (frontmatter)
- **Preview em Tempo Real**: Visualize o resultado enquanto escreve
- **Split-View**: Editor e preview lado a lado
- **Templates**: 5 templates pré-definidos (Guia, Referência, Tutorial, API, Em Branco)
- **Validação MDX**: Validação em tempo real do formato

#### Como Usar
1. Acesse `/config`
2. Clique em "Novo" na seção de documentos
3. Preencha os campos (caminho, título, descrição)
4. Selecione um template ou escreva do zero
5. Use o editor com preview para visualizar
6. Salve o documento

### 2. Geração de Documentos com IA

#### Quando Usar
- Para criar documentos completos rapidamente
- Quando precisa de uma base inicial de conteúdo
- Para gerar documentação técnica estruturada

#### Como Usar
1. No editor, clique em **"Gerar com IA"**
2. Preencha:
   - **Tópico**: Sobre o que será o documento
   - **Caminho**: Onde será salvo
   - **Tema**: Qual tema de IA usar (define o estilo)
3. Clique em "Gerar"
4. A IA gerará um documento completo com frontmatter
5. Revise e ajuste conforme necessário

#### Pré-requisitos
- ✅ Provedor de IA configurado
- ✅ Tema de IA criado
- ✅ API Key válida

### 3. Melhoria de Documentos com IA

#### Quando Usar
- Para melhorar clareza e estrutura
- Para adicionar exemplos e detalhes
- Para corrigir erros e melhorar formatação
- Para expandir conteúdo existente

#### Como Usar
1. Abra um documento no editor
2. Clique em **"Melhorar com IA"**
3. (Opcional) Selecione um tema de IA
4. (Opcional) Adicione instruções específicas
5. Clique em "Melhorar"
6. A IA retornará uma versão melhorada
7. Revise as mudanças e aceite ou rejeite

### 4. Busca e Filtros

#### Recursos
- **Busca em Tempo Real**: Busca por título, descrição, caminho ou URL
- **Ordenação**: Por caminho (alfabética) ou data (mais recente primeiro)
- **Cards Informativos**: Visualização rica com metadados

#### Como Usar
1. Na lista de documentos, use a barra de busca
2. Selecione o tipo de ordenação
3. Os resultados são filtrados automaticamente

### 5. Gerenciamento de Usuários

#### Roles Disponíveis
- **superadmin**: Acesso global a todas as organizações
- **orgadmin**: Administrador da organização
- **admin**: Administrador (escopo organização)
- **editor**: Pode criar/editar documentos
- **viewer**: Apenas leitura

#### Como Gerenciar
1. Acesse `/config`
2. Vá para "Gerenciamento de Usuários"
3. Crie, edite ou remova usuários
4. Atribua roles conforme necessário

---

## 🏗️ Arquitetura

### Stack Tecnológico

- **Frontend**: Next.js 15, React 19, TypeScript
- **Estilização**: Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **IA**: OpenAI / Anthropic (via Edge Functions)
- **Editor**: CodeMirror 6
- **MDX**: next-mdx-remote

### Estrutura de Pastas

```
ndocs/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── ai/           # APIs de IA
│   │   │   └── ingest/       # APIs de documentos
│   │   ├── config/           # Página de configuração
│   │   ├── docs/             # Visualização de docs
│   │   └── login/            # Página de login
│   ├── components/            # Componentes React
│   │   ├── ai-actions.tsx    # Ações de IA
│   │   ├── mdx-editor.tsx    # Editor CodeMirror
│   │   ├── document-card.tsx # Card de documento
│   │   └── ...
│   ├── contexts/              # React Contexts
│   │   └── auth-context.tsx  # Context de autenticação
│   ├── hooks/                 # Custom Hooks
│   │   └── use-auth.ts       # Hook de autenticação
│   ├── lib/                   # Bibliotecas e utilitários
│   │   ├── supabase/         # Clientes Supabase
│   │   ├── ai-service.ts     # Service de IA
│   │   ├── templates.ts      # Templates de documentos
│   │   └── ...
│   └── middleware.ts          # Next.js Middleware
├── supabase/
│   ├── functions/             # Edge Functions
│   │   ├── generate-document/
│   │   └── improve-document/
│   └── migrations/            # Migrations do banco
└── docs/                      # Documentação estática
```

---

## 🔌 APIs Disponíveis

### Documentos

#### `POST /api/ingest`
Cria ou atualiza um documento.

**Body**:
```json
{
  "path": "exemplo/documento",
  "content": "---\ntitle: Título\n---\n\nConteúdo..."
}
```

#### `GET /api/ingest?list=true`
Lista todos os documentos.

#### `GET /api/ingest?path=exemplo/documento`
Obtém um documento específico.

#### `DELETE /api/ingest`
Deleta um documento.

**Body**:
```json
{
  "path": "exemplo/documento"
}
```

### IA - Temas

#### `GET /api/ai/themes`
Lista todos os temas de IA.

#### `POST /api/ai/themes`
Cria um novo tema.

**Body**:
```json
{
  "name": "Documentação Técnica",
  "description": "Tema para docs técnicas",
  "system_prompt": "Você é um especialista..."
}
```

#### `PUT /api/ai/themes/[id]`
Atualiza um tema.

#### `DELETE /api/ai/themes/[id]`
Deleta um tema.

### IA - Provedores

#### `GET /api/ai/providers`
Lista todos os provedores configurados.

#### `POST /api/ai/providers`
Cria um novo provedor.

**Body**:
```json
{
  "provider": "openai",
  "api_key": "sk-...",
  "model": "gpt-4"
}
```

#### `PUT /api/ai/providers/[id]`
Atualiza um provedor.

#### `DELETE /api/ai/providers/[id]`
Deleta um provedor.

### IA - Geração e Melhoria

#### `POST /api/ai/generate`
Gera um novo documento usando IA.

**Body**:
```json
{
  "topic": "Introdução ao React",
  "theme_id": "uuid-do-tema",
  "path": "react/introducao"
}
```

#### `POST /api/ai/improve`
Melhora um documento existente.

**Body**:
```json
{
  "content": "...conteúdo MDX...",
  "theme_id": "uuid-do-tema",
  "instructions": "Melhore a clareza..."
}
```

---

## 🗄️ Banco de Dados

### Tabelas Principais

#### `organizations`
Organizações (multi-tenancy).

#### `organization_members`
Membros e permissões por organização.

#### `documents`
Documentos MDX armazenados.

#### `document_versions`
Histórico de versões dos documentos.

#### `ai_themes`
Temas de IA para geração/melhoria.

#### `ai_provider_config`
Configuração de provedores de IA.

### Segurança (RLS)

Todas as tabelas têm **Row Level Security (RLS)** habilitado, garantindo:
- ✅ Isolamento por organização
- ✅ Permissões baseadas em roles
- ✅ Acesso apenas para usuários autenticados

---

## 🧪 Testes

```bash
# Executar testes
pnpm test

# Testes com UI
pnpm test:ui

# Cobertura
pnpm test:coverage

# Watch mode
pnpm test:watch
```

---

## 📝 Scripts Disponíveis

```bash
pnpm dev          # Desenvolvimento
pnpm build        # Build de produção
pnpm start        # Iniciar produção
pnpm lint         # Linter
pnpm format       # Formatar código
pnpm test         # Testes
```

---

## 🔒 Segurança

### Implementado
- ✅ Autenticação obrigatória para rotas protegidas
- ✅ RLS (Row Level Security) no Supabase
- ✅ Rate limiting (Upstash Redis + fallback memória)
- ✅ Validação robusta com Zod
- ✅ Logger estruturado com sanitização
- ✅ Security headers configurados
- ✅ API keys armazenadas de forma segura

### Boas Práticas
- Nunca exponha API keys no frontend
- Use variáveis de ambiente para secrets
- Mantenha as dependências atualizadas
- Revise logs regularmente

---

## 🚀 Deploy

### Vercel (Recomendado)

A aplicação está configurada para deploy automático na Vercel:

1. ✅ Repositório conectado ao Vercel
2. ✅ Variáveis de ambiente configuradas
3. ✅ Deploy automático a cada push para `main`

**🌐 URL de Produção**: https://ndoc-eight.vercel.app

**📖 Guia Completo**: Veja [VERCEL-SETUP.md](./VERCEL-SETUP.md) para instruções detalhadas de configuração.

### Edge Functions

As Edge Functions já estão deployadas via MCP:
- ✅ `generate-document` - ACTIVE
- ✅ `improve-document` - ACTIVE

Para atualizar manualmente:
```bash
supabase functions deploy generate-document
supabase functions deploy improve-document
```

---

## 📚 Documentação Adicional

- [Manual do Usuário](./MANUAL-USUARIO.md) - Guia completo para usuários
- [Changelog](./CHANGELOG.md) - Histórico de mudanças
- [Estágio Atual](./ESTAGIO-ATUAL.md) - Status da aplicação
- [Implementação Completa](./IMPLEMENTACAO-COMPLETA.md) - Detalhes técnicos

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para mais detalhes.

---

## 📄 Licença

MIT License - veja [LICENSE](./LICENSE) para detalhes.

---

## 👥 Desenvolvido por

**ness.** - Desenvolvimento e manutenção

---

## 🙏 Agradecimentos

- Supabase pela infraestrutura e autenticação
- Next.js pela framework
- CodeMirror pelo editor avançado
- OpenAI e Anthropic pelas APIs de IA
- Comunidade open-source

---

**🌐 Aplicação em Produção**: https://ndoc-eight.vercel.app

**Última atualização**: 2025-01-14
