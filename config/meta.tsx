export const meta = {
  metadataBase: new URL('https://ndoc.vercel.app'),
  title: 'ness Documentation',
  description:
    'Documentation platform for ness projects, built with Spec-Driven Development and BMAD methodology',
  authors: [{ name: 'ness' }],
  keywords: [
    'ness',
    'documentation',
    'spec-driven development',
    'BMAD',
    'Next.js',
    'React',
    'TypeScript',
  ],
  publisher: 'ness',
  creator: 'ness',
  openGraph: {
    type: 'website',
    title: 'ness Documentation',
    description:
      'Documentation platform for ness projects, built with Spec-Driven Development and BMAD methodology.',
    images: [
      {
        url: '/og_image.png',
        width: 1200,
        height: 630,
        alt: 'ness Documentation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ness Documentation',
    description:
      'Documentation platform for ness projects, built with Spec-Driven Development and BMAD methodology.',
    images: ['/og_image.png'],
  },
  alternates: {
    canonical: 'https://ndoc.vercel.app',
  },
  robots: 'index, follow',
  hreflang: {
    en: 'https://ndoc.vercel.app',
  },
};
