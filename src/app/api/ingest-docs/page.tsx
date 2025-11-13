'use client';

import React from 'react';

export default function IngestAPIPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-heading font-bold mb-4">API de Ingestão de Documentos</h1>
      
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
          API para ingestão de documentos MDX na plataforma de documentação.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-heading font-semibold mb-4">Endpoint</h2>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
            <code className="text-sm">POST /api/ingest</code>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-heading font-semibold mb-4">Formato MDX</h2>
          
          <p className="mb-4">
            Os arquivos MDX devem incluir <strong>frontmatter</strong> (YAML entre <code>---</code>) e conteúdo.
          </p>

          <h3 className="text-xl font-heading font-semibold mb-3">Campos do Frontmatter</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><code>title</code> (obrigatório) - Título da página exibido na navegação</li>
            <li><code>description</code> (opcional) - Descrição breve para SEO e previews</li>
            <li><code>date</code> (opcional) - Data de publicação no formato YYYY-MM-DD</li>
          </ul>

          <h3 className="text-xl font-heading font-semibold mb-3">Requisitos</h3>
          <ul className="list-disc pl-6 mb-6">
            <li>O frontmatter deve estar no topo do arquivo</li>
            <li>O frontmatter deve estar entre delimitadores <code>---</code></li>
            <li>O campo <code>title</code> é obrigatório</li>
            <li>O conteúdo após o frontmatter pode ser Markdown ou MDX</li>
            <li>A extensão do arquivo será automaticamente definida como <code>.mdx</code></li>
          </ul>
        </section>
      </div>
    </div>
  );
}

