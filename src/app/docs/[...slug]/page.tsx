import { notFound } from 'next/navigation';
import { MDXRenderer } from '@/components/mdx-renderer';
import Breadcrumb from '@/components/bread-crumb';
import { getDocumentByPath } from '@/lib/supabase/documents';
import { DocumentActions } from '@/components/document-actions';

type tParams = Promise<{ slug: string[] }>;

export const dynamic = 'force-dynamic';
export const dynamicParams = true; // Permitir rotas dinâmicas

// generateStaticParams removido - usando renderização dinâmica com Supabase
// Os documentos são buscados em runtime do Supabase

export const generateMetadata = async ({ params }: { params: tParams }) => {
  // Join the slug array back into a path string
  const awaitedParams = await params;
  const path = awaitedParams.slug.join('/');
  const doc = await getDocumentByPath(path);

  if (!doc) {
    return {
      title: 'Documento não encontrado',
    };
  }

  return {
    title: doc.title,
    description: doc.description || 'Documentação detalhada sobre o tópico.',
    openGraph: {
      title: doc.title,
      description: doc.description || 'Documentação detalhada sobre o tópico.',
    },
  };
};

const DocsPage = async ({ params }: { params: tParams }) => {
  const awaitedParams = await params;
  // Join the slug array back into a path string
  const path = awaitedParams.slug.join('/');

  // Handle empty slug or index (should be handled by /docs/page.tsx)
  if (!path || path === 'index') {
    notFound();
  }

  const doc = await getDocumentByPath(path);

  if (!doc) {
    notFound();
  }

  // Reconstruir conteúdo MDX com frontmatter
  const frontmatter = doc.frontmatter || {};
  const frontmatterString = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key}: "${value}"`;
      }
      return `${key}: ${value}`;
    })
    .join('\n');

  const mdxContent = `---\n${frontmatterString}\n---\n\n${doc.content}`;

  return (
    <div className={`grid xl:grid xl:grid-cols-[1fr_270px]`}>
      <article className="overflow-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Breadcrumb path={doc.url} />
            <DocumentActions
              documentPath={doc.path || path}
              documentContent={mdxContent}
              documentTitle={doc.title}
            />
          </div>
        </div>
        <MDXRenderer source={mdxContent} frontmatter={frontmatter} />
      </article>
    </div>
  );
};

export default DocsPage;
