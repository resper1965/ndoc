export const meta = {
  metadataBase: new URL('https://ness.dev'),
  title: 'Ness - Documentação',
  description:
    'Uma plataforma de documentação personalizável construída com Next.js',
  authors: [{ name: 'Ness' }],
  keywords: [
    'Ness',
    'documentação',
    'template',
    'Next.js',
    'React',
    'JavaScript',
  ],
  publisher: 'Ness',
  creator: 'Ness',
  openGraph: {
    type: 'website',
    title: 'Ness - Plataforma de Documentação',
    description:
      'Uma plataforma de documentação personalizável construída com Next.js.',
    images: [
      {
        url: '/og_image.png',
        width: 1200,
        height: 630,
        alt: 'Ness Plataforma de Documentação',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ness - Plataforma de Documentação',
    description:
      'Uma plataforma de documentação personalizável construída com Next.js.',
    images: ['/og_image.png'],
    creator: '@ness',
  },
  // SEO Enhancements
  alternates: {
    canonical: 'https://ness.dev',
  },
  robots: 'index, follow',
  // Optional: Hreflang for multilingual content (if applicable)
  hreflang: {
    'pt-BR': 'https://ness.dev',
  },
};
