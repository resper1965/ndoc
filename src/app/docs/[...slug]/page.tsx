import { allDocs } from 'contentlayer/generated';
import { notFound } from 'next/navigation';
import { Mdx } from '@/components/mdx-components';
import Breadcrumb from '@/components/bread-crumb';
import Toc from '@/components/toc';

type tParams = Promise<{ slug: string[] }>;

export const dynamicParams = false;

export const generateStaticParams = async () => {
  return allDocs
    .filter((doc) => doc._raw.flattenedPath !== 'index') // Exclude index, handled by /docs/page.tsx
    .map((doc) => {
      // For a path like "getting-started/introduction",
      // this creates { slug: ['getting-started', 'introduction'] }
      const slugArray = doc._raw.flattenedPath.split('/');
      return { slug: slugArray };
    });
};

export const generateMetadata = async ({ params }: { params: tParams }) => {
  // Join the slug array back into a path string
  const awaitedParams = await params;
  // This route should never receive an empty slug (handled by /docs/page.tsx)
  if (awaitedParams.slug.length === 0) {
    throw new Error('Empty slug should be handled by /docs/page.tsx');
  }
  const path = awaitedParams.slug.join('/');
  const doc = allDocs.find((doc) => doc._raw.flattenedPath === path);

  if (!doc) throw new Error(`Doc not found for slug: ${path}`);
  return {
    title: doc.title,
    description: doc.description || 'A detailed guide to the topic.',
    openGraph: {
      title: doc.title,
      description: doc.description || 'A detailed guide to the topic.',
    },
  };
};

const DocsPage = async ({ params }: { params: tParams }) => {
  const awaitedParams = await params;
  // This route should never receive an empty slug (handled by /docs/page.tsx)
  if (awaitedParams.slug.length === 0) {
    notFound();
    return null;
  }
  // Join the slug array back into a path string
  const path = awaitedParams.slug.join('/');
  const doc = allDocs.find((doc) => doc._raw.flattenedPath === path);

  if (!doc) notFound();
  return (
    <div className={`grid xl:grid xl:grid-cols-[1fr_270px]`}>
      <article className="overflow-auto">
        <div className="mb-8 text-center">
          <Breadcrumb path={doc.url} />
          {/* {doc.date && (
            <time dateTime={doc.date} className="mb-1 text-xs text-gray-600">
              {format(parseISO(doc.date), 'LLLL d, yyyy')}
            </time>
          )}
          <h1 className="text-3xl font-bold">{doc.title}</h1> */}
        </div>
        <Mdx code={doc.body.code} />
      </article>

      <Toc doc={doc} />
    </div>
  );
};

export default DocsPage;
