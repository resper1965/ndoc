/**
 * Document Templates
 * 
 * Templates pré-definidos para criação de documentos
 */

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  frontmatter: {
    title: string;
    description: string;
    date?: string;
    order?: number;
  };
  content: string;
}

export const documentTemplates: DocumentTemplate[] = [
  {
    id: 'guide',
    name: 'Guia',
    description: 'Template para guias passo a passo',
    frontmatter: {
      title: 'Título do Guia',
      description: 'Descrição breve do guia',
      date: new Date().toISOString().split('T')[0],
      order: 1,
    },
    content: `# Título do Guia

## Introdução

Este guia irá ajudá-lo a...

## Pré-requisitos

Antes de começar, certifique-se de ter:

- Item 1
- Item 2
- Item 3

## Passo 1: Primeiro Passo

Descrição do primeiro passo...

\`\`\`bash
# Exemplo de comando
comando --opcao valor
\`\`\`

## Passo 2: Segundo Passo

Descrição do segundo passo...

## Conclusão

Parabéns! Você completou o guia.`,
  },
  {
    id: 'reference',
    name: 'Referência',
    description: 'Template para documentação de referência',
    frontmatter: {
      title: 'Referência da API',
      description: 'Documentação de referência completa',
      date: new Date().toISOString().split('T')[0],
      order: 1,
    },
    content: `# Referência da API

## Visão Geral

Esta documentação descreve...

## Endpoints

### GET /api/endpoint

Descrição do endpoint.

**Parâmetros:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| param1 | string | Sim | Descrição do parâmetro |

**Resposta:**

\`\`\`json
{
  "data": {},
  "status": "success"
}
\`\`\`

**Exemplo:**

\`\`\`bash
curl -X GET https://api.example.com/endpoint
\`\`\`

## Códigos de Status

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 400 | Erro na requisição |
| 500 | Erro interno |
`,
  },
  {
    id: 'tutorial',
    name: 'Tutorial',
    description: 'Template para tutoriais interativos',
    frontmatter: {
      title: 'Tutorial: Título',
      description: 'Tutorial passo a passo',
      date: new Date().toISOString().split('T')[0],
      order: 1,
    },
    content: `# Tutorial: Título

## Objetivo

Ao final deste tutorial, você será capaz de:

- Objetivo 1
- Objetivo 2
- Objetivo 3

## O que você vai aprender

- Conceito 1
- Conceito 2
- Conceito 3

## Passo a Passo

### Passo 1: Configuração Inicial

Primeiro, vamos configurar...

\`\`\`bash
# Instalar dependências
npm install
\`\`\`

### Passo 2: Implementação

Agora vamos implementar...

\`\`\`typescript
// Exemplo de código
function exemplo() {
  return 'Hello World';
}
\`\`\`

### Passo 3: Teste

Vamos testar a implementação...

## Próximos Passos

- Próximo passo 1
- Próximo passo 2

## Recursos Adicionais

- [Link 1](https://example.com)
- [Link 2](https://example.com)
`,
  },
  {
    id: 'api',
    name: 'API',
    description: 'Template para documentação de API',
    frontmatter: {
      title: 'API Documentation',
      description: 'Documentação completa da API',
      date: new Date().toISOString().split('T')[0],
      order: 1,
    },
    content: `# API Documentation

## Autenticação

Todas as requisições requerem autenticação via token.

\`\`\`bash
Authorization: Bearer YOUR_TOKEN
\`\`\`

## Base URL

\`\`\`
https://api.example.com/v1
\`\`\`

## Endpoints

### Autenticação

#### POST /auth/login

Autentica um usuário.

**Request Body:**

\`\`\`json
{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

**Response:**

\`\`\`json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "user@example.com"
  }
}
\`\`\`

### Recursos

#### GET /resources

Lista todos os recursos.

**Query Parameters:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| page | number | Número da página |
| limit | number | Itens por página |

**Response:**

\`\`\`json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
\`\`\`

## Erros

A API retorna erros no seguinte formato:

\`\`\`json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensagem de erro",
    "details": {}
  }
}
\`\`\`
`,
  },
  {
    id: 'blank',
    name: 'Em Branco',
    description: 'Documento vazio para começar do zero',
    frontmatter: {
      title: 'Novo Documento',
      description: '',
      date: new Date().toISOString().split('T')[0],
      order: 1,
    },
    content: `# Novo Documento

Comece a escrever aqui...`,
  },
];

/**
 * Obtém um template por ID
 */
export function getTemplate(id: string): DocumentTemplate | undefined {
  return documentTemplates.find((t) => t.id === id);
}

/**
 * Aplica um template ao formulário
 */
export function applyTemplate(
  template: DocumentTemplate
): {
  title: string;
  description: string;
  date: string;
  order: string;
  content: string;
} {
  return {
    title: template.frontmatter.title,
    description: template.frontmatter.description || '',
    date: template.frontmatter.date || new Date().toISOString().split('T')[0],
    order: template.frontmatter.order?.toString() || '1',
    content: template.content,
  };
}

