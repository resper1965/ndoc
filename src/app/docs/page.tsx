import { allDocs } from 'contentlayer/generated';
import { notFound } from 'next/navigation';
import { Mdx } from '@/components/mdx-components';
import Breadcrumb from '@/components/bread-crumb';
import Toc from '@/components/toc';

export default function DocsIndexPage() {
  // Find index document
  const doc = allDocs.find((doc) => doc._raw.flattenedPath === 'index');

  if (!doc) notFound();
  
  return (
    <div className={`grid xl:grid xl:grid-cols-[1fr_270px]`}>
      <article className="overflow-auto">
        <div className="mb-8 text-center">
          <Breadcrumb path={doc.url} />
        </div>
        <Mdx code={doc.body.code} />
      </article>

      <Toc doc={doc} />
    </div>
  );
}

