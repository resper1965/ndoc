# 📚 Guia Completo do Usuário - n.doc

**Versão:** 2.0.0  
**Para:** Usuários Leigos  
**Objetivo:** Explicar a aplicação de forma simples e detalhada

---

## 🎯 O Que É o n.doc?

**n.doc** é uma plataforma online (SaaS) que ajuda você a criar, organizar e publicar documentação técnica de forma profissional e inteligente. 

Pense nela como um "Word ou Google Docs especializado" para documentação técnica, mas com recursos avançados como:
- ✨ Editor visual moderno
- 🤖 Inteligência Artificial para gerar e melhorar documentos
- 👥 Trabalho em equipe
- 🔒 Segurança e privacidade
- 📊 Controle de uso e limites

---

## 🏢 Para Quem É Indicado?

- **Empresas** que precisam documentar produtos, processos ou APIs
- **Desenvolvedores** que querem criar documentação de código
- **Equipes de produto** que precisam manter manuais atualizados
- **Startups** que precisam documentar seus serviços
- **Qualquer pessoa** que precisa criar documentação profissional

---

## 🚀 Como Funciona? (Passo a Passo)

### 1️⃣ **Cadastro e Primeiro Acesso**

1. **Acesse o site:** https://ndocs-sigma.vercel.app
2. **Clique em "Começar Grátis"**
3. **Crie sua conta:**
   - Digite seu nome
   - Informe seu email
   - Crie uma senha segura
   - Clique em "Criar Conta"

**O que acontece:**
- Uma organização é criada automaticamente para você
- Você recebe um plano gratuito (Free) para testar
- Um wizard de onboarding te guia pelos primeiros passos

---

### 2️⃣ **Onboarding (Primeira Configuração)**

Após o cadastro, você passa por um processo simples de 4 etapas:

#### **Etapa 1: Nome da Organização**
- Dê um nome para sua organização/empresa
- Exemplo: "Minha Empresa", "Meu Projeto", etc.

#### **Etapa 2: Slug (URL Amigável)**
- Crie um identificador único para sua organização
- Exemplo: "minha-empresa", "meu-projeto"
- Isso será usado na URL da sua documentação

#### **Etapa 3: Criar Primeiro Documento**
- Crie seu primeiro documento de exemplo
- Escolha um template (Guia, Tutorial, Referência, etc.)
- Ou comece do zero

#### **Etapa 4: Pronto!**
- Você é redirecionado para o painel principal
- Pode começar a criar documentação

---

### 3️⃣ **Painel Principal (Página de Configuração)**

A página principal (`/config`) é onde você gerencia tudo:

#### **📝 Gerenciamento de Documentos**

**Ver Documentos:**
- Lista todos os seus documentos
- Busca por nome ou conteúdo
- Filtra por data ou caminho
- Visualiza em cards organizados

**Criar Novo Documento:**
1. Clique em "Criar Documento"
2. Escolha um template:
   - **Guia:** Para tutoriais passo a passo
   - **Tutorial:** Para ensinar algo
   - **Referência:** Para documentação técnica
   - **FAQ:** Para perguntas frequentes
   - **API:** Para documentar APIs
   - **Em branco:** Para começar do zero
3. Preencha os dados:
   - **Caminho:** Onde o arquivo será salvo (ex: `docs/getting-started/intro`)
   - **Título:** Título do documento
   - **Descrição:** Breve descrição
   - **Data:** Data de criação
   - **Ordem:** Ordem de exibição
4. Clique em "Criar"

**Editar Documento:**
1. Clique em um documento na lista
2. O editor abre com preview ao lado
3. Edite o conteúdo em Markdown/MDX
4. Veja o preview em tempo real
5. Clique em "Salvar" quando terminar

**Deletar Documento:**
1. Clique no ícone de lixeira
2. Confirme a exclusão
3. O documento é removido permanentemente

---

### 4️⃣ **Editor de Documentos**

O editor é a ferramenta principal para criar conteúdo:

#### **Recursos do Editor:**

**Editor de Código (Lado Esquerdo):**
- Escreva em Markdown/MDX
- Destaque de sintaxe automático
- Auto-completar
- Numeração de linhas
- Busca e substituição

**Preview (Lado Direito):**
- Visualização em tempo real
- Mostra como ficará publicado
- Atualiza automaticamente enquanto você digita

**Botões de Ação:**
- **Salvar:** Salva as alterações
- **Cancelar:** Descarta alterações
- **Validar:** Verifica se o MDX está correto

**Ações de IA (Botões no topo):**
- **Gerar com IA:** Cria conteúdo automaticamente
- **Melhorar com IA:** Melhora o conteúdo existente

---

### 5️⃣ **Recursos de Inteligência Artificial**

#### **Gerar Documento com IA:**

1. Clique em "Gerar com IA" no editor
2. Preencha o formulário:
   - **Tópico:** Sobre o que você quer escrever
   - **Tema:** Escolha um tema pré-configurado (estilo de escrita)
   - **Caminho:** Onde salvar o documento
3. Clique em "Gerar"
4. A IA cria um documento completo em segundos
5. Revise e ajuste conforme necessário

**O que a IA faz:**
- Cria estrutura completa do documento
- Adiciona frontmatter (metadados)
- Formata em Markdown
- Inclui exemplos e explicações

#### **Melhorar Documento com IA:**

1. Selecione o texto que quer melhorar
2. Clique em "Melhorar com IA"
3. Opcionalmente, adicione instruções específicas
4. A IA melhora:
   - Clareza e legibilidade
   - Gramática e ortografia
   - Estrutura e organização
   - Exemplos e detalhes

#### **Configurar Provedores de IA:**

Para usar IA, você precisa configurar um provedor:

1. Vá em "Configuração de IA" no painel
2. Clique em "Adicionar Provedor"
3. Escolha:
   - **OpenAI** (GPT-4, GPT-3.5)
   - **Anthropic** (Claude)
4. Cole sua chave de API
5. Escolha o modelo
6. Salve

**Temas de IA:**
- Crie temas personalizados
- Cada tema tem um "prompt do sistema" que define o estilo
- Exemplo: "Escreva como um tutorial técnico", "Escreva como documentação de API"

---

### 6️⃣ **Gerenciamento de Usuários**

#### **Convidar Membros da Equipe:**

1. Vá em "Gerenciamento de Usuários"
2. Clique em "Convidar Usuário"
3. Digite o email da pessoa
4. Escolha o nível de permissão:
   - **Viewer:** Só visualiza
   - **Editor:** Pode editar documentos
   - **Admin:** Pode gerenciar usuários e configurações
   - **Owner:** Dono da organização
5. Envie o convite

**Níveis de Permissão:**
- **Viewer:** Apenas leitura
- **Editor:** Pode criar e editar documentos
- **Admin:** Pode gerenciar usuários e configurações
- **Owner:** Controle total
- **Superadmin:** Acesso a todas as organizações (apenas para administradores do sistema)

#### **Gerenciar Membros:**
- Ver lista de membros
- Alterar permissões
- Remover membros
- Ver status de convites

---

### 7️⃣ **Visualizar Documentação Publicada**

#### **Acessar Documentação:**

1. Vá para `/docs` na URL
2. Ou clique em "Ver Documentação" no menu
3. Navegue pelos documentos na sidebar
4. Clique em um documento para ler

**Recursos da Visualização:**
- Sidebar com navegação
- Busca de documentos
- Modo claro/escuro
- Responsivo (funciona em celular)

---

### 8️⃣ **Planos e Limites**

A plataforma oferece 4 planos:

#### **Free (Gratuito):**
- ✅ 10 documentos
- ✅ 1 usuário
- ✅ 10 requisições de IA/mês
- ✅ 100MB de storage
- ✅ Funcionalidades básicas

#### **Starter:**
- ✅ 50 documentos
- ✅ 5 usuários
- ✅ 100 requisições de IA/mês
- ✅ 1GB de storage
- ✅ Suporte por email

#### **Professional:**
- ✅ Documentos ilimitados
- ✅ 20 usuários
- ✅ 1000 requisições de IA/mês
- ✅ 10GB de storage
- ✅ Suporte prioritário
- ✅ Temas de IA personalizados

#### **Enterprise:**
- ✅ Tudo ilimitado
- ✅ Usuários ilimitados
- ✅ Requisições de IA ilimitadas
- ✅ Storage ilimitado
- ✅ Suporte 24/7
- ✅ SLA garantido
- ✅ Recursos avançados

**Trial:**
- Novos usuários têm 14 dias de trial no plano Professional
- Após o trial, volta para o plano Free

**Limites Automáticos:**
- Quando você atinge um limite, a plataforma bloqueia automaticamente
- Exemplo: Se usar todas as requisições de IA, não pode mais gerar documentos até o próximo mês ou upgrade

---

## 🎨 Funcionalidades Detalhadas

### **1. Editor Avançado**

**O que você pode fazer:**
- Escrever em Markdown (formato simples de texto)
- Usar MDX (Markdown + componentes React)
- Ver preview em tempo real
- Validar sintaxe automaticamente
- Usar templates pré-definidos

**Formatação Suportada:**
- Títulos (#, ##, ###)
- Texto em negrito e itálico
- Listas (ordenadas e não ordenadas)
- Links e imagens
- Código (blocos e inline)
- Tabelas
- E muito mais!

### **2. Templates de Documentos**

**Templates Disponíveis:**
- **Guia:** Estrutura para tutoriais
- **Tutorial:** Passo a passo detalhado
- **Referência:** Documentação técnica
- **FAQ:** Perguntas e respostas
- **API:** Documentação de APIs
- **Em branco:** Começar do zero

**Cada template inclui:**
- Estrutura pré-definida
- Exemplos de conteúdo
- Formatação correta
- Metadados necessários

### **3. Busca e Filtros**

**Buscar Documentos:**
- Digite na barra de busca
- Busca por título, descrição ou conteúdo
- Resultados em tempo real

**Filtrar:**
- Por data (mais recente, mais antigo)
- Por caminho (organização)
- Por tipo de documento

### **4. Segurança**

**Recursos de Segurança:**
- Autenticação obrigatória
- Senhas criptografadas
- Isolamento de dados por organização
- Permissões granulares
- Logs de auditoria

**Isolamento:**
- Cada organização só vê seus próprios documentos
- Dados completamente separados
- Impossível acessar dados de outras organizações

### **5. Auditoria e Logs**

**O que é registrado:**
- Criação de documentos
- Edições de documentos
- Exclusões
- Convites de usuários
- Mudanças de permissões
- Uso de IA

**Para que serve:**
- Rastrear mudanças
- Compliance (LGPD)
- Debug de problemas
- Análise de uso

---

## 📱 Como Usar no Dia a Dia

### **Cenário 1: Criar Documentação de um Produto**

1. **Cadastre-se** na plataforma
2. **Crie sua organização** (ex: "Meu Produto")
3. **Configure IA** (adicione sua chave OpenAI/Anthropic)
4. **Crie documentos:**
   - "Introdução" (usando template Guia)
   - "Como Usar" (usando template Tutorial)
   - "API Reference" (usando template API)
5. **Use IA para gerar conteúdo:**
   - Digite o tópico
   - A IA cria o documento
   - Você revisa e ajusta
6. **Convide sua equipe:**
   - Adicione desenvolvedores como Editores
   - Adicione clientes como Viewers
7. **Publique:**
   - A documentação fica disponível em `/docs`
   - Compartilhe o link com quem precisa

### **Cenário 2: Documentar uma API**

1. **Crie um documento** com template "API"
2. **Use IA para gerar:**
   - Documentação de endpoints
   - Exemplos de requisições
   - Códigos de resposta
3. **Edite manualmente:**
   - Adicione detalhes específicos
   - Inclua exemplos reais
   - Ajuste formatação
4. **Organize:**
   - Crie seções (Autenticação, Endpoints, Erros)
   - Use links entre documentos
   - Mantenha estrutura clara

### **Cenário 3: Trabalho em Equipe**

1. **Crie a organização** da empresa
2. **Convide membros:**
   - Gerente de Produto → Admin
   - Desenvolvedores → Editors
   - Clientes → Viewers
3. **Defina responsabilidades:**
   - Cada pessoa edita sua área
   - Admins revisam mudanças
   - Viewers apenas leem
4. **Colabore:**
   - Todos veem as mudanças em tempo real
   - Histórico de edições
   - Comentários e discussões (futuro)

---

## 💡 Dicas e Boas Práticas

### **Organização:**
- Use caminhos lógicos: `docs/getting-started/`, `docs/api/`, etc.
- Mantenha nomes descritivos
- Use datas para versionamento

### **Conteúdo:**
- Seja claro e objetivo
- Use exemplos práticos
- Mantenha atualizado
- Revise antes de publicar

### **IA:**
- Use para gerar rascunhos
- Sempre revise o conteúdo gerado
- Ajuste para seu contexto específico
- Combine geração automática com edição manual

### **Equipe:**
- Defina permissões adequadas
- Use convites para adicionar pessoas
- Monitore uso e limites
- Mantenha organização limpa

---

## ❓ Perguntas Frequentes

### **Preciso saber programar?**
Não! O editor é visual e você pode usar templates. Mas conhecimento básico de Markdown ajuda.

### **Posso usar sem IA?**
Sim! A IA é opcional. Você pode criar documentos manualmente.

### **Meus dados estão seguros?**
Sim! Dados são isolados por organização e criptografados. Seguimos LGPD.

### **Posso exportar meus documentos?**
Os documentos são salvos em formato MDX (Markdown), que é texto simples e portável.

### **Quanto custa?**
Comece grátis! Planos pagos começam em valores acessíveis. Veja os planos na plataforma.

### **Posso cancelar a qualquer momento?**
Sim! Não há fidelidade. Cancele quando quiser.

### **Funciona no celular?**
Sim! A interface é responsiva e funciona em qualquer dispositivo.

---

## 🎓 Glossário de Termos

- **MDX:** Formato que combina Markdown com componentes React
- **Markdown:** Formato de texto simples para formatação
- **Frontmatter:** Metadados no início do documento (título, data, etc.)
- **Template:** Modelo pré-definido de documento
- **Slug:** Identificador único na URL
- **Organização:** Espaço de trabalho isolado
- **RBAC:** Controle de acesso baseado em funções (permissões)
- **API:** Interface de programação (como conectar sistemas)
- **SaaS:** Software como Serviço (uso online, sem instalação)

---

## 🚀 Próximos Passos

1. **Cadastre-se** em https://ndocs-sigma.vercel.app
2. **Complete o onboarding**
3. **Crie seu primeiro documento**
4. **Explore os recursos de IA**
5. **Convide sua equipe**
6. **Comece a documentar!**

---

## 📞 Suporte

- **Documentação:** `/docs` na plataforma
- **Email:** (verificar na plataforma)
- **GitHub:** https://github.com/resper1965/ndoc

---

**Última atualização:** 2025-11-17  
**Versão do Guia:** 1.0

