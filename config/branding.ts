/**
 * Configuração de Branding
 * 
 * n.docs - Aplicação de documentação
 * Produtor: ness.
 * 
 * O cliente pode configurar seus dados aqui para personalizar o cabeçalho e branding.
 */

export interface ClientBranding {
  // Informações básicas
  name: string; // Nome da aplicação/documentação do cliente
  logo?: string; // Caminho para o logo (ex: /logos/client-logo.svg)
  
  // Links e contato
  website?: string; // URL do site principal
  email?: string; // Email de contato
  github?: string; // URL do GitHub
  twitter?: string; // URL do Twitter/X
  linkedin?: string; // URL do LinkedIn
  
  // Informações adicionais
  tagline?: string; // Slogan ou descrição curta
  description?: string; // Descrição completa
}

/**
 * Configuração do Cliente
 * 
 * Personalize aqui os dados que aparecerão no cabeçalho e em outras partes da aplicação.
 * 
 * Exemplo:
 * ```typescript
 * export const clientBranding: ClientBranding = {
 *   name: "Minha Documentação",
 *   logo: "/logos/minha-empresa.svg",
 *   website: "https://minhaempresa.com",
 *   email: "contato@minhaempresa.com",
 *   github: "https://github.com/minhaempresa",
 *   tagline: "Documentação técnica completa"
 * };
 * ```
 */
export const clientBranding: ClientBranding = {
  // Configure aqui os dados do cliente
  name: "n.docs", // Nome padrão, pode ser alterado pelo cliente
  // logo: "/logos/client-logo.svg", // Descomente e configure o logo
  // website: "https://exemplo.com",
  // email: "contato@exemplo.com",
  // github: "https://github.com/exemplo",
  // twitter: "https://twitter.com/exemplo",
  // linkedin: "https://linkedin.com/company/exemplo",
  // tagline: "Sua documentação aqui",
  // description: "Descrição completa da documentação"
};

/**
 * Informações do Produtor (ness.)
 * 
 * Estas informações são fixas e identificam que a aplicação foi desenvolvida pela ness.
 */
export const producerBranding = {
  name: "ness.",
  nameWithDot: "ness.",
  dotColor: "#00ade8", // Cor do ponto após "ness"
  website: "https://github.com/resper1965/ndoc",
  description: "Desenvolvido pela ness.",
  footerText: "powered by ness.",
} as const;

/**
 * Branding da Aplicação (n.docs)
 */
export const appBranding = {
  name: "n.docs",
  fullName: "n.docs",
  description: "Plataforma de documentação desenvolvida pela ness.",
  version: "0.1.0",
} as const;

/**
 * Helper para obter o nome a ser exibido
 * Se o cliente configurou um nome, usa o do cliente, senão usa "n.docs"
 */
export function getDisplayName(): string {
  return clientBranding.name || appBranding.name;
}

/**
 * Helper para obter o logo a ser exibido
 * Se o cliente configurou um logo, usa o do cliente, senão retorna null (sem logo)
 */
export function getDisplayLogo(): string | null {
  return clientBranding.logo || null;
}

