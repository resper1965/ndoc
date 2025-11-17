# 📖 Manual do Usuário - n.doc

> **💡 Fluxo da Aplicação:** Para entender o fluxo completo da aplicação, veja [FLUXO-APLICACAO.md](./FLUXO-APLICACAO.md)

**Versão**: 1.0.0  
**Última atualização**: 2025-01-14

---

## 📋 Índice

1. [Primeiros Passos](#primeiros-passos)
2. [Criando Documentos](#criando-documentos)
3. [Editando Documentos](#editando-documentos)
4. [Usando IA para Gerar Documentos](#usando-ia-para-gerar-documentos)
5. [Usando IA para Melhorar Documentos](#usando-ia-para-melhorar-documentos)
6. [Configurando IA](#configurando-ia)
7. [Buscando Documentos](#buscando-documentos)
8. [Gerenciando Usuários](#gerenciando-usuários)
9. [Dicas e Truques](#dicas-e-truques)
10. [Solução de Problemas](#solução-de-problemas)

---

## 🚀 Primeiros Passos

### 1. Fazer Login

1. Acesse a página de login (`/login`)
2. Digite seu email e senha
3. Clique em "Entrar"
4. Você será redirecionado para a página de configuração

### 2. Navegação

- **`/`** - Página inicial
- **`/docs`** - Visualizar documentação (público)
- **`/config`** - Centro de configuração (requer login)
- **`/login`** - Página de login

---

## 📝 Criando Documentos

### Método 1: Criar Manualmente

1. Acesse `/config`
2. Na seção "Gerenciamento de Documentos", clique em **"Novo"**
3. Preencha os campos:
   - **Caminho do Arquivo**: Ex: `guias/introducao` (sem .mdx)
   - **Título**: Título do documento
   - **Descrição**: Breve descrição
   - **Data**: Data de publicação (opcional)
   - **Ordem**: Número para ordenação na sidebar (opcional)
4. **Escolha um Template** (opcional):
   - Guia
   - Referência
   - Tutorial
   - API
   - Em Branco
5. Escreva o conteúdo no editor
6. Use o preview para visualizar
7. Clique em **"Criar Documento"**

### Método 2: Usar Template

1. Ao criar um novo documento, selecione um template no dropdown
2. O template preencherá automaticamente os campos
3. Ajuste conforme necessário
4. Salve

### Método 3: Gerar com IA

Veja a seção [Usando IA para Gerar Documentos](#usando-ia-para-gerar-documentos).

---

## ✏️ Editando Documentos

### Visualizar Documento

1. Na lista de documentos, clique no ícone de **olho** 👁️
2. O documento será exibido no painel direito
3. Você pode ver o conteúdo formatado

### Editar Documento

1. Na lista de documentos, clique no ícone de **lápis** ✏️
2. O editor será aberto no painel direito
3. Faça suas alterações
4. Use o preview para visualizar
5. Clique em **"Salvar"**

### Modos de Visualização do Editor

O editor oferece 3 modos:

- **Editor** (ícone de código): Apenas o editor
- **Split** (ícone de divisão): Editor e preview lado a lado
- **Preview** (ícone de olho): Apenas o preview

Use os botões na toolbar do editor para alternar.

---

## 🤖 Usando IA para Gerar Documentos

### Pré-requisitos

- ✅ Provedor de IA configurado (veja [Configurando IA](#configurando-ia))
- ✅ Tema de IA criado
- ✅ API Key válida

### Passo a Passo

1. **Abra o editor** (criando ou editando um documento)
2. **Clique em "Gerar com IA"** na toolbar do editor
3. **Preencha o formulário**:
   - **Tópico**: Sobre o que será o documento (ex: "Como usar React Hooks")
   - **Caminho**: Onde será salvo (ex: `react/hooks`)
   - **Tema**: Selecione um tema de IA configurado
4. **Clique em "Gerar"**
5. Aguarde alguns segundos enquanto a IA processa
6. O documento gerado aparecerá no editor
7. **Revise e ajuste** conforme necessário
8. **Salve o documento**

### Dicas

- Seja específico no tópico para melhores resultados
- Revise sempre o conteúdo gerado
- Use temas diferentes para diferentes estilos
- Combine geração com IA e edição manual

---

## ✨ Usando IA para Melhorar Documentos

### Quando Usar

- Documento precisa de mais clareza
- Adicionar exemplos e detalhes
- Melhorar formatação e estrutura
- Expandir conteúdo existente
- Corrigir erros e inconsistências

### Passo a Passo

1. **Abra um documento no editor**
2. **Clique em "Melhorar com IA"** na toolbar
3. **Configure as opções**:
   - **Tema** (opcional): Use um tema específico
   - **Instruções** (opcional): Dê instruções específicas
     - Ex: "Melhore a clareza"
     - Ex: "Adicione exemplos de código"
     - Ex: "Expanda a seção de exemplos"
4. **Clique em "Melhorar"**
5. Aguarde o processamento
6. A versão melhorada aparecerá no editor
7. **Compare** com a versão original
8. **Aceite ou rejeite** as mudanças
9. **Salve** se aceitar

### Dicas

- Use instruções específicas para melhores resultados
- Revise sempre as mudanças antes de aceitar
- Você pode melhorar múltiplas vezes
- Combine melhorias incrementais

---

## ⚙️ Configurando IA

### Quando Preciso Configurar?

Você **só precisa configurar IA** se quiser usar:
- Geração automática de documentos
- Melhoria de documentos com IA

**A aplicação funciona perfeitamente sem IA** para todas as outras funcionalidades.

### Passo 1: Configurar Provedor de IA

1. Acesse `/config`
2. Vá para a seção **"Configuração de IA"**
3. Em **"Provedores de IA"**, clique em **"Novo Provedor"**
4. Preencha:
   - **Provedor**: OpenAI ou Anthropic
   - **Modelo**: 
     - OpenAI: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
     - Anthropic: Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku
   - **API Key**: Cole sua chave de API
5. Clique em **"Salvar"**

#### Onde Obter API Keys?

- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/settings/keys

### Passo 2: Criar Tema de IA

1. Na mesma seção, em **"Temas de IA"**, clique em **"Novo Tema"**
2. Preencha:
   - **Nome**: Ex: "Documentação Técnica"
   - **Descrição**: Breve descrição do tema
   - **System Prompt**: Instruções para a IA
     - Ex: "Você é um especialista em documentação técnica. Gere documentos claros, bem estruturados e com exemplos práticos."
3. Clique em **"Salvar"**

### Exemplos de System Prompts

#### Para Documentação Técnica
```
Você é um especialista em documentação técnica. Gere documentos claros, 
bem estruturados, com exemplos de código quando apropriado. Use linguagem 
profissional mas acessível.
```

#### Para Tutoriais
```
Você é um instrutor experiente. Crie tutoriais passo a passo, com 
exemplos práticos e explicações detalhadas. Use linguagem didática e 
encorajadora.
```

#### Para Referência de API
```
Você é um especialista em documentação de APIs. Crie documentação 
precisa, com exemplos de requisições e respostas. Inclua códigos de 
erro e casos de uso.
```

### Gerenciando Configurações

- **Editar**: Clique no ícone de lápis
- **Deletar**: Clique no ícone de lixeira
- **Segurança**: As API keys são armazenadas de forma segura e nunca expostas

---

## 🔍 Buscando Documentos

### Busca Simples

1. Na lista de documentos, use a barra de busca
2. Digite qualquer termo
3. A busca procura em:
   - Título
   - Descrição
   - Caminho
   - URL

### Ordenação

Use o dropdown de ordenação:
- **Por Caminho**: Ordem alfabética
- **Por Data**: Mais recente primeiro

### Filtros

Os resultados são filtrados automaticamente conforme você digita.

---

## 👥 Gerenciando Usuários

### Criar Usuário

1. Acesse `/config`
2. Vá para **"Gerenciamento de Usuários"**
3. Clique em **"Criar Usuário"**
4. Preencha:
   - **Email**: Email do usuário
   - **Nome**: Nome completo
   - **Senha**: Senha inicial (mínimo 8 caracteres)
   - **Organização**: Selecione a organização
   - **Role**: Escolha o nível de permissão
5. Clique em **"Criar"**

### Roles e Permissões

| Role | Permissões |
|------|------------|
| **superadmin** | Acesso global a todas as organizações |
| **orgadmin** | Administrador da organização |
| **admin** | Administrador (escopo organização) |
| **editor** | Pode criar/editar documentos |
| **viewer** | Apenas leitura |

### Editar Usuário

1. Na lista de usuários, clique no ícone de lápis
2. Altere os campos desejados
3. Clique em **"Salvar"**

### Deletar Usuário

1. Na lista de usuários, clique no ícone de lixeira
2. Confirme a exclusão

---

## 💡 Dicas e Truques

### Editor

- **Atalhos**: O CodeMirror suporta atalhos padrão (Ctrl+S, Ctrl+F, etc.)
- **Preview**: Use o modo split para ver mudanças em tempo real
- **Templates**: Use templates como ponto de partida
- **Validação**: Erros de MDX são mostrados em tempo real

### IA

- **Seja específico**: Tópicos e instruções específicas geram melhores resultados
- **Itere**: Gere, revise, melhore, repita
- **Combine**: Use IA para base, edite manualmente para precisão
- **Temas**: Crie temas diferentes para diferentes estilos

### Organização

- **Caminhos**: Use estrutura de pastas lógica (ex: `guias/`, `api/`, `tutoriais/`)
- **Ordem**: Use números no campo "ordem" para controlar a sidebar
- **Descrições**: Boas descrições ajudam na busca

### Performance

- **Busca**: Use busca para encontrar documentos rapidamente
- **Filtros**: Combine busca com ordenação
- **Preview**: Preview é renderizado em tempo real, pode ser lento para documentos muito grandes

---

## 🔧 Solução de Problemas

### Erro: "Não autenticado"

**Solução**: Faça login novamente em `/login`

### Erro: "Sem permissão"

**Solução**: Verifique seu role. Contate um administrador se necessário.

### Erro ao gerar com IA: "Nenhum provedor configurado"

**Solução**: 
1. Configure um provedor de IA em `/config`
2. Verifique se a API key está correta
3. Verifique se há créditos na conta da API

### Erro ao gerar com IA: "Tema não encontrado"

**Solução**: Crie um tema de IA antes de usar a geração

### Preview não funciona

**Solução**: 
1. Verifique se o MDX está válido
2. Veja os erros de validação no editor
3. Certifique-se de que o frontmatter está correto

### Documento não aparece na lista

**Solução**:
1. Verifique se está na organização correta
2. Use a busca para encontrar
3. Verifique permissões

### API Key não funciona

**Solução**:
1. Verifique se a chave está correta
2. Verifique se há créditos na conta
3. Verifique se a chave não expirou
4. Tente criar uma nova chave

---

## 📞 Suporte

Para problemas ou dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação técnica
- Verifique os logs do sistema

---

**Última atualização**: 2025-01-14

