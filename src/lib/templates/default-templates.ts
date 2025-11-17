/**
 * Templates padrão para Políticas, Procedimentos e Manuais
 * Baseados na estrutura definida no migration-plan.md
 */

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'policy' | 'procedure' | 'manual';
  description: string;
  templateContent: string;
  metadataSchema: Record<string, any>;
  isDefault: boolean;
}

/**
 * Template de Política
 */
export const POLICY_TEMPLATE: DocumentTemplate = {
  id: 'default-policy',
  name: 'Template de Política',
  type: 'policy',
  description: 'Template padrão para políticas organizacionais',
  isDefault: true,
  metadataSchema: {
    title: { type: 'string', required: true },
    category: { type: 'string', enum: ['RH', 'Financeiro', 'TI', 'Operacional'], required: true },
    version: { type: 'string', default: '1.0' },
    effective_date: { type: 'date', required: true },
    review_date: { type: 'date' },
    approver: { type: 'string' },
    status: { type: 'string', enum: ['Ativa', 'Rascunho', 'Revogada'], default: 'Rascunho' },
  },
  templateContent: `---
title: "{{title}}"
type: policy
category: "{{category}}"
version: "{{version}}"
effective_date: "{{effective_date}}"
review_date: "{{review_date}}"
approver: "{{approver}}"
status: "{{status}}"
---

# {{title}}

## Objetivo

[Descreva o objetivo desta política]

## Escopo

[Defina o escopo e a quem se aplica esta política]

## Definições

[Defina termos importantes usados nesta política]

| Termo | Definição |
|-------|-----------|
| Termo 1 | Definição 1 |
| Termo 2 | Definição 2 |

## Política

[Descreva a política em detalhes]

## Responsabilidades

[Defina quem é responsável pelo quê]

| Função | Responsabilidade |
|--------|------------------|
| Função 1 | Responsabilidade 1 |
| Função 2 | Responsabilidade 2 |

## Conformidade

[Descreva como garantir conformidade com esta política]

## Referências

[Links para documentos relacionados]

- [Documento relacionado 1](#)
- [Documento relacionado 2](#)

## Histórico de Revisões

| Data | Versão | Mudanças | Autor |
|------|--------|----------|-------|
| {{effective_date}} | {{version}} | Criação inicial | {{approver}} |
`,
};

/**
 * Template de Procedimento
 */
export const PROCEDURE_TEMPLATE: DocumentTemplate = {
  id: 'default-procedure',
  name: 'Template de Procedimento',
  type: 'procedure',
  description: 'Template padrão para procedimentos operacionais',
  isDefault: true,
  metadataSchema: {
    title: { type: 'string', required: true },
    category: { type: 'string', enum: ['RH', 'Financeiro', 'TI', 'Operacional'], required: true },
    version: { type: 'string', default: '1.0' },
    effective_date: { type: 'date', required: true },
    owner: { type: 'string', required: true },
    status: { type: 'string', enum: ['Ativo', 'Rascunho', 'Desativado'], default: 'Rascunho' },
  },
  templateContent: `---
title: "{{title}}"
type: procedure
category: "{{category}}"
version: "{{version}}"
effective_date: "{{effective_date}}"
owner: "{{owner}}"
status: "{{status}}"
---

# {{title}}

## Objetivo

[Descreva o objetivo deste procedimento]

## Escopo

[Defina quando aplicar este procedimento]

## Responsáveis

[Liste quem executa cada etapa]

| Etapa | Responsável |
|-------|-------------|
| Etapa 1 | Responsável 1 |
| Etapa 2 | Responsável 2 |

## Materiais Necessários

[Lista de materiais, ferramentas ou recursos necessários]

- Material 1
- Material 2
- Ferramenta 1

## Passo a Passo

### Passo 1: [Nome do Passo]

1. [Ação específica]
2. [Ação específica]
3. [Ação específica]

**Resultado esperado**: [Descreva o resultado esperado]

### Passo 2: [Nome do Passo]

1. [Ação específica]
2. [Ação específica]

**Resultado esperado**: [Descreva o resultado esperado]

## Fluxograma

[Diagrama do processo - opcional]

\`\`\`mermaid
graph TD
    A[Início] --> B[Passo 1]
    B --> C[Passo 2]
    C --> D[Fim]
\`\`\`

## Exceções

[Descreva situações excepcionais e como lidar com elas]

## Referências

[Links para políticas, procedimentos ou documentos relacionados]

- [Política relacionada](#)
- [Procedimento relacionado](#)

## Histórico de Revisões

| Data | Versão | Mudanças | Autor |
|------|--------|----------|-------|
| {{effective_date}} | {{version}} | Criação inicial | {{owner}} |
`,
};

/**
 * Template de Manual
 */
export const MANUAL_TEMPLATE: DocumentTemplate = {
  id: 'default-manual',
  name: 'Template de Manual',
  type: 'manual',
  description: 'Template padrão para manuais de documentação',
  isDefault: true,
  metadataSchema: {
    title: { type: 'string', required: true },
    category: { type: 'string', enum: ['Onboarding', 'Sistema', 'Processo'], required: true },
    version: { type: 'string', default: '1.0' },
    target_audience: { type: 'string', enum: ['Novos funcionários', 'Usuários do sistema', 'Equipe'], required: true },
    status: { type: 'string', enum: ['Ativo', 'Rascunho'], default: 'Rascunho' },
  },
  templateContent: `---
title: "{{title}}"
type: manual
category: "{{category}}"
version: "{{version}}"
target_audience: "{{target_audience}}"
status: "{{status}}"
---

# {{title}}

## Introdução

[Contexto e propósito do manual]

Este manual foi criado para [público-alvo] com o objetivo de [objetivo].

## Índice

1. [Seção 1](#secao-1)
2. [Seção 2](#secao-2)
3. [Seção 3](#secao-3)

## Seção 1

### Subseção 1.1

[Conteúdo da subseção]

### Subseção 1.2

[Conteúdo da subseção]

## Seção 2

[Conteúdo da seção]

## Seção 3

[Conteúdo da seção]

## Glossário

| Termo | Definição |
|-------|-----------|
| Termo 1 | Definição 1 |
| Termo 2 | Definição 2 |
| Termo 3 | Definição 3 |

## FAQ

**P: Pergunta frequente 1?**  
R: Resposta para a pergunta 1.

**P: Pergunta frequente 2?**  
R: Resposta para a pergunta 2.

## Recursos Adicionais

[Links para recursos externos, vídeos, tutoriais, etc.]

- [Recurso 1](#)
- [Recurso 2](#)

## Contato

[Como obter ajuda ou suporte]

- Email: [email]
- Telefone: [telefone]
- Chat: [link do chat]
`,
};

/**
 * Lista de todos os templates padrão
 */
export const DEFAULT_TEMPLATES: DocumentTemplate[] = [
  POLICY_TEMPLATE,
  PROCEDURE_TEMPLATE,
  MANUAL_TEMPLATE,
];

/**
 * Obtém template padrão por tipo
 */
export function getDefaultTemplate(
  type: 'policy' | 'procedure' | 'manual'
): DocumentTemplate | null {
  return DEFAULT_TEMPLATES.find((t) => t.type === type) || null;
}

