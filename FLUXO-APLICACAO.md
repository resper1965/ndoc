# 🔄 Fluxo Completo da Aplicação SaaS - n.doc

**Data**: 2025-01-14  
**Versão**: 1.0.0

---

## 🎯 Visão Geral

Este documento descreve o fluxo completo da aplicação **n.doc** como uma plataforma SaaS, desde o primeiro acesso até o uso diário.

---

## 📊 Fluxo Principal

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO COMPLETO DA APLICAÇÃO                   │
└─────────────────────────────────────────────────────────────────┘

1. LANDING PAGE (/)
   ↓
2. SIGN UP / LOGIN
   ↓
3. ONBOARDING (primeira vez)
   ↓
4. DASHBOARD PRINCIPAL
   ↓
5. USO DA APLICAÇÃO
   ├─ Gerenciar Documentos
   ├─ Criar/Editar Documentos
   ├─ Configurações
   └─ Gerenciar Equipe
```

---

## 🏠 1. LANDING PAGE (`/`)

### Objetivo
Apresentar a plataforma, seus benefícios e converter visitantes em usuários.

### Elementos da Página

#### Header
- Logo da aplicação
- Menu de navegação:
  - Features
  - Pricing
  - Docs
  - Login (link)
- Botão "Get Started" (CTA principal)

#### Hero Section
- Título impactante: "Documentação Inteligente para Sua Equipe"
- Subtítulo: "Crie, gerencie e publique documentação técnica com IA"
- CTAs:
  - **"Começar Grátis"** (primary) → `/signup`
  - **"Ver Demo"** (secondary) → `/demo` ou modal
- Imagem/vídeo demonstrativo

#### Features Section
- 4-6 features principais com ícones:
  - ✨ Editor MDX Avançado
  - 🤖 IA Integrada
  - 👥 Colaboração em Equipe
  - 🔒 Seguro e Privado
  - 📊 Analytics
  - 🎨 Customizável

#### Pricing Section
- Tabela de planos:
  - Free (R$ 0)
  - Starter (R$ 49/mês)
  - Professional (R$ 149/mês)
  - Enterprise (Custom)
- Botão "Começar" em cada plano → `/signup?plan=starter`

#### Social Proof
- Testimonials
- Logos de empresas/clientes
- Números (ex: "500+ empresas confiam")

#### Footer
- Links úteis
- Redes sociais
- "Built by ness."

### Ações do Usuário
1. **Clicar em "Começar Grátis"** → Redireciona para `/signup`
2. **Clicar em "Login"** → Redireciona para `/login`
3. **Clicar em um plano** → Redireciona para `/signup?plan=starter`
4. **Navegar** → Ver features, pricing, etc.

---

## 🔐 2. AUTENTICAÇÃO

### 2.1 Sign Up (`/signup`)

#### Objetivo
Criar nova conta de usuário.

#### Fluxo
1. **Formulário de Cadastro**
   - Nome completo
   - Email
   - Senha
   - Confirmar senha
   - Checkbox: "Aceito os Termos de Serviço"

2. **Validação**
   - Email válido
   - Senha forte (mínimo 8 caracteres)
   - Senhas coincidem

3. **Criação da Conta**
   - Criar usuário no Supabase Auth
   - Enviar email de confirmação (se necessário)
   - Criar perfil do usuário

4. **Redirecionamento**
   - Se primeiro acesso → `/onboarding`
   - Se já tem organização → `/dashboard`

#### Estados
- ✅ Sucesso: "Conta criada! Verifique seu email."
- ❌ Erro: Mostrar mensagem de erro específica

### 2.2 Login (`/login`)

#### Objetivo
Autenticar usuário existente.

#### Fluxo
1. **Formulário de Login**
   - Email
   - Senha
   - Link "Esqueceu a senha?"

2. **Autenticação**
   - Validar credenciais no Supabase
   - Criar sessão

3. **Redirecionamento**
   - Se primeiro acesso → `/onboarding`
   - Se já tem organização → `/dashboard`
   - Se veio de rota protegida → Retornar para rota original

#### Estados
- ✅ Sucesso: Redirecionar
- ❌ Erro: "Email ou senha incorretos"

### 2.3 Proteção de Rotas

#### Middleware
- Rotas públicas: `/`, `/login`, `/signup`, `/docs/*`
- Rotas protegidas: `/dashboard`, `/config`, `/admin`
- Se não autenticado → Redirecionar para `/login?redirect=/dashboard`

---

## 🎓 3. ONBOARDING (`/onboarding`)

### Objetivo
Guiar novo usuário na configuração inicial da conta e organização.

### Fluxo (Wizard em 3-4 passos)

#### Passo 1: Criar Organização
- **Pergunta**: "Qual é o nome da sua organização?"
- **Input**: Nome da organização
- **Validação**: Nome único, mínimo 3 caracteres
- **Ação**: Criar organização no banco

#### Passo 2: Escolher Plano
- **Pergunta**: "Escolha seu plano"
- **Opções**: 
  - Free (padrão, pré-selecionado)
  - Starter
  - Professional
- **Ação**: Associar plano à organização
- **Nota**: Pode pular e escolher depois

#### Passo 3: Configuração Inicial (Opcional)
- **Branding**:
  - Upload de logo
  - Cores personalizadas
- **Configurações**:
  - Idioma
  - Fuso horário
- **Ação**: Salvar configurações

#### Passo 4: Primeiro Documento
- **Pergunta**: "Vamos criar seu primeiro documento?"
- **Opções**:
  - "Sim, criar agora" → Abrir editor
  - "Pular, criar depois"
- **Ação**: Se sim, redirecionar para `/dashboard?new-doc=true`

### Finalização
- Mostrar mensagem de boas-vindas
- Botão "Ir para Dashboard" → `/dashboard`
- Opção de fazer tour da aplicação

---

## 📊 4. DASHBOARD PRINCIPAL (`/dashboard`)

### Objetivo
Central de controle da aplicação, visão geral e acesso rápido.

### Layout

#### Sidebar (Esquerda)
- Logo da organização
- Menu:
  - 🏠 Dashboard (ativo)
  - 📄 Documentos
  - 👥 Equipe
  - ⚙️ Configurações
  - 💳 Billing (se plano pago)
- Footer: Avatar do usuário + menu dropdown

#### Header (Topo)
- Breadcrumb
- Busca global
- Notificações
- Avatar do usuário

#### Conteúdo Principal

##### Cards de Métricas
- Total de documentos
- Documentos criados este mês
- Membros da equipe
- Uso de storage
- Requisições de IA (se aplicável)

##### Atividades Recentes
- Últimos documentos criados/editados
- Ações da equipe
- Timeline de eventos

##### Quick Actions
- Botão "Criar Documento" (grande, destacado)
- Botões rápidos:
  - Importar documento
  - Convidar membro
  - Ver analytics

##### Documentos Recentes
- Lista dos 5-10 documentos mais recentes
- Cards clicáveis
- Ações rápidas (editar, visualizar, compartilhar)

##### Avisos e Notificações
- Limites próximos (ex: "80% do storage usado")
- Convites pendentes
- Atualizações do sistema

### Ações do Usuário
1. **Criar Documento** → `/dashboard/documents/new`
2. **Ver Documento** → `/dashboard/documents/[id]`
3. **Gerenciar Equipe** → `/dashboard/team`
4. **Configurações** → `/dashboard/settings`

---

## 📄 5. GERENCIAMENTO DE DOCUMENTOS

### 5.1 Lista de Documentos (`/dashboard/documents`)

#### Layout
- Header com filtros:
  - Busca
  - Filtro por status (rascunho, publicado, arquivado)
  - Filtro por categoria
  - Ordenação (data, nome, popularidade)
- Botão "Novo Documento" (flutuante ou no header)

#### Grid/Lista de Documentos
- Cards de documentos com:
  - Thumbnail/preview
  - Título
  - Descrição
  - Data de criação/atualização
  - Status
  - Ações rápidas (menu de 3 pontos)

#### Paginação
- Navegação entre páginas
- Itens por página (10, 25, 50)

### 5.2 Criar/Editar Documento (`/dashboard/documents/[id]` ou `/dashboard/documents/new`)

#### Layout Split
- **Esquerda**: Editor MDX (CodeMirror)
- **Direita**: Preview em tempo real

#### Header do Editor
- Título do documento (editable)
- Botões:
  - Salvar (auto-save também)
  - Preview (toggle)
  - Publicar
  - Mais opções (menu)

#### Editor
- Syntax highlighting MDX
- Autocomplete
- Templates
- Ações de IA:
  - Gerar conteúdo
  - Melhorar texto
  - Traduzir

#### Preview
- Renderização MDX em tempo real
- Scroll sincronizado (opcional)

#### Sidebar (Direita)
- Metadados:
  - Slug/URL
  - Data de criação
  - Última atualização
  - Autor
- Configurações:
  - Status (rascunho/publicado)
  - Categoria
  - Tags
  - Ordem
- Ações:
  - Duplicar
  - Exportar
  - Excluir

### 5.3 Visualizar Documento Público (`/docs/[slug]`)

#### Layout
- Sidebar com navegação
- Conteúdo renderizado
- TOC (Table of Contents)
- Busca
- Compartilhar

---

## ⚙️ 6. CONFIGURAÇÕES (`/dashboard/settings`)

### Tabs de Configurações

#### Geral
- Nome da organização
- Logo
- Descrição
- Website

#### Equipe
- Lista de membros
- Convites pendentes
- Roles e permissões
- Adicionar membro

#### Billing
- Plano atual
- Uso de recursos
- Histórico de pagamentos
- Upgrade/Downgrade
- Cancelar assinatura

#### Integrações
- Configurações de IA
- APIs
- Webhooks

#### Segurança
- Autenticação
- Domínios permitidos
- Sessões ativas

---

## 👥 7. GERENCIAMENTO DE EQUIPE (`/dashboard/team`)

### Lista de Membros
- Tabela com:
  - Nome
  - Email
  - Role
  - Última atividade
  - Ações

### Convidar Membro
- Formulário:
  - Email
  - Role (admin, editor, viewer)
  - Mensagem personalizada
- Enviar convite por email

### Gerenciar Roles
- Editar role de membro
- Remover membro

---

## 🔍 8. BUSCA E NAVEGAÇÃO

### Busca Global
- Atalho: `Ctrl+K` ou `Cmd+K`
- Busca em:
  - Documentos
  - Páginas
  - Configurações
- Resultados em tempo real
- Navegação por teclado

### Navegação
- Breadcrumbs
- Menu lateral
- Links relacionados

---

## 🚨 9. ESTADOS E ERROS

### Loading States
- Skeleton screens
- Spinners
- Progress bars

### Error States
- 404: Página não encontrada
- 403: Sem permissão
- 500: Erro do servidor
- Offline: Modo offline

### Empty States
- Sem documentos
- Sem membros
- Sem resultados de busca

---

## 📱 10. RESPONSIVIDADE

### Mobile
- Menu hambúrguer
- Cards empilhados
- Editor em tela cheia
- Preview toggle

### Tablet
- Layout adaptado
- Sidebar colapsável

### Desktop
- Layout completo
- Multi-coluna

---

## 🔄 11. FLUXOS ESPECÍFICOS

### 11.1 Primeiro Acesso
```
Landing → Sign Up → Onboarding → Dashboard
```

### 11.2 Usuário Retornando
```
Landing → Login → Dashboard
```

### 11.3 Criar Primeiro Documento
```
Dashboard → Criar Documento → Editor → Salvar → Visualizar
```

### 11.4 Convidar Membro
```
Dashboard → Equipe → Convidar → Email enviado → Aceitar convite → Login → Dashboard
```

### 11.5 Upgrade de Plano
```
Dashboard → Settings → Billing → Escolher plano → Checkout → Confirmação
```

---

## 🎨 12. ELEMENTOS DE UI/UX

### Cores e Temas
- Light mode (padrão)
- Dark mode
- Customização por organização (futuro)

### Animações
- Transições suaves
- Loading states
- Feedback visual

### Acessibilidade
- Navegação por teclado
- Screen readers
- Contraste adequado

---

## 📊 13. ANALYTICS E MÉTRICAS

### Dashboard Analytics
- Visualizações de documentos
- Usuários ativos
- Documentos criados
- Uso de recursos

### Relatórios
- Semanal
- Mensal
- Personalizado

---

## 🔐 14. SEGURANÇA

### Autenticação
- JWT tokens
- Refresh tokens
- Sessões seguras

### Autorização
- RBAC (Role-Based Access Control)
- Permissões granulares
- RLS (Row Level Security)

### Dados
- Criptografia
- Backup automático
- Conformidade (LGPD/GDPR)

---

## 🚀 15. PRÓXIMOS PASSOS

### Implementação Imediata
1. ✅ Corrigir Landing Page (remover "Deploy to Vercel")
2. ✅ Adicionar CTAs corretos
3. ✅ Criar página de Pricing
4. ✅ Implementar Onboarding
5. ✅ Criar Dashboard

### Melhorias Futuras
- Página de Features
- Testimonials
- Blog
- Status page
- Changelog público

---

**Última atualização**: 2025-01-14

