import { notFound } from 'next/navigation';
import { MDXRenderer } from '@/components/mdx-renderer';
import Breadcrumb from '@/components/bread-crumb';
import { getIndexDocument } from '@/lib/supabase/documents';

export const dynamic = 'force-dynamic';
export const dynamicParams = false;

export default async function DocsPage() {
  // Buscar documento index do Supabase
  const doc = await getIndexDocument();

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
    <div className="min-w-0 max-w-4xl">
      <Breadcrumb path="/docs" />
      <article className="prose prose-slate dark:prose-invert max-w-none">
        <h1>{doc.title}</h1>
        {doc.description && <p className="lead">{doc.description}</p>}
        <MDXRenderer source={mdxContent} frontmatter={frontmatter} />
      </article>
    </div>
  );
}

export async function generateMetadata() {
  const doc = await getIndexDocument();

  if (!doc) {
    return {
      title: 'Documentação',
    };
  }

  return {
    title: doc.title,
    description: doc.description || 'Documentação',
  };
}

