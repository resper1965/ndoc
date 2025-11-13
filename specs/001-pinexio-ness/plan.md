# Implementation Plan: Pinexio Customization for ness Documentation

**Branch**: `001-pinexio-ness` | **Date**: 2025-11-13 | **Spec**: `/specs/001-pinexio-ness/spec.md`
**Input**: Feature specification from `/specs/001-pinexio-ness/spec.md`

## Summary

Customizar o template Pinexio para refletir a identidade visual da ness, integrar os artefatos gerados via Spec Kit diretamente na navegação da documentação e consolidar o registro de bibliotecas Context7. O trabalho mantém a base Next.js 15 + Tailwind CSS 4 do Pinexio, garantindo acessibilidade, responsividade e alinhamento com o padrão BMAD.

## Technical Context

**Language/Version**: TypeScript (Next.js 15, Node.js ≥ 18)  
**Primary Dependencies**: Next.js 15, Tailwind CSS 4, Contentlayer, MDX, shadcn/ui (avaliar dependências existentes)  
**Storage**: N/A (conteúdo estático MDX)  
**Testing**: `pnpm lint`, `pnpm type-check` (configurar CI posteriormente)  
**Target Platform**: Vercel (preview) + integração futura com pipeline ness  
**Project Type**: Web documentation (Next.js App Router)  
**Performance Goals**: Lighthouse ≥ 90 em Performance & Accessibility na home e nas páginas Spec Kit  
**Constraints**: Sem animações invasivas; garantir dark/light theme coerente com paleta slate; manter layout funcional offline (fallback data)  
**Scale/Scope**: Documentação corporativa com crescimento incremental (até 50 páginas MDX + assets estáticos)

## Constitution Check

- Constituição do projeto ainda não registrada. **Ação**: executar `/speckit.constitution` para definir princípios (qualidade de código, acessibilidade, governança Context7, exclusão de marcas comerciais na UI) antes de iniciar fase de implementação.  
- GATE: sem constituição aprovada, validações de qualidade ficam bloqueadas.

## Project Structure

### Documentation (this feature)

```text
specs/001-pinexio-ness/
├── plan.md            # Este arquivo
├── research.md        # (criar ao mapear referências Pinexio + Ness DS)
├── data-model.md      # (definir entidades de conteúdo + relacionamentos)
├── quickstart.md      # (orientar setup dev para fluxo BMAD)
├── contracts/         # (incluir se houver integrações externas)
└── tasks.md           # (será gerado via /speckit.tasks)
```

### Source Code (repository root)

```text
config/
  navigation.ts        # Sidebar groups e ordem dos itens
  theme.ts             # Tokens de cor, tipografia, motion (ajustar para paleta ness)

docs/
  index.mdx            # Home placeholder – será atualizado com conteúdo customizado
  specs/               # Novos MDX para constitution/spec/plan/tasks
  library/             # Nova pasta para registry Context7 (a criar)

public/
  assets/branding/     # Logotipos ness (criar pasta e otimizar SVG/WEBP)

src/
  app/
    layout.tsx         # Ajustar fontes, cores, metadata
    page.tsx           # Home; aplicar layout "invisível quando funciona"
  components/
    sidebar/           # Tornar recolhível com acessibilidade reforçada
    typography/        # Tokens de tipografia alinhados à Montserrat/Inter
  lib/contentlayer.ts  # Reprocessar sources após novos caminhos

tsconfig.json / tailwind.config.js / contentlayer.config.ts  # Atualizar paths e aliases conforme novas pastas
```

**Structure Decision**: Manter estrutura web única (Next.js) e criar subpastas dedicadas a conteúdos Spec Kit dentro de `docs/`, preservando a ergonomia do Pinexio.

## Implementation Phases

### Phase 0 – Pesquisa & Setup
- Auditar dependências atuais (`pnpm install`, `pnpm lint`) e registrar na `research.md` versões aprovadas (inclusive Tailwind 4 beta).
- Rodar `/speckit.constitution` para formalizar princípios (acessibilidade, Context7, sem marcas comerciais, uso do design system ness).
- Atualizar `library.md` com IDs Context7 já conhecidos (verificar arquivo existente no repositório). Definir owner responsável por manter lista.

### Phase 1 – Design System & Navegação
- Atualizar `config/theme.ts` com tokens ness (slate backgrounds, azul #00ade8 em CTAs/badges, tipografia Inter/Montserrat).
- Ajustar `tailwind.config.js` para refletir tokens e espaçamentos base 4px.
- Implementar comportamento recolhível acessível na sidebar (`src/components/sidebar`). Verificar breakpoints e atributos ARIA.
- Criar assets de branding em `public/assets/branding` seguindo regra: logotipo ness com ponto final em #00ade8.

### Phase 2 – Integração Spec Kit
- Criar diretório `docs/specs/` contendo páginas MDX para `constitution`, `spec`, `plan`, `tasks`, referenciando arquivos reais do fluxo Spec Kit.
- Atualizar `config/navigation.ts` adicionando grupo "Spec-Driven Development" com links para os MDX criados.
- Ajustar `contentlayer.config.ts` para indexar novo subgrupo e expor campos necessários (e.g., `category`, `order`).
- Implementar componentes MDX (cards/resumos) para destacar status de cada artefato (Draft/Approved).

### Phase 3 – Context7 Registry & QA
- Criar página `docs/library/index.mdx` exibindo tabela com IDs/descrições do Context7, alinhada ao `library.md` do repositório.
- Automatizar validação básica via script (ex: verificar duplicidades no `library.md`). Registrar roteiro em `tasks.md` após `/speckit.tasks`.
- Executar `pnpm lint`, `pnpm type-check` e Lighthouse manual (desktop/mobile) garantindo metas SC-001..SC-004.

## Complexity Tracking

Nenhuma complexidade adicional identificada além do escopo padrão web. Caso novas integrações MCP sejam adicionadas, revisar esta seção e justificar.
