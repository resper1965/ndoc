# Estudo Profundo: Fluxo de Uso e UX/UI da Aplicação ndocs

**Data:** 2025-01-17
**Versão:** 1.0
**Status:** Análise Completa

---

## Sumário Executivo

Este documento apresenta uma análise profunda dos problemas de fluxo, navegação e UX/UI identificados na aplicação ndocs, com propostas de melhorias que **mantêm os princípios fundamentais do Pinexio**: interface de visualização similar, sidebar de navegação, layout com conteúdo MDX renderizado, e experiência de documentação técnica.

**Diagnóstico Principal:** A aplicação sofre de **fragmentação de funcionalidades** e **falta de hierarquia clara**, resultando em uma experiência confusa onde o usuário não sabe onde está nem para onde ir.

---

## Parte 1: Análise do Estado Atual

### 1.1 Mapa de Rotas Atual

```
/                     → Landing Page (OK)
/login                → Login (OK)
/signup               → Cadastro (OK)
/forgot-password      → Recuperar senha (OK)
/reset-password       → Redefinir senha (OK)
/onboarding           → Onboarding simplificado (PROBLEMAS)
/docs                 → Área de documentação (CONFUSA)
/docs/[...slug]       → Visualização de documento (OK)
/config               → Configurações (SOBRECARREGADA)
/admin                → Admin (DUPLICADO)
/terms                → Termos de uso (OK)
/privacy              → Privacidade (OK)
```

### 1.2 Problemas Críticos Identificados

#### PROBLEMA 1: Ausência de Dashboard
**Severidade: CRÍTICA**

O documento `FLUXO-APLICACAO.md` especifica um Dashboard em `/dashboard` como central de controle, mas **não existe**. O usuário é jogado diretamente em `/docs` após login.

**Impacto:**
- Sem visão geral de métricas
- Sem acesso rápido às ações principais
- Sem noção do estado da organização
- Usuário perdido após login

---

#### PROBLEMA 2: /config Sobrecarregada
**Severidade: ALTA**

A página `/config` acumula 6 tabs com responsabilidades muito diferentes:

```
Credenciais     → Gerenciar senha
Templates       → Gerenciar templates
IA              → Configurar provedores/temas
Usuários        → Gerenciar membros
Administração   → Superadmin
API             → Documentação da API
```

**Impacto:**
- Cognitive overload
- Difícil encontrar o que precisa
- Mistura configuração técnica com gestão diária
- Não há separação entre "usar" e "configurar"

---

#### PROBLEMA 3: Gestão de Documentos Invisível
**Severidade: CRÍTICA**

**Onde criar/editar documentos?**
- Não está claro na UI
- Não há botão "Criar Documento" visível
- O componente `DocsActions` existe mas está escondido
- Upload de documentos está em `/config` (confuso)

**Fluxo atual para criar documento:**
```
/docs → ver empty state → clicar "Criar Primeiro Documento" → /config → ???
```

O usuário é redirecionado para `/config` mas não sabe qual tab usar!

---

#### PROBLEMA 4: Navegação Fragmentada
**Severidade: ALTA**

Existem **3 headers diferentes** dependendo da página:
1. Landing page: header com Recursos/Preços/Docs
2. /config: header com Início/Documentação/Configurações
3. /docs: usa SidebarLayout do Pinexio

**Impacto:**
- Inconsistência visual
- Usuário não sabe como voltar
- Navegação não é previsível

---

#### PROBLEMA 5: Onboarding Superficial
**Severidade: MÉDIA**

O onboarding atual tem apenas 2 passos:
1. Nome da organização
2. Concluir

**O que falta (conforme FLUXO-APLICACAO.md):**
- Configurar IA
- Convidar membros
- Criar primeiro documento
- Tour guiado

---

#### PROBLEMA 6: Busca Semântica Escondida
**Severidade: ALTA**

O RAG e busca semântica estão implementados, mas:
- Não há UI visível para usar
- O componente `SemanticSearchDialog` existe mas não está integrado
- O `SearchButton` atual faz busca básica, não semântica

---

#### PROBLEMA 7: Fluxo de Criação de Documento Quebrado
**Severidade: CRÍTICA**

Não existe um fluxo claro para:
```
Quero criar documento → Onde clico? → Como edito? → Onde vejo?
```

Componentes existentes mas desconectados:
- `DocumentEditor` - editor avançado
- `DocumentUpload` - upload de arquivos
- `AIActions` - geração com IA
- `DocsActions` - ações em documentos

---

#### PROBLEMA 8: Sidebar Dinâmica vs Estática
**Severidade: MÉDIA**

O Pinexio usa sidebar estática em `config/sidebar.tsx`. O ndocs deveria gerar automaticamente do banco, mas:
- Não está claro como os documentos aparecem na sidebar
- Hierarquia baseada em `path` não é explicada
- Usuário não sabe como organizar documentos

---

### 1.3 Análise de Fluxos de Usuário

#### Fluxo 1: Novo Usuário (Primeiro Acesso)
```
ATUAL:
Landing → Signup → Onboarding (2 passos) → /docs (empty state) → /config → ???

ESPERADO (conforme FLUXO-APLICACAO.md):
Landing → Signup → Onboarding (4 passos completos) → Dashboard → Criar primeiro doc
```

**Problemas:**
- Onboarding não guia configuração
- Sem dashboard para orientação
- Empty state redireciona para /config sem contexto

---

#### Fluxo 2: Criar Documento
```
ATUAL:
/docs → empty state → "Criar" → /config → ??? (não há tab de documentos visível!)

ESPERADO:
Dashboard → "Criar Documento" → Editor → Preview → Salvar → Ver em /docs
```

**Problemas:**
- Não existe botão "Criar Documento" acessível
- Usuário não sabe que precisa ir em /config
- Não há tab "Documentos" - só Templates, API...

---

#### Fluxo 3: Editar Documento Existente
```
ATUAL:
/docs/[slug] → DocumentActions (ícone pequeno) → ??? (modal? nova página?)

ESPERADO:
/docs/[slug] → "Editar" → Editor inline ou página dedicada → Salvar
```

**Problemas:**
- Ícone de ação é pequeno e pouco visível
- Não está claro o que acontece ao clicar
- Falta feedback visual

---

#### Fluxo 4: Buscar Informação
```
ATUAL:
Ctrl+K → SearchDialog → busca básica por texto

ESPERADO:
Ctrl+K → SemanticSearchDialog → busca semântica → resultados rankeados → navegar
```

**Problemas:**
- Busca semântica implementada mas não integrada
- RAG disponível mas sem UI

---

#### Fluxo 5: Configurar IA
```
ATUAL:
/config → tab "Inteligência Artificial" → configurar provedor → configurar tema

CORRETO (funciona)
```

---

#### Fluxo 6: Gerenciar Equipe
```
ATUAL:
/config → tab "Usuários" → gerenciar membros

CORRETO (funciona, mas deveria estar em local mais acessível)
```

---

## Parte 2: Princípios do Pinexio a Manter

### 2.1 Princípios Fundamentais

Baseado no documento `.specify/pinexio-comparison.md`:

1. **Interface de Visualização Similar**
   - ✅ Sidebar à esquerda
   - ✅ Conteúdo no centro
   - ✅ TOC à direita (opcional)
   - ✅ Header com logo e branding

2. **Componentes MDX**
   - ✅ next-mdx-remote para renderização
   - ✅ Syntax highlighting
   - ✅ Componentes reutilizáveis (FolderTree, CodeTabs, etc.)

3. **Experiência de Documentação**
   - ✅ Navegação por sidebar
   - ✅ Busca
   - ✅ Dark/Light mode
   - ✅ Responsivo

### 2.2 O Que Deve Ser Diferente (e Melhor)

1. **Gestão via Interface Web** (não código)
   - Criar documentos sem editar arquivos
   - Sidebar gerada automaticamente
   - Upload e conversão de formatos

2. **Recursos de IA**
   - Geração de documentos
   - Melhoria de conteúdo
   - Busca semântica
   - RAG para perguntas

3. **Multi-tenancy e Colaboração**
   - Organizações isoladas
   - Roles e permissões
   - Convites por email

---

## Parte 3: Proposta de Reestruturação

### 3.1 Nova Arquitetura de Navegação

```
┌─────────────────────────────────────────────────────────────┐
│                    NOVA ESTRUTURA DE ROTAS                   │
└─────────────────────────────────────────────────────────────┘

PÚBLICAS (sem auth):
├── /                    → Landing Page
├── /login               → Login
├── /signup              → Cadastro
├── /forgot-password     → Recuperar senha
├── /terms               → Termos
└── /privacy             → Privacidade

PROTEGIDAS (com auth):
├── /app                 → Dashboard (NOVO)
│   ├── /app/documents   → Gestão de Documentos (NOVO)
│   │   ├── /app/documents/new      → Criar documento
│   │   └── /app/documents/[id]/edit → Editar documento
│   ├── /app/team        → Gestão de Equipe (MOVIDO de /config)
│   └── /app/settings    → Configurações
│       ├── credentials  → Credenciais
│       ├── ai           → IA
│       ├── templates    → Templates
│       └── api          → API
│
├── /docs                → Visualização de Documentação (PINEXIO)
│   └── /docs/[...slug]  → Documento específico
│
├── /search              → Busca Semântica (NOVO)
│
├── /admin               → Administração (superadmin)
│
└── /onboarding          → Onboarding (melhorado)
```

### 3.2 Separação Clara de Responsabilidades

#### Área de USO (/docs)
**Propósito:** Visualizar e consumir documentação
**Interface:** Layout Pinexio (sidebar + conteúdo + TOC)
**Público:** Todos os usuários autenticados

Funcionalidades:
- Navegar pela documentação
- Buscar documentos
- Ler conteúdo renderizado
- Ações rápidas (editar, compartilhar)

---

#### Área de GESTÃO (/app)
**Propósito:** Administrar documentos e configurações
**Interface:** Dashboard moderno com cards e listas
**Público:** Editores e administradores

Funcionalidades:
- Dashboard com métricas
- Criar/editar documentos
- Gerenciar equipe
- Configurar IA
- Ver uso e limites

---

### 3.3 Novo Fluxo de Usuário

#### Primeiro Acesso (Novo Usuário)
```
1. Landing Page (/)
   └── CTA "Começar Grátis"

2. Signup (/signup)
   └── Criar conta

3. Onboarding (/onboarding) - 4 PASSOS
   ├── Passo 1: Organização
   │   └── Nome e slug
   ├── Passo 2: Configurar IA (opcional)
   │   └── Selecionar provedor, API key
   ├── Passo 3: Primeiro Documento
   │   └── Criar, upload ou template
   └── Passo 4: Convidar Equipe (opcional)
       └── Emails dos membros

4. Dashboard (/app)
   └── Visão geral + próximos passos

5. Documentação (/docs)
   └── Ver documento criado
```

---

#### Criar Documento (Usuário Existente)
```
OPÇÃO A: Via Dashboard
1. /app (Dashboard)
2. Clicar "Novo Documento"
3. /app/documents/new
4. Escolher: Criar do zero | Upload | Gerar com IA
5. Editor com preview
6. Salvar
7. Visualizar em /docs/[path]

OPÇÃO B: Via Documentação
1. /docs
2. Botão "+" flutuante ou no header
3. Modal ou redirect para /app/documents/new
4. Mesmo fluxo acima
```

---

#### Editar Documento
```
1. /docs/[slug]
2. Clicar "Editar" (botão visível)
3. /app/documents/[id]/edit
4. Editor com conteúdo atual
5. Salvar
6. Voltar para /docs/[slug]
```

---

#### Buscar Informação
```
1. Qualquer página
2. Ctrl+K ou clicar na busca
3. Modal de busca semântica
4. Digitar pergunta
5. Ver resultados rankeados por relevância
6. Clicar para navegar
7. (Opcional) Perguntar ao chatbot RAG
```

---

### 3.4 Componentes de UI Propostos

#### 1. Header Unificado
```tsx
// Usar em todas as páginas /app/*
<AppHeader>
  <Logo />
  <Navigation>
    <NavItem href="/app">Dashboard</NavItem>
    <NavItem href="/app/documents">Documentos</NavItem>
    <NavItem href="/docs">Ver Docs</NavItem>
  </Navigation>
  <Actions>
    <SearchButton /> // Abre SemanticSearchDialog
    <NotificationBell />
    <UserMenu />
  </Actions>
</AppHeader>
```

---

#### 2. Dashboard (/app)
```tsx
<Dashboard>
  {/* Métricas */}
  <MetricsGrid>
    <MetricCard title="Documentos" value={45} trend="+3" />
    <MetricCard title="Membros" value={5} />
    <MetricCard title="Storage" value="2.3 GB" max="10 GB" />
    <MetricCard title="Uso IA" value={120} max={500} />
  </MetricsGrid>

  {/* Ações Rápidas */}
  <QuickActions>
    <ActionButton icon={Plus} href="/app/documents/new">
      Novo Documento
    </ActionButton>
    <ActionButton icon={Upload} href="/app/documents/new?mode=upload">
      Upload
    </ActionButton>
    <ActionButton icon={Sparkles} href="/app/documents/new?mode=ai">
      Gerar com IA
    </ActionButton>
    <ActionButton icon={UserPlus} href="/app/team/invite">
      Convidar
    </ActionButton>
  </QuickActions>

  {/* Documentos Recentes */}
  <RecentDocuments>
    <DocumentCard doc={doc} />
    ...
  </RecentDocuments>

  {/* Atividade */}
  <ActivityFeed>
    <ActivityItem>João editou "Política de Férias"</ActivityItem>
    ...
  </ActivityFeed>
</Dashboard>
```

---

#### 3. Gestão de Documentos (/app/documents)
```tsx
<DocumentsPage>
  <PageHeader>
    <Title>Documentos</Title>
    <Actions>
      <Button href="/app/documents/new">Novo Documento</Button>
    </Actions>
  </PageHeader>

  {/* Filtros */}
  <Filters>
    <SearchInput placeholder="Buscar documentos..." />
    <Select options={['Todos', 'Publicados', 'Rascunhos']} />
    <Select options={['Mais recentes', 'Alfabético', 'Mais vistos']} />
  </Filters>

  {/* Lista/Grid */}
  <DocumentGrid>
    {documents.map(doc => (
      <DocumentCard
        key={doc.id}
        title={doc.title}
        description={doc.description}
        path={doc.path}
        status={doc.status}
        updatedAt={doc.updatedAt}
        actions={
          <>
            <ActionButton icon={Eye} href={`/docs/${doc.path}`}>Ver</ActionButton>
            <ActionButton icon={Edit} href={`/app/documents/${doc.id}/edit`}>Editar</ActionButton>
            <ActionButton icon={Trash} onClick={() => deleteDoc(doc.id)}>Excluir</ActionButton>
          </>
        }
      />
    ))}
  </DocumentGrid>

  <Pagination />
</DocumentsPage>
```

---

#### 4. Editor de Documento (/app/documents/[id]/edit)
```tsx
<DocumentEditor>
  <EditorHeader>
    <BackButton href="/app/documents" />
    <TitleInput value={title} onChange={setTitle} />
    <Actions>
      <Button variant="ghost" onClick={saveDraft}>Salvar Rascunho</Button>
      <Button variant="primary" onClick={publish}>Publicar</Button>
    </Actions>
  </EditorHeader>

  <EditorBody>
    {/* Sidebar de Metadados */}
    <EditorSidebar>
      <Field label="Caminho (URL)">
        <Input value={path} onChange={setPath} />
      </Field>
      <Field label="Descrição">
        <Textarea value={description} />
      </Field>
      <Field label="Tipo">
        <Select options={['policy', 'procedure', 'manual', 'other']} />
      </Field>
      <Field label="Status">
        <Select options={['draft', 'published']} />
      </Field>

      <Divider />

      <AIActions>
        <Button icon={Sparkles} onClick={improveWithAI}>
          Melhorar com IA
        </Button>
        <Button icon={Wand} onClick={generateWithAI}>
          Gerar Seção
        </Button>
      </AIActions>
    </EditorSidebar>

    {/* Editor Principal */}
    <EditorMain>
      <TabBar>
        <Tab active={mode === 'edit'}>Editar</Tab>
        <Tab active={mode === 'preview'}>Preview</Tab>
        <Tab active={mode === 'split'}>Split</Tab>
      </TabBar>

      {mode === 'edit' && <CodeMirrorEditor value={content} onChange={setContent} />}
      {mode === 'preview' && <MDXPreview content={content} />}
      {mode === 'split' && (
        <SplitView>
          <CodeMirrorEditor value={content} onChange={setContent} />
          <MDXPreview content={content} />
        </SplitView>
      )}
    </EditorMain>
  </EditorBody>
</DocumentEditor>
```

---

#### 5. Busca Semântica Integrada
```tsx
// Acessível via Ctrl+K em qualquer página
<SemanticSearchDialog open={open} onClose={onClose}>
  <SearchInput
    value={query}
    onChange={setQuery}
    placeholder="Pergunte algo ou busque um documento..."
  />

  {/* Tabs */}
  <Tabs>
    <Tab>Documentos</Tab>
    <Tab>Perguntar (RAG)</Tab>
  </Tabs>

  {/* Resultados de Busca */}
  {activeTab === 'documentos' && (
    <SearchResults>
      {results.map(result => (
        <SearchResultItem
          key={result.chunkId}
          title={result.documentTitle}
          excerpt={result.content}
          similarity={result.similarity}
          path={result.documentPath}
          onClick={() => navigate(`/docs/${result.documentPath}`)}
        />
      ))}
    </SearchResults>
  )}

  {/* RAG Chatbot */}
  {activeTab === 'rag' && (
    <RAGChat>
      <ChatMessages messages={messages} />
      <ChatInput onSend={sendQuestion} />
      <Sources sources={sources} />
    </RAGChat>
  )}
</SemanticSearchDialog>
```

---

### 3.5 Área de Documentação (/docs) - Mantendo Pinexio

A área `/docs` **mantém o layout do Pinexio** mas com melhorias:

```tsx
<DocsLayout>
  {/* Sidebar (gerada automaticamente do banco) */}
  <Sidebar>
    <SidebarHeader>
      <Logo />
      <SearchButton />
    </SidebarHeader>

    <SidebarNav>
      {/* Gerado dinamicamente dos documentos */}
      {sections.map(section => (
        <SidebarSection key={section.id} title={section.title} icon={section.icon}>
          {section.items.map(item => (
            <SidebarItem
              key={item.id}
              href={`/docs/${item.path}`}
              active={currentPath === item.path}
            >
              {item.title}
            </SidebarItem>
          ))}
        </SidebarSection>
      ))}
    </SidebarNav>

    <SidebarFooter>
      <UserMenu />
      <ModeToggle />
    </SidebarFooter>
  </Sidebar>

  {/* Conteúdo Principal */}
  <Main>
    <DocHeader>
      <Breadcrumb path={currentPath} />
      <DocActions>
        <Button icon={Edit} href={`/app/documents/${docId}/edit`}>Editar</Button>
        <Button icon={Share}>Compartilhar</Button>
      </DocActions>
    </DocHeader>

    <Article>
      <MDXRenderer source={content} />
    </Article>

    <DocFooter>
      <PrevNext prev={prevDoc} next={nextDoc} />
      <LastUpdated date={updatedAt} />
    </DocFooter>
  </Main>

  {/* TOC (opcional, para docs longos) */}
  <TOC headings={headings} />
</DocsLayout>
```

---

### 3.6 Geração Automática de Sidebar

A sidebar deve ser gerada automaticamente baseada nos documentos:

```typescript
// src/lib/sidebar/generate-sidebar.ts

interface SidebarSection {
  title: string;
  icon: string;
  items: SidebarItem[];
}

interface SidebarItem {
  title: string;
  path: string;
  order: number;
}

export async function generateSidebar(organizationId: string): Promise<SidebarSection[]> {
  const supabase = await createClient();

  // Buscar documentos publicados
  const { data: documents } = await supabase
    .from('documents')
    .select('id, path, title, document_type, order_index')
    .eq('organization_id', organizationId)
    .eq('status', 'published')
    .order('order_index');

  // Agrupar por tipo/seção
  const sections: Record<string, SidebarItem[]> = {
    policies: [],
    procedures: [],
    manuals: [],
    other: [],
  };

  for (const doc of documents || []) {
    const section = doc.document_type || 'other';
    sections[section].push({
      title: doc.title,
      path: doc.path,
      order: doc.order_index,
    });
  }

  // Mapear para formato de sidebar
  return [
    {
      title: 'Políticas',
      icon: 'FileText',
      items: sections.policies.sort((a, b) => a.order - b.order),
    },
    {
      title: 'Procedimentos',
      icon: 'ListChecks',
      items: sections.procedures.sort((a, b) => a.order - b.order),
    },
    {
      title: 'Manuais',
      icon: 'Book',
      items: sections.manuals.sort((a, b) => a.order - b.order),
    },
    // ... outros
  ].filter(section => section.items.length > 0);
}
```

---

## Parte 4: Detalhamento das Melhorias

### 4.1 Dashboard - Especificação Completa

**Rota:** `/app`

**Componentes:**
```
src/app/app/page.tsx                    → Página principal
src/components/dashboard/
  ├── metrics-grid.tsx                  → Grid de métricas
  ├── metric-card.tsx                   → Card individual
  ├── quick-actions.tsx                 → Ações rápidas
  ├── recent-documents.tsx              → Docs recentes
  ├── activity-feed.tsx                 → Feed de atividade
  └── usage-chart.tsx                   → Gráfico de uso
```

**Métricas a Exibir:**
- Total de documentos
- Documentos este mês (trend)
- Membros da equipe
- Storage usado / limite
- Requisições IA usadas / limite

**Ações Rápidas:**
- Novo Documento
- Upload
- Gerar com IA
- Convidar Membro
- Ver Docs

---

### 4.2 Gestão de Documentos - Especificação Completa

**Rotas:**
- `/app/documents` - Lista de documentos
- `/app/documents/new` - Criar novo
- `/app/documents/[id]/edit` - Editar existente

**Funcionalidades:**

1. **Listagem**
   - Grid ou lista (toggle)
   - Filtros: status, tipo, busca
   - Ordenação: data, nome, tipo
   - Paginação
   - Bulk actions (deletar múltiplos)

2. **Criação**
   - Do zero (editor vazio)
   - Upload (PDF, DOCX, etc)
   - Template (escolher template)
   - IA (gerar com prompt)

3. **Edição**
   - Editor MDX (CodeMirror)
   - Preview em tempo real
   - Metadados (path, título, descrição)
   - Ações IA (melhorar, expandir)
   - Auto-save (draft)
   - Publicar/despublicar

4. **Ações por Documento**
   - Ver em /docs
   - Editar
   - Duplicar
   - Exportar (MD, PDF)
   - Deletar
   - Histórico de versões

---

### 4.3 Onboarding Melhorado - Especificação Completa

**Rota:** `/onboarding`

**Passos:**

1. **Bem-vindo**
   - Mensagem personalizada
   - O que esperar
   - Tempo estimado: 3 minutos

2. **Organização**
   - Nome da organização
   - Slug (auto-gerado)
   - Logo (opcional)

3. **Configurar IA** (opcional, pode pular)
   - Selecionar provedor (OpenAI/Anthropic)
   - API Key
   - Testar conexão

4. **Primeiro Documento**
   - 3 opções:
     - Criar do zero
     - Usar template
     - Fazer upload
   - Editor simplificado

5. **Convidar Equipe** (opcional, pode pular)
   - Adicionar emails
   - Selecionar roles
   - Enviar convites

6. **Conclusão**
   - Resumo do que foi feito
   - Próximos passos
   - Links úteis
   - CTA para Dashboard

**Persistência:**
- Salvar progresso no localStorage
- Permitir retomar de onde parou
- Mostrar progresso (barra ou steps)

---

### 4.4 Busca Semântica - Especificação Completa

**Ativação:**
- `Ctrl+K` / `Cmd+K`
- Botão de busca no header
- `/search` (página dedicada opcional)

**Modos:**

1. **Busca de Documentos**
   - Input de texto
   - Resultados em tempo real
   - Ordenados por similaridade
   - Snippet do conteúdo relevante
   - Click para navegar

2. **Perguntas (RAG)**
   - Input de pergunta
   - Processamento (loading)
   - Resposta gerada
   - Fontes citadas
   - Click nas fontes

**UI:**
```tsx
<SearchDialog>
  <Input placeholder="Busque ou pergunte..." />

  <Tabs value={mode}>
    <Tab value="search">Buscar</Tab>
    <Tab value="ask">Perguntar</Tab>
  </Tabs>

  {mode === 'search' && <SearchResults results={results} />}
  {mode === 'ask' && <RAGResponse answer={answer} sources={sources} />}
</SearchDialog>
```

---

### 4.5 Header Unificado - Especificação Completa

**Área de Gestão (/app/*):**
```tsx
<Header>
  <Logo href="/" />

  <Nav>
    <NavLink href="/app" icon={Home}>Dashboard</NavLink>
    <NavLink href="/app/documents" icon={FileText}>Documentos</NavLink>
    <NavLink href="/app/team" icon={Users}>Equipe</NavLink>
    <NavLink href="/docs" icon={Book}>Ver Docs</NavLink>
  </Nav>

  <Actions>
    <SearchButton /> {/* Abre SemanticSearchDialog */}
    <Button href="/app/documents/new" icon={Plus}>Novo</Button>
    <ModeToggle />
    <UserMenu>
      <MenuItem href="/app/settings">Configurações</MenuItem>
      <MenuItem onClick={logout}>Sair</MenuItem>
    </UserMenu>
  </Actions>
</Header>
```

**Área de Docs (/docs/*):**
Mantém header do Pinexio dentro da sidebar.

---

## Parte 5: Plano de Implementação

### Fase 1: Fundação (1 semana)

**Objetivo:** Criar estrutura base da área de gestão

**Tarefas:**
- [ ] Criar layout `/app` com header unificado
- [ ] Implementar página de Dashboard básica
- [ ] Criar rotas `/app/documents`, `/app/team`, `/app/settings`
- [ ] Migrar conteúdo de `/config` para `/app/settings`
- [ ] Criar redirects de `/config` → `/app/settings`

**Entregáveis:**
- ✅ Nova estrutura de rotas funcionando
- ✅ Dashboard com layout (sem métricas ainda)
- ✅ Navegação consistente

---

### Fase 2: Gestão de Documentos (2 semanas)

**Objetivo:** Fluxo completo de criação/edição de documentos

**Tarefas:**
- [ ] Implementar `/app/documents` (listagem)
- [ ] Implementar `/app/documents/new` (criação)
- [ ] Implementar `/app/documents/[id]/edit` (edição)
- [ ] Integrar DocumentEditor existente
- [ ] Integrar DocumentUpload existente
- [ ] Integrar AIActions existente
- [ ] Criar fluxo de publicação

**Entregáveis:**
- ✅ CRUD completo de documentos via UI
- ✅ Upload funcionando
- ✅ Geração com IA funcionando
- ✅ Preview em tempo real

---

### Fase 3: Dashboard Completo (1 semana)

**Objetivo:** Métricas e ações rápidas

**Tarefas:**
- [ ] Implementar MetricsGrid com dados reais
- [ ] Implementar QuickActions
- [ ] Implementar RecentDocuments
- [ ] Implementar ActivityFeed (se houver audit_logs)
- [ ] Criar componente de uso/limites

**Entregáveis:**
- ✅ Dashboard informativo
- ✅ Ações rápidas funcionando
- ✅ Visão geral da organização

---

### Fase 4: Busca Semântica UI (1 semana)

**Objetivo:** Integrar busca semântica e RAG na UI

**Tarefas:**
- [ ] Implementar SemanticSearchDialog completo
- [ ] Integrar com API `/api/search/semantic`
- [ ] Integrar com API `/api/rag/query`
- [ ] Implementar tabs (Buscar/Perguntar)
- [ ] Adicionar atalho Ctrl+K global
- [ ] Estilizar resultados e respostas

**Entregáveis:**
- ✅ Busca semântica acessível
- ✅ RAG chatbot funcionando
- ✅ Navegação pelos resultados

---

### Fase 5: Onboarding Completo (1 semana)

**Objetivo:** Guiar novos usuários adequadamente

**Tarefas:**
- [ ] Redesenhar `/onboarding` com 5-6 passos
- [ ] Implementar configuração de IA no onboarding
- [ ] Implementar criação de primeiro documento
- [ ] Implementar convite de membros
- [ ] Adicionar persistência e progresso
- [ ] Criar tour guiado pós-onboarding

**Entregáveis:**
- ✅ Onboarding completo e guiado
- ✅ Usuário configurado ao final
- ✅ Experiência fluida

---

### Fase 6: Polish e Testes (1 semana)

**Objetivo:** Refinar UX e garantir qualidade

**Tarefas:**
- [ ] Revisar todos os fluxos
- [ ] Adicionar loading states
- [ ] Adicionar empty states
- [ ] Adicionar error handling
- [ ] Testes E2E dos fluxos principais
- [ ] Ajustes de responsividade
- [ ] Documentar novos fluxos

**Entregáveis:**
- ✅ Aplicação polida
- ✅ Fluxos testados
- ✅ Documentação atualizada

---

## Parte 6: Resumo das Mudanças

### O Que Muda

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Pós-login** | → /docs | → /app (Dashboard) |
| **Criar documento** | /config → ??? | /app/documents/new |
| **Editar documento** | Escondido | /app/documents/[id]/edit |
| **Configurações** | /config (6 tabs) | /app/settings (organizado) |
| **Equipe** | /config → tab Usuários | /app/team |
| **Busca** | Básica | Semântica + RAG |
| **Onboarding** | 2 passos | 5-6 passos completos |

### O Que NÃO Muda (Pinexio)

- ✅ Layout de /docs (sidebar + conteúdo + TOC)
- ✅ Componentes MDX
- ✅ Renderização com next-mdx-remote
- ✅ Dark/Light mode
- ✅ Responsividade
- ✅ Navegação por sidebar em /docs

---

## Conclusão

Este estudo identifica problemas críticos de UX/UI na aplicação ndocs e propõe uma reestruturação que:

1. **Mantém os princípios do Pinexio** para visualização de documentação
2. **Separa claramente** USO (ver docs) de GESTÃO (administrar)
3. **Cria Dashboard** como central de controle
4. **Organiza fluxos** de criação e edição de documentos
5. **Integra busca semântica e RAG** na experiência do usuário
6. **Melhora onboarding** para guiar novos usuários

**Tempo Total Estimado:** 7-8 semanas

**Prioridade de Implementação:**
1. Fundação (estrutura /app) - CRÍTICO
2. Gestão de Documentos - CRÍTICO
3. Dashboard Completo - ALTO
4. Busca Semântica UI - ALTO
5. Onboarding Completo - MÉDIO
6. Polish e Testes - MÉDIO

---

**Documento preparado para:** Equipe de Desenvolvimento ndocs
**Próximo passo:** Validar proposta e iniciar Fase 1

---

## Anexo: Checklist de Implementação

### Fase 1: Fundação
- [ ] `src/app/app/layout.tsx` - Layout com AppHeader
- [ ] `src/app/app/page.tsx` - Dashboard page
- [ ] `src/app/app/documents/page.tsx` - Documents list
- [ ] `src/app/app/team/page.tsx` - Team management
- [ ] `src/app/app/settings/page.tsx` - Settings (migrado)
- [ ] `src/components/app-header.tsx` - Header unificado
- [ ] Redirects de `/config` → `/app/settings`

### Fase 2: Gestão de Documentos
- [ ] `src/app/app/documents/new/page.tsx`
- [ ] `src/app/app/documents/[id]/edit/page.tsx`
- [ ] `src/components/documents/document-list.tsx`
- [ ] `src/components/documents/document-form.tsx`
- [ ] `src/components/documents/document-editor-page.tsx`
- [ ] Integrar `DocumentEditor`, `DocumentUpload`, `AIActions`

### Fase 3: Dashboard
- [ ] `src/components/dashboard/metrics-grid.tsx`
- [ ] `src/components/dashboard/quick-actions.tsx`
- [ ] `src/components/dashboard/recent-documents.tsx`
- [ ] `src/components/dashboard/activity-feed.tsx`
- [ ] APIs para métricas

### Fase 4: Busca Semântica
- [ ] `src/components/semantic-search-dialog.tsx` (melhorar)
- [ ] Integrar Ctrl+K global
- [ ] Tab de RAG/Perguntar
- [ ] Estilização de resultados

### Fase 5: Onboarding
- [ ] Redesenhar `src/app/onboarding/page.tsx`
- [ ] Componentes de cada passo
- [ ] Persistência no localStorage
- [ ] Tour guiado

### Fase 6: Polish
- [ ] Loading states em todas as páginas
- [ ] Empty states
- [ ] Error boundaries
- [ ] Testes E2E
- [ ] Atualizar documentação
