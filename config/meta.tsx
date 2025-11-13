export const meta = {
  metadataBase: new URL('https://ness.com'),
  title: 'Ness - Documentação oficial',
  description:
    'Documentação oficial da Ness com guias rápidos, componentes e melhores práticas.',
  authors: [{ name: 'Ness' }],
  keywords: [
    'Ness',
    'documentação Ness',
    'template de documentação',
    'Next.js',
    'React',
    'JavaScript',
  ],
  publisher: 'Ness',
  creator: 'Ness',
  openGraph: {
    type: 'website',
    title: 'Ness - Documentação Oficial',
    description:
      'Documentação oficial da Ness construída com Next.js.',
    images: [
      {
        url: '/og_image.png',
        width: 1200,
        height: 630,
        alt: 'Documentação Ness',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image', // Type of Twitter card
    title: 'Ness - Documentação Oficial', // Twitter card title
    description:
      'Documentação oficial da Ness construída com Next.js.', // Twitter card description
    images: ['/og_image.png'], // Image used in the Twitter card
    creator: '@ness', // Twitter handle of the content creator (optional)
  },
  // SEO Enhancements
  alternates: {
    canonical: 'https://ness.com/docs', // Set the canonical URL
  },
  robots: 'index, follow', // Allows search engines to index and follow links
  // Optional: Hreflang for multilingual content (if applicable)
  hreflang: {
    en: 'https://ness.com/docs', // English version URL
    // Add more hreflang if you have other languages (example: Spanish)
    // "es": "https://ness.com/docs/es",
  },
};
