# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [1.0.0] - 2025-01-14

### ✅ Implementação Completa

#### Phase 1: Sistema de Autenticação
- ✅ Auth Context centralizado
- ✅ useAuth hook
- ✅ Middleware com proteção de rotas
- ✅ Página de login funcional
- ✅ ReadOnlyBanner

#### Phase 2: Editor Melhorado
- ✅ CodeMirror 6 integrado
- ✅ Preview em tempo real (split-view)
- ✅ Templates pré-definidos (5 templates)
- ✅ Integração no modal de criação e edição

#### Phase 3: Lista Aprimorada
- ✅ Cards informativos
- ✅ Busca de documentos
- ✅ Filtros e ordenação
- ✅ Enriquecimento com frontmatter

#### Phase 4: Configuração de IA
- ✅ Interface de gerenciamento de temas
- ✅ Interface de configuração de provedores
- ✅ APIs REST completas

#### Phase 5: Geração de Documentos com IA
- ✅ Supabase Edge Function `generate-document`
- ✅ API `/api/ai/generate`
- ✅ Service client-side
- ✅ Integração no editor

#### Phase 6: Melhoria de Documentos com IA
- ✅ Supabase Edge Function `improve-document`
- ✅ API `/api/ai/improve`
- ✅ Integração no editor

### 🎨 Componentes Novos
- `MDXEditor` - Editor CodeMirror 6
- `MDXPreview` - Preview client-side
- `MDXEditorWithPreview` - Editor com preview split-view
- `DocumentCard` - Card informativo
- `AIConfigSection` - Configuração de IA
- `AIActions` - Ações de IA

### 🔌 APIs Novas
- `/api/ai/themes` - CRUD de temas
- `/api/ai/providers` - CRUD de provedores
- `/api/ai/generate` - Gerar documento
- `/api/ai/improve` - Melhorar documento

### ⚡ Edge Functions
- `generate-document` - Geração de documentos
- `improve-document` - Melhoria de documentos

### 📦 Dependências Adicionadas
- `@uiw/react-codemirror` - Editor CodeMirror 6
- `@codemirror/lang-markdown` - Syntax highlighting Markdown
- `@codemirror/lang-yaml` - Syntax highlighting YAML
- `@codemirror/theme-one-dark` - Tema dark
- `react-markdown` - Renderização Markdown client-side

### 🔒 Segurança
- ✅ RLS policies configuradas
- ✅ Rate limiting implementado
- ✅ Validação com Zod
- ✅ API keys armazenadas de forma segura

### 🧪 Testes
- ✅ 18 testes passando
- ✅ Cobertura básica implementada

---

## [0.2.0] - 2025-01-14

### Phase 1: Sistema de Autenticação
- Implementação inicial do sistema de autenticação

---

## [0.1.0] - 2025-01-13

### Release Inicial
- Setup inicial do projeto
- Infraestrutura base
- Schema do Supabase
