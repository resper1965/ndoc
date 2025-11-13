# ness Documentation Constitution

## Core Principles

### I. Design System First
Toda interface deve seguir rigorosamente o design system ness. Paleta de cores: backgrounds slate-950 a slate-100, acentos primários #00ade8 apenas em elementos de destaque (CTAs, links, badges). Tipografia: Inter (corpo) e Montserrat (títulos grandes), com line-height 1.625 (corpo) e 1.25 (títulos). Espaçamento baseado em múltiplos de 4px. Princípio "Invisível quando funciona, Presente quando importa" deve guiar todas as decisões de UI.

### II. Spec-Driven Development (NON-NEGOTIABLE)
Todo desenvolvimento de features deve seguir o fluxo BMAD via Spec Kit: `/speckit.constitution` → `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`. Artefatos gerados (constitution, spec, plan, tasks) devem estar acessíveis na documentação e versionados. Nenhuma implementação deve começar sem especificação aprovada.

### III. Context7 Library Registry (MANDATORY)
Antes de buscar documentação de bibliotecas via Context7, sempre verificar `library.md` para IDs já disponíveis. Novas bibliotecas devem ser registradas imediatamente após uso. O arquivo `library.md` é a fonte única de verdade para rastreamento de dependências externas.

### IV. Acessibilidade e Performance (NON-NEGOTIABLE)
Todas as páginas devem alcançar Lighthouse ≥ 90 em Performance e Accessibility. Navegação deve ser totalmente acessível via teclado, com ARIA labels apropriados. Animações devem ser sutis e não invasivas. Layout deve permanecer funcional sem JavaScript (progressive enhancement).

### V. Sem Marcas Comerciais na Interface
A interface não deve mencionar nomes comerciais de ferramentas (Wazuh, Zabbix, Shuffle, etc.). Usar termos genéricos: SIEM para Wazuh, Monitoring para Zabbix, SOAR para Shuffle. Toda interface deve estar em inglês (English first).

### VI. Simplicidade e Manutenibilidade
Prefira soluções simples e diretas. Evite over-engineering. Código deve ser autoexplicativo. Documentação inline quando necessário, mas código limpo é preferível a comentários excessivos. YAGNI (You Aren't Gonna Need It) aplicado rigorosamente.

## Technology Stack Constraints

- **Frontend**: Next.js 15+ (App Router), React 19+, TypeScript 5+
- **Styling**: Tailwind CSS 4+ com tokens customizados para paleta ness
- **Content**: MDX via Contentlayer2 para documentação
- **Deployment**: Vercel (preview) com pipeline corporativo ness (futuro)
- **Package Manager**: pnpm (lockfile obrigatório)

## Quality Gates

### Pre-commit
- `pnpm lint` deve passar sem erros
- `pnpm type-check` deve passar sem erros
- Prettier deve formatar automaticamente

### Pre-deploy
- Lighthouse audit: Performance ≥ 90, Accessibility ≥ 90
- Todas as páginas MDX devem renderizar sem erros
- Links internos devem ser validados (sem 404s)

### Code Review
- Compliance com constituição verificada
- Especificação Spec Kit atualizada se houver mudanças de escopo
- `library.md` atualizado se novas dependências Context7 foram usadas

## Development Workflow

1. **Especificação**: Criar feature branch via `create-new-feature.sh`, preencher `spec.md` com user stories priorizadas
2. **Planejamento**: Executar `/speckit.plan` com stack técnico definido, gerar `plan.md` e `research.md`
3. **Tarefas**: Executar `/speckit.tasks` para gerar breakdown executável
4. **Implementação**: Executar `/speckit.implement` ou implementar manualmente seguindo `tasks.md`
5. **Validação**: Rodar quality gates, atualizar documentação, criar PR

## Governance

Esta constituição supera todas as outras práticas e decisões de design. Alterações requerem:
- Documentação da mudança proposta
- Justificativa técnica e de negócio
- Plano de migração se aplicável
- Aprovação via PR review

Complexidade adicional deve ser justificada na seção "Complexity Tracking" do `plan.md`. Violações não justificadas serão rejeitadas em code review.

**Version**: 1.0.0 | **Ratified**: 2025-11-13 | **Last Amended**: 2025-11-13
