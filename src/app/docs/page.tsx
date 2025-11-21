import { MDXRenderer } from '@/components/mdx-renderer';
import Breadcrumb from '@/components/bread-crumb';
import { getIndexDocument, getAllDocuments } from '@/lib/supabase/documents';
import Link from 'next/link';
import { Button } from '@/components/button';
import { FileText, Upload as UploadIcon, Sparkles } from 'lucide-react';
import { DocumentActions } from '@/components/document-actions';

export const dynamic = 'force-dynamic';
export const dynamicParams = false;

export default async function DocsPage() {
  // Buscar documento index do Supabase
  const doc = await getIndexDocument();

  // Se não houver documento index, verificar se há outros documentos
  if (!doc) {
    const allDocs = await getAllDocuments();

    // Se não houver nenhum documento, mostrar empty state guiado
    if (allDocs.length === 0) {
      return (
        <div className="min-w-0 max-w-4xl mx-auto">
          <Breadcrumb path="/docs" />
          <article className="prose prose-slate dark:prose-invert max-w-none">
            <div className="text-center py-16 px-4">
              <div className="max-w-2xl mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                  <FileText className="h-12 w-12 text-primary-600 dark:text-primary-400" />
                </div>
                <h1 className="text-4xl font-bold mb-4">
                  Bem-vindo aos seus documentos!
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 mb-4">
                  Você ainda não tem documentos. Comece criando ou fazendo
                  upload do seu primeiro documento.
                </p>
                <p className="text-base text-slate-500 dark:text-slate-500 mb-12">
                  Use os botões <strong>"Novo Documento"</strong> ou{' '}
                  <strong>"Upload"</strong> no canto superior direito para
                  começar.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mb-4">
                      <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="font-semibold mb-2">Criar Manualmente</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Use o editor MDX para criar documentos do zero com suporte
                      a Markdown e componentes React.
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mb-4">
                      <UploadIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="font-semibold mb-2">Fazer Upload</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Faça upload de PDF, DOCX, MDX e outros formatos. Eles
                      serão convertidos automaticamente.
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mb-4">
                      <Sparkles className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="font-semibold mb-2">Usar IA</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Configure provedores de IA e use templates para gerar
                      documentos automaticamente.
                    </p>
                  </div>
                </div>
              </div>
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
              <h1 className="text-3xl font-bold mb-4">Seus Documentos</h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Comece explorando seus documentos:
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                {allDocs.slice(0, 5).map((document) => (
                  <Link key={document.id} href={document.url}>
                    <Button
                      variant="outline"
                      className="inline-flex items-center gap-2"
                    >
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
      <div className="flex items-center justify-between mb-4">
        <Breadcrumb path="/docs" />
        <DocumentActions
          documentPath={doc.path || 'index'}
          documentContent={mdxContent}
          documentTitle={doc.title}
        />
      </div>
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
      title: 'Meus Documentos - ndocs',
      description: 'Gerencie e organize seus documentos.',
    };
  }

  return {
    title: doc.title,
    description: doc.description || 'Documento',
  };
}
