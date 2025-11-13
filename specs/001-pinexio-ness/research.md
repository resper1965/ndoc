# Research: Pinexio Customization for ness Documentation

## Technology Stack Analysis

### Current Stack (Pinexio Base)
- **Next.js**: 15.2.4 (App Router)
- **React**: 19.0.0
- **TypeScript**: 5.x
- **Tailwind CSS**: 4.1.3 (beta)
- **Contentlayer2**: 0.5.4 (MDX processing)
- **Package Manager**: pnpm (lockfile: pnpm-lock.yaml)

### Dependencies Audit
- **UI Components**: @radix-ui/themes 3.2.1, lucide-react 0.476.0
- **Styling**: tailwind-merge 3.0.2, class-variance-authority 0.7.1
- **Theming**: next-themes 0.4.4 (dark/light mode)
- **Animations**: framer-motion 12.5.0 (usar com moderação conforme constituição)
- **Syntax Highlighting**: react-syntax-highlighter 15.6.1, rehype-highlight 7.0.2

### Tailwind CSS 4 Considerations
- Tailwind 4 usa nova engine CSS-first (sem PostCSS plugins tradicionais)
- Configuração via `@tailwindcss/postcss` plugin
- Suporte a CSS variables nativas para temas
- Compatibilidade com `tailwind.config.js` mantida para extensões

## Design System ness - Token Mapping

### Color Palette
```css
/* Backgrounds (slate scale) */
--slate-950: #0f172a
--slate-900: #1e293b
--slate-800: #334155
--slate-700: #475569
--slate-600: #64748b
--slate-500: #94a3b8
--slate-400: #cbd5e1
--slate-300: #e2e8f0
--slate-200: #f1f5f9
--slate-100: #f8fafc

/* Primary Accent */
--primary-500: #00ade8
--primary-400: #33bdec
--primary-600: #0088b8
```

### Typography
- **Primary Font**: Inter (Google Fonts) - corpo de texto
- **Heading Font**: Montserrat (Google Fonts) - títulos H1-H3
- **Line Heights**: 
  - Corpo: 1.625 (relaxed)
  - Títulos: 1.25 (tight)
- **Scale Base**: 4px (espaçamento, tamanhos)

### Spacing System
Base: 4px
- 1 unit = 4px
- 2 units = 8px
- 4 units = 16px
- 8 units = 32px
- 16 units = 64px

## Pinexio Structure Analysis

### Key Files to Modify
1. `config/sidebar.tsx` - Adicionar seção Spec-Driven Development
2. `config/meta.tsx` - Atualizar metadata para ness branding
3. `tailwind.config.js` - Adicionar tokens de cor e tipografia ness
4. `src/app/layout.tsx` - Trocar Geist por Inter/Montserrat
5. `src/app/globals.css` - Definir CSS variables para paleta

### Content Structure
- `docs/` - MDX files (Contentlayer2 indexa automaticamente)
- `docs/specs/` - Nova pasta para artefatos Spec Kit
- `docs/library/` - Nova pasta para Context7 registry

## Accessibility Requirements

### WCAG 2.1 AA Compliance
- Contraste mínimo 4.5:1 para texto normal
- Contraste mínimo 3:1 para texto grande (18pt+)
- Navegação via teclado (Tab, Enter, Esc)
- ARIA labels em elementos interativos
- Focus indicators visíveis

### Keyboard Navigation
- Sidebar: Tab para navegar, Enter para expandir/recolher
- Links: Enter para ativar
- Modais: Esc para fechar, Tab para navegar dentro

## Performance Targets

### Lighthouse Goals
- Performance: ≥ 90
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 90

### Optimization Strategies
- Lazy loading de imagens
- Code splitting automático (Next.js)
- Font optimization (next/font)
- CSS minification (Tailwind 4)

## Integration Points

### Spec Kit Integration
- Artefatos em `.specify/memory/` e `specs/`
- Scripts em `.specify/scripts/bash/`
- Templates em `.specify/templates/`

### Context7 Integration
- Registry em `library.md` (raiz do projeto)
- Página de visualização em `docs/library/index.mdx`
- Processo: verificar `library.md` → buscar ID → usar → atualizar registry

## Migration Notes

### Breaking Changes from Pinexio
- Remoção de conteúdo hardcoded (components, customization, getting-started)
- Substituição de fontes (Geist → Inter/Montserrat)
- Nova paleta de cores (slate + #00ade8)
- Estrutura de navegação expandida (Spec Kit section)

### Backward Compatibility
- Estrutura MDX mantida (Contentlayer2 continua funcionando)
- Componentes Radix UI mantidos (apenas estilização alterada)
- API de navegação mantida (apenas conteúdo expandido)

