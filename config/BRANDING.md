# 🎨 Configuração de Branding - n.doc

## Visão Geral

**n.doc** é uma plataforma de documentação desenvolvida pela **ness.**

O cliente pode personalizar seus dados (nome, logo, links) que aparecerão no cabeçalho e em outras partes da aplicação, mantendo **ness.** como produtor/desenvolvedor.

---

## 📝 Como Configurar

### 1. Editar `config/branding.ts`

Abra o arquivo `config/branding.ts` e configure os dados do cliente:

```typescript
export const clientBranding: ClientBranding = {
  name: "Minha Documentação", // Nome que aparece no cabeçalho
  logo: "/logos/minha-empresa.svg", // Logo do cliente
  website: "https://minhaempresa.com",
  email: "contato@minhaempresa.com",
  github: "https://github.com/minhaempresa",
  twitter: "https://twitter.com/minhaempresa",
  linkedin: "https://linkedin.com/company/minhaempresa",
  tagline: "Documentação técnica completa",
  description: "Descrição completa da documentação"
};
```

### 2. Adicionar Logo

1. Coloque o logo em `/public/logos/`
2. Configure o caminho em `clientBranding.logo`
3. Formatos suportados: SVG, PNG, JPG

**Exemplo:**
```typescript
logo: "/logos/minha-empresa.svg"
```

### 3. Campos Disponíveis

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `name` | string | Sim | Nome da aplicação/documentação |
| `logo` | string | Não | Caminho para o logo |
| `website` | string | Não | URL do site principal |
| `email` | string | Não | Email de contato |
| `github` | string | Não | URL do GitHub |
| `twitter` | string | Não | URL do Twitter/X |
| `linkedin` | string | Não | URL do LinkedIn |
| `tagline` | string | Não | Slogan ou descrição curta |
| `description` | string | Não | Descrição completa |

---

## 🎯 Onde os Dados Aparecem

### Cabeçalho (Header)
- Logo do cliente (ou padrão ness. se não configurado)
- Nome do cliente (ou "n.doc" se não configurado)

### Sidebar
- Logo no topo
- Nome no topo
- Tagline no footer da sidebar

### Página Principal (`/`)
- Logo grande
- Nome grande
- Tagline/descrição
- Botão GitHub (se `github` configurado)

### Meta Tags (SEO)
- Título da página
- Descrição
- Open Graph
- Twitter Cards

### Footer
- Texto "Built with ❤️ by ness." (fixo, identifica o produtor)

---

## 📋 Exemplo Completo

```typescript
// config/branding.ts
export const clientBranding: ClientBranding = {
  name: "API Documentation",
  logo: "/logos/api-docs.svg",
  website: "https://api.exemplo.com",
  email: "dev@exemplo.com",
  github: "https://github.com/exemplo/api-docs",
  twitter: "https://twitter.com/exemplo",
  linkedin: "https://linkedin.com/company/exemplo",
  tagline: "Documentação completa da API REST",
  description: "Guia completo para desenvolvedores sobre como usar nossa API REST, incluindo autenticação, endpoints, exemplos e boas práticas."
};
```

**Resultado:**
- Cabeçalho mostra "API Documentation" com logo customizado
- Sidebar mostra "API Documentation" com tagline
- Botão GitHub aparece no header (link para repositório)
- Meta tags usam "API Documentation" e descrição
- Footer continua mostrando "Built with ❤️ by ness."

---

## 🔧 Valores Padrão

Se o cliente não configurar nada:

- **Nome**: "n.doc"
- **Logo**: Logo da ness. (`/logos/ness.svg`)
- **Tagline**: "Plataforma de documentação desenvolvida pela ness."
- **GitHub**: Não aparece (botão oculto)
- **Footer**: "Built with ❤️ by ness." (sempre visível)

---

## 🎨 Branding da ness. (Produtor)

As informações do produtor são fixas e identificam que a aplicação foi desenvolvida pela **ness.**:

- **Nome**: "ness."
- **Cor do ponto**: #00ade8
- **Footer**: "Built with ❤️ by ness."
- **Publisher/Creator**: "ness." (nas meta tags)

---

## 📝 Notas Importantes

1. **Produtor sempre visível**: O footer sempre mostra "Built with ❤️ by ness." para identificar o produtor
2. **Fallback inteligente**: Se o cliente não configurar algo, usa valores padrão
3. **SEO**: Meta tags usam dados do cliente quando disponíveis
4. **Logo**: Se não configurado, usa logo padrão da ness.

---

## 🚀 Próximos Passos

Após configurar o branding:

1. Adicione seu logo em `/public/logos/`
2. Edite `config/branding.ts`
3. Teste localmente: `pnpm dev`
4. Verifique se tudo aparece corretamente
5. Deploy!

---

**Desenvolvido pela ness.** 🚀

