import { MDXRenderer } from '@/components/mdx-renderer';
import Breadcrumb from '@/components/bread-crumb';
import { getIndexDocument, getAllDocuments } from '@/lib/supabase/documents';
import Link from 'next/link';
import { Button } from '@/components/button';
import { FileText, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const dynamicParams = false;

export default async function DocsPage() {
  // Buscar documento index do Supabase
  const doc = await getIndexDocument();
  
  // Se não houver documento index, verificar se há outros documentos
  if (!doc) {
    const allDocs = await getAllDocuments();
    
    // Se não houver nenhum documento, mostrar página vazia
    if (allDocs.length === 0) {
      return (
        <div className="min-w-0 max-w-4xl mx-auto">
          <Breadcrumb path="/docs" />
          <article className="prose prose-slate dark:prose-invert max-w-none">
            <div className="text-center py-16">
              <FileText className="h-16 w-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
              <h1 className="text-3xl font-bold mb-4">Nenhum documento encontrado</h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Ainda não há documentos publicados. Crie seu primeiro documento para começar.
              </p>
              <Link href="/config">
                <Button variant="primary" className="inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Primeiro Documento
                </Button>
              </Link>
            </div>
          </article>
        </div>
      );
    }
    
    // Se houver documentos mas não houver index, mostrar lista de documentos
    if (allDocs.length > 0) {
      return (
        <div className="min-w-0 max-w-4xl mx-auto">
          <Breadcrumb path="/docs" />
          <article className="prose prose-slate dark:prose-invert max-w-none">
            <div className="text-center py-16">
              <h1 className="text-3xl font-bold mb-4">Bem-vindo à Documentação</h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Comece explorando nossos documentos:
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                {allDocs.slice(0, 5).map((document) => (
                  <Link key={document.id} href={document.url}>
                    <Button variant="outline" className="inline-flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {document.title}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </article>
        </div>
      );
    }
    
    // Se chegou aqui, não há documentos
    return null;
  }

  // Se chegou aqui, doc existe e não é null
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
      title: 'Documentação - ndocs',
      description: 'Plataforma de documentação desenvolvida pela ness.',
    };
  }

  return {
    title: doc.title,
    description: doc.description || 'Documentação',
  };
}

