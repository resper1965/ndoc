# 📋 Guia Completo - Tela de Configuração

## Visão Geral

A tela de configuração (`/config`) é o painel central de administração da plataforma **ndocs**. Ela está organizada em **6 abas principais** que permitem gerenciar todos os aspectos do sistema.

---

## 🔐 Aba 1: Credenciais

### O que é?
Gerencia as credenciais de acesso do usuário logado ao sistema (email/usuário e senha).

### Funcionalidades:

#### 1. **Visualização de Informações Atuais**
- **Usuário Atual**: Exibe o email/usuário do usuário logado
- **Última Atualização**: Mostra quando a senha foi alterada pela última vez

#### 2. **Alteração de Credenciais**
- **Senha Atual** (obrigatório): Necessária para confirmar a identidade antes de alterar
- **Novo Usuário** (opcional): Permite alterar o email/usuário
- **Nova Senha** (opcional): Permite alterar a senha
- **Confirmar Nova Senha**: Aparece quando uma nova senha é informada

#### 3. **Aviso de Segurança**
- Se a senha padrão (`admin`) ainda estiver em uso, um aviso amarelo aparece no topo da página
- O aviso oferece um botão para ir direto à aba de Credenciais e alterar a senha

### Quando usar?
- Primeiro acesso ao sistema (alterar senha padrão)
- Esqueceu a senha e precisa redefini-la
- Quer alterar o email de acesso
- Por segurança, alterar senha periodicamente

### Importante:
- A senha atual é **obrigatória** para qualquer alteração
- A nova senha deve ter no mínimo 3 caracteres
- As senhas devem coincidir no campo de confirmação

---

## 📄 Aba 2: Documentos

### O que é?
Gerenciamento completo dos documentos MDX da plataforma. Permite criar, editar, visualizar, deletar e exportar documentos.

### Funcionalidades:

#### 1. **Autenticação para Operações**
- **Senha para Operações**: Campo obrigatório para editar, criar ou deletar documentos
- Esta senha é a mesma das credenciais de acesso

#### 2. **Lista de Documentos** (lado esquerdo)
- **Busca**: Campo de pesquisa para filtrar documentos por:
  - Caminho do arquivo
  - Título
  - Descrição
  - URL
- **Ordenação**: 
  - Por caminho (alfabética)
  - Por data (mais recente primeiro)
- **Contadores**: Mostra quantos documentos existem
- **Botões**:
  - **Novo**: Abre dialog para criar novo documento
  - **Atualizar**: Recarrega a lista de documentos

#### 3. **Visualização/Edição** (lado direito)
- **Visualização**: Mostra o conteúdo bruto do documento selecionado
- **Edição**: 
  - Editor MDX completo com preview em tempo real
  - Validação automática de sintaxe MDX
  - Botões para salvar ou cancelar
- **Informações**: Exibe o caminho do arquivo

#### 4. **Criação de Documentos**
Dialog completo com:
- **Caminho do Arquivo**: Ex: `guias/introducao` (sem `.mdx`, é adicionado automaticamente)
- **Título**: Título do documento (vai para o frontmatter)
- **Descrição**: Descrição do conteúdo (vai para o frontmatter)
- **Data**: Data de criação (vai para o frontmatter)
- **Ordem na Sidebar**: Número para ordenar na navegação (menor = primeiro)
- **Conteúdo**: Editor MDX completo
- **Templates**: Dropdown para aplicar templates pré-definidos
- **Preview do Frontmatter**: Mostra como ficará o YAML do frontmatter

#### 5. **Exportação**
- **Exportar Todos os Documentos**: Gera ZIP com todos os documentos
- **Exportar Documento Selecionado**: Gera ZIP apenas do documento atual

### Quando usar?
- Criar nova documentação
- Editar documentos existentes
- Organizar documentos (renomear, mover)
- Deletar documentos obsoletos
- Fazer backup dos documentos (exportar)
- Buscar documentos específicos

### Importante:
- A senha é obrigatória para qualquer operação de escrita (criar, editar, deletar)
- O caminho do documento define sua URL: `/docs/{caminho}`
- O frontmatter é gerado automaticamente com os campos preenchidos
- A validação MDX impede salvar documentos com erros de sintaxe

---

## 🤖 Aba 3: Inteligência Artificial

### O que é?
Configuração de temas e provedores de IA para geração e melhoria automática de documentos.

### Funcionalidades:

#### 1. **Temas de IA**
Temas definem o "estilo" e contexto que a IA usará ao gerar ou melhorar documentos.

- **Criar Tema**:
  - **Nome**: Identificador do tema (ex: "Documentação Técnica", "Tutoriais")
  - **Descrição**: Explicação do propósito do tema
  - **Prompt do Sistema**: Instruções detalhadas para a IA sobre como gerar conteúdo neste tema

- **Editar/Deletar**: Gerenciar temas existentes

#### 2. **Provedores de IA**
Configuração das APIs de IA (OpenAI ou Anthropic).

- **Criar Provedor**:
  - **Provedor**: Escolher entre `openai` ou `anthropic`
  - **API Key**: Chave de API do provedor (mascarada na visualização: `••••••••`)
  - **Modelo**: Modelo a ser usado (ex: `gpt-4`, `gpt-3.5-turbo`, `claude-3-opus`)

- **Editar/Deletar**: Gerenciar provedores existentes

### Como funciona?
1. **Geração de Documentos**: 
   - No editor MDX, há botões "Gerar com IA" e "Melhorar com IA"
   - O usuário seleciona um tema
   - A IA usa o prompt do tema + o conteúdo atual para gerar/melhorar
   - O provedor configurado é usado para fazer a chamada à API

2. **Melhoria de Documentos**:
   - Seleciona o conteúdo existente
   - Escolhe um tema
   - A IA melhora o conteúdo mantendo o contexto

### Quando usar?
- Configurar acesso às APIs de IA (OpenAI/Anthropic)
- Criar temas específicos para diferentes tipos de documentação
- Personalizar como a IA gera conteúdo para sua organização
- Gerenciar múltiplos provedores (ex: um para desenvolvimento, outro para produção)

### Importante:
- As API Keys são armazenadas de forma segura e mascaradas na interface
- Cada organização pode ter seus próprios temas e provedores
- Os temas definem o "tom" e estilo do conteúdo gerado
- É necessário ter créditos/configuração válida nas APIs externas

---

## 👥 Aba 4: Usuários

### O que é?
Gerenciamento de membros da organização, permissões e convites.

### Funcionalidades:

#### 1. **Lista de Usuários**
- Mostra todos os usuários da organização (ou todas as organizações, se superadmin)
- Informações exibidas:
  - Email
  - Nome
  - Organização
  - Função (role)
  - Data de criação

#### 2. **Criar Usuário**
- **Email**: Email do novo usuário
- **Senha**: Senha inicial
- **Nome**: Nome completo
- **Organização**: Selecionar organização (apenas superadmin)
- **Função**: Escolher entre:
  - `orgadmin`: Administrador da organização (acesso total)
  - `admin`: Administrador (gerencia usuários e documentos)
  - `editor`: Editor (pode criar/editar documentos)
  - `viewer`: Visualizador (apenas leitura)

#### 3. **Editar Usuário**
- Alterar nome, função ou organização
- Não permite alterar email (deve ser feito via Supabase Auth)

#### 4. **Deletar Usuário**
- Remove o usuário da organização
- Requer confirmação

#### 5. **Convites** (se implementado)
- Enviar convites por email
- Gerenciar convites pendentes

### Permissões:
- **Superadmin**: Pode gerenciar usuários de todas as organizações
- **Orgadmin**: Pode gerenciar usuários apenas da sua organização
- **Admin/Editor/Viewer**: Não podem gerenciar usuários

### Quando usar?
- Adicionar novos membros à organização
- Alterar permissões de usuários existentes
- Remover membros que saíram
- Organizar equipes por função

### Importante:
- Apenas superadmins e orgadmins podem acessar esta aba
- As funções definem o nível de acesso ao sistema
- Usuários podem pertencer a apenas uma organização

---

## 🛡️ Aba 5: Administração

### O que é?
Funcionalidades avançadas exclusivas para **superadministradores** do sistema.

### Funcionalidades:

#### 1. **Acesso à Página de Administração**
- Botão para acessar `/admin`
- Página dedicada para gerenciamento global do sistema

#### 2. **Gerenciamento Global** (na página `/admin`):
- **Organizações**: Criar, editar, deletar organizações
- **Usuários Globais**: Ver todos os usuários do sistema
- **Configurações do Sistema**: Configurações que afetam toda a plataforma
- **Auditoria**: Logs de ações importantes
- **Estatísticas**: Métricas globais de uso

### Permissões:
- **Apenas Superadmin**: Esta aba só aparece para usuários com permissão de superadmin
- O superadmin tem acesso total ao sistema, independente de organização

### Quando usar?
- Gerenciar organizações (criar, editar, deletar)
- Ver estatísticas globais
- Acessar logs de auditoria
- Configurar parâmetros do sistema
- Resolver problemas de acesso

### Importante:
- ⚠️ **Acesso Restrito**: Apenas superadmins podem ver e usar esta aba
- Ações aqui afetam todo o sistema, não apenas uma organização
- Use com cuidado ao fazer alterações globais

---

## 🔌 Aba 6: API

### O que é?
Documentação e referência da API REST para gerenciar documentos programaticamente.

### Funcionalidades:

#### 1. **Endpoints Documentados**
- **POST /api/ingest**: Criar ou atualizar documento
- **PUT /api/ingest**: Atualizar documento existente
- **DELETE /api/ingest**: Deletar documento
- **GET /api/ingest?list=true**: Listar todos os documentos
- **GET /api/ingest?path=xxx**: Obter conteúdo de um documento específico

#### 2. **Link para Documentação Completa**
- Botão que abre `/api/ingest-docs` em nova aba
- Documentação detalhada com exemplos de uso

### Quando usar?
- Integrar a plataforma com outros sistemas
- Automatizar criação/atualização de documentos
- Fazer scripts de migração
- Sincronizar documentos de fontes externas
- Usar CI/CD para atualizar documentação

### Exemplo de Uso:
```bash
# Criar documento
curl -X POST https://seu-dominio.com/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "path": "guias/exemplo",
    "content": "---\ntitle: Exemplo\n---\n\nConteúdo aqui",
    "username": "seu-usuario",
    "password": "sua-senha"
  }'
```

### Importante:
- Requer autenticação (username/password) em todas as requisições
- Os documentos devem estar em formato MDX válido
- O path não deve incluir a extensão `.mdx`

---

## 🔑 Superadministrador

### User ID: `d79e19b3-731a-48bc-88ca-39679c164ded`

Este usuário possui permissões de **superadministrador** na plataforma, o que significa:

- ✅ Acesso total a todas as organizações
- ✅ Pode gerenciar usuários de qualquer organização
- ✅ Acesso à aba "Administração" (`/admin`)
- ✅ Pode criar, editar e deletar organizações
- ✅ Visualiza estatísticas globais
- ✅ Acesso a logs de auditoria
- ✅ Configurações do sistema

### Como verificar se um usuário é superadmin?

O sistema verifica automaticamente se o usuário está na tabela `superadmins` do Supabase. Se estiver, todas as funcionalidades de superadmin são habilitadas.

---

## 📝 Resumo Rápido

| Aba | O que faz | Quem pode usar |
|-----|-----------|----------------|
| **Credenciais** | Altera email/senha do usuário | Todos |
| **Documentos** | Cria, edita, deleta documentos MDX | Todos (com senha) |
| **IA** | Configura temas e provedores de IA | Orgadmin+ |
| **Usuários** | Gerencia membros da organização | Orgadmin+ |
| **Administração** | Gerenciamento global do sistema | Superadmin apenas |
| **API** | Documentação da API REST | Todos |

---

## 🎯 Fluxo de Trabalho Recomendado

1. **Primeiro Acesso**:
   - Vá em **Credenciais** → Altere a senha padrão
   
2. **Configurar IA** (opcional):
   - Vá em **Inteligência Artificial** → Configure provedor (OpenAI/Anthropic)
   - Crie temas para seus tipos de documentação

3. **Criar Documentos**:
   - Vá em **Documentos** → Informe a senha → Clique em "Novo"
   - Use a IA para gerar conteúdo (se configurado)

4. **Gerenciar Equipe**:
   - Vá em **Usuários** → Adicione membros → Defina funções

5. **Administração** (se superadmin):
   - Vá em **Administração** → Gerencie organizações e sistema

---

## ❓ Dúvidas Frequentes

**P: Preciso informar a senha toda vez que edito um documento?**
R: Sim, por segurança, a senha é necessária para qualquer operação de escrita.

**P: Posso ter múltiplos provedores de IA?**
R: Sim, você pode configurar vários provedores e escolher qual usar na geração.

**P: Como faço para ser superadmin?**
R: Um superadmin existente deve adicionar seu user_id na tabela `superadmins` do Supabase.

**P: Os documentos são salvos onde?**
R: Os documentos são armazenados no Supabase Storage e gerenciados via API.

**P: Posso exportar todos os documentos?**
R: Sim, na aba Documentos há um botão "Exportar Todos os Documentos" que gera um ZIP.

---

**Última atualização**: Janeiro 2025
**Versão da plataforma**: 2.0.0

