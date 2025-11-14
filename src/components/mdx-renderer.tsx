/**
 * MDX Renderer Component
 * 
 * Renderiza conteúdo MDX do Supabase usando next-mdx-remote
 * Substitui Contentlayer para permitir renderização dinâmica
 */

import { MDXRemote } from 'next-mdx-remote/rsc';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
// import rehypeHighlight from 'rehype-highlight'; // Conflito de versões - será adicionado depois
import { components } from './mdx-components';

interface MDXRendererProps {
  source: string;
  frontmatter?: Record<string, unknown>;
}

/**
 * Renderiza conteúdo MDX usando next-mdx-remote
 * Compatível com os mesmos componentes do Contentlayer
 */
export async function MDXRenderer({ source }: MDXRendererProps) {
  // Serializar o conteúdo MDX
  const mdxSource = await serialize(source, {
    parseFrontmatter: true,
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeSlug], // rehypeHighlight removido temporariamente devido a conflito de versões
    },
  });

  return (
    <div className="mdx">
      <MDXRemote source={mdxSource.compiledSource} components={components} />
    </div>
  );
}

