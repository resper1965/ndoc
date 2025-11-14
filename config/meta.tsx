import { clientBranding, appBranding, producerBranding } from './branding';

const displayName = clientBranding.name || appBranding.name;
const displayDescription = clientBranding.description || clientBranding.tagline || 
  'Plataforma de documentação desenvolvida pela ness.';

export const meta = {
  metadataBase: new URL('https://github.com/resper1965/ndoc'),
  title: `${displayName} - Documentação`,
  description: displayDescription,
  authors: [{ name: clientBranding.name || producerBranding.name }],
  keywords: [
    'n.doc',
    'ness',
    'documentação',
    'documentation',
    'documentation-platform',
    'Next.js',
    'React',
    'MDX',
    'Supabase',
    'AI',
  ],
  publisher: producerBranding.name,
  creator: producerBranding.name,
  openGraph: {
    type: 'website',
    title: `${displayName} - Documentação`,
    description: displayDescription,
    images: [
      {
        url: '/og_image.png',
        width: 1200,
        height: 630,
        alt: `${displayName} - Documentação`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${displayName} - Documentação`,
    description: displayDescription,
    images: ['/og_image.png'],
  },
  alternates: {
    canonical: clientBranding.website || 'https://github.com/resper1965/ndoc',
  },
  robots: 'index, follow',
  hreflang: {
    'pt-BR': clientBranding.website || 'https://github.com/resper1965/ndoc',
  },
};
