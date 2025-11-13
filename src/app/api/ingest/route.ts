import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink, readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { verifyUserCredentials, hasPermission } from '@/lib/users';
import { validateMDX } from '@/lib/validate-mdx';

/**
 * API Route for document ingestion
 * 
 * POST /api/ingest
 * 
 * Body (JSON):
 * {
 *   "path": "guides/my-document",  // Path relative to docs/ (without .mdx extension)
 *   "content": "---\ntitle: My Document\n---\n\n# Content",  // Full MDX content
 *   "username": "admin",  // Username for authentication
 *   "password": "secret"  // Password for authentication
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, content, username, password } = body;

    // Autenticação
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Não autorizado: usuário e senha são obrigatórios' },
        { status: 401 }
      );
    }

    const { valid, user } = await verifyUserCredentials(username, password);
    if (!valid || !user) {
      return NextResponse.json(
        { error: 'Não autorizado: usuário ou senha inválidos' },
        { status: 401 }
      );
    }

    // POST requer permissão write
    if (!hasPermission(user, 'write')) {
      return NextResponse.json(
        { error: 'Acesso negado: requer permissão write' },
        { status: 403 }
      );
    }

    // Validar campos obrigatórios
    if (!path || !content) {
      return NextResponse.json(
        { error: 'Campos obrigatórios ausentes: path e content são necessários' },
        { status: 400 }
      );
    }

    // Validar formato MDX
    const validation = validateMDX(content);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Erros de validação MDX',
          validationErrors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Validar path (prevenir directory traversal)
    if (path.includes('..') || path.startsWith('/')) {
      return NextResponse.json(
        { error: 'Path inválido: o path deve ser relativo e não conter ..' },
        { status: 400 }
      );
    }

    // Ensure path ends with .mdx
    const filePath = path.endsWith('.mdx') ? path : `${path}.mdx`;
    const fullPath = join(process.cwd(), 'docs', filePath);
    
    // Check if file exists (for update vs create)
    const fileExists = existsSync(fullPath);

    // Create directory if it doesn't exist
    const dirPath = join(fullPath, '..');
    if (!existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true });
    }

    // Write file
    await writeFile(fullPath, content, 'utf-8');

    // Trigger Contentlayer rebuild (if in production, this will happen on next build)
    // In development, Contentlayer watches for changes automatically

    return NextResponse.json({
      success: true,
      message: fileExists
        ? 'Documento atualizado com sucesso'
        : 'Documento ingerido com sucesso',
      path: filePath,
      url: `/docs/${path.replace(/\.mdx$/, '')}`,
      action: fileExists ? 'updated' : 'created',
    });
  } catch (error) {
    console.error('Erro ao ingerir documento:', error);
    return NextResponse.json(
      {
        error: 'Falha ao ingerir documento',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ingest - Update an existing document
 * Same as POST but explicitly for updates
 */
export async function PUT(request: NextRequest) {
  // PUT uses the same logic as POST (it will detect if file exists)
  return POST(request);
}

/**
 * DELETE /api/ingest - Delete a document
 * 
 * Body (JSON):
 * {
 *   "path": "guides/my-document",
 *   "username": "admin",
 *   "password": "secret"
 * }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, username, password } = body;

    // Autenticação
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Não autorizado: usuário e senha são obrigatórios' },
        { status: 401 }
      );
    }

    const { valid, user } = await verifyUserCredentials(username, password);
    if (!valid || !user) {
      return NextResponse.json(
        { error: 'Não autorizado: usuário ou senha inválidos' },
        { status: 401 }
      );
    }

    // DELETE requer permissão write
    if (!hasPermission(user, 'write')) {
      return NextResponse.json(
        { error: 'Acesso negado: requer permissão write' },
        { status: 403 }
      );
    }

    // Validar campos obrigatórios
    if (!path) {
      return NextResponse.json(
        { error: 'Campo obrigatório ausente: path é necessário' },
        { status: 400 }
      );
    }

    // Validar path (prevenir directory traversal)
    if (path.includes('..') || path.startsWith('/')) {
      return NextResponse.json(
        { error: 'Path inválido: o path deve ser relativo e não conter ..' },
        { status: 400 }
      );
    }

    // Garantir que path termina com .mdx
    const filePath = path.endsWith('.mdx') ? path : `${path}.mdx`;
    const fullPath = join(process.cwd(), 'docs', filePath);

    // Verificar se arquivo existe
    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'Documento não encontrado' },
        { status: 404 }
      );
    }

    // Prevenir deletar index.mdx
    if (filePath === 'index.mdx') {
      return NextResponse.json(
        { error: 'Não é possível deletar index.mdx (arquivo obrigatório)' },
        { status: 400 }
      );
    }

    // Deletar arquivo
    await unlink(fullPath);

    return NextResponse.json({
      success: true,
      message: 'Documento deletado com sucesso',
      path: filePath,
    });
  } catch (error) {
    console.error('Erro ao deletar documento:', error);
    return NextResponse.json(
      {
        error: 'Falha ao deletar documento',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ingest - List all documents or get API info
 * 
 * Query params:
 * - list=true: List all documents
 * - path=xxx: Get specific document content
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const list = searchParams.get('list') === 'true';
  const path = searchParams.get('path');
  const username = searchParams.get('username');
  const password = searchParams.get('password');

  // Verificar autenticação se for listar ou obter documento específico
  if (list || path) {
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Não autorizado: usuário e senha são obrigatórios' },
        { status: 401 }
      );
    }

    const { valid, user } = await verifyUserCredentials(username, password);
    if (!valid || !user) {
      return NextResponse.json(
        { error: 'Não autorizado: usuário ou senha inválidos' },
        { status: 401 }
      );
    }

    // GET requer permissão read
    if (!hasPermission(user, 'read')) {
      return NextResponse.json(
        { error: 'Acesso negado: requer permissão read' },
        { status: 403 }
      );
    }
  }

  // List all documents
  if (list) {
    try {
      const docsDir = join(process.cwd(), 'docs');
      const documents: Array<{ path: string; url: string }> = [];

      async function scanDirectory(dir: string, basePath: string = '') {
        const entries = await readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = join(dir, entry.name);
          const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;

          if (entry.isDirectory()) {
            await scanDirectory(fullPath, relativePath);
          } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
            const docPath = relativePath.replace(/\.(mdx|md)$/, '');
            documents.push({
              path: relativePath,
              url: `/docs/${docPath}`,
            });
          }
        }
      }

      await scanDirectory(docsDir);

      return NextResponse.json({
        success: true,
        documents,
        count: documents.length,
      });
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Falha ao listar documentos',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        },
        { status: 500 }
      );
    }
  }

  // Obter conteúdo de documento específico
  if (path) {
    try {
      const filePath = path.endsWith('.mdx') || path.endsWith('.md') ? path : `${path}.mdx`;
      const fullPath = join(process.cwd(), 'docs', filePath);

      if (!existsSync(fullPath)) {
        return NextResponse.json(
          { error: 'Documento não encontrado' },
          { status: 404 }
        );
      }

      const content = await readFile(fullPath, 'utf-8');

      return NextResponse.json({
        success: true,
        path: filePath,
        content,
        url: `/docs/${path.replace(/\.(mdx|md)$/, '')}`,
      });
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Falha ao ler documento',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        },
        { status: 500 }
      );
    }
  }

  // Padrão: Informações da API
  return NextResponse.json({
    service: 'API de Ingestão de Documentos',
    version: '1.0.0',
    endpoints: {
      POST: '/api/ingest - Criar ou atualizar um documento',
      PUT: '/api/ingest - Atualizar um documento (mesmo que POST)',
      DELETE: '/api/ingest - Deletar um documento',
      GET: '/api/ingest - Obter informações da API, listar documentos (?list=true), ou obter conteúdo de documento (?path=xxx)',
    },
    usage: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        path: 'string - Caminho do documento relativo a docs/ (ex: "guides/meu-doc")',
        content: 'string - Conteúdo MDX completo com frontmatter',
        username: 'string (obrigatório) - Usuário para autenticação',
        password: 'string (obrigatório) - Senha para autenticação',
      },
      authentication: {
        enabled: 'As credenciais são gerenciadas em config/credentials.json',
        defaultUsername: 'admin (credenciais padrão)',
        note: 'Use a página de configuração (/config) para alterar credenciais',
      },
    },
    mdxFormat: {
      description: 'Arquivos MDX devem incluir frontmatter (YAML entre ---) e conteúdo',
      example: `---
title: "Document Title"
description: "Optional description for SEO and previews"
date: "2025-11-13"
---

# Document Title

Your content here in Markdown/MDX format.

## Features

- Support for **Markdown** syntax
- Support for JSX components
- Code blocks with syntax highlighting

\`\`\`typescript
const example = "MDX supports code blocks";
\`\`\`

## JSX Components

You can also use React components:

<Note type="info">
  This is a custom component example
</Note>`,
      frontmatterFields: {
        title: 'obrigatório - Título da página exibido na navegação e cabeçalho',
        description: 'opcional - Descrição breve para SEO e previews',
        date: 'opcional - Data de publicação no formato YYYY-MM-DD',
      },
      requirements: [
        'O frontmatter deve estar no topo do arquivo',
        'O frontmatter deve estar entre delimitadores ---',
        'O campo title é obrigatório',
        'O conteúdo após o frontmatter pode ser Markdown ou MDX',
        'A extensão do arquivo será automaticamente definida como .mdx',
      ],
    },
    examples: {
      minimal: {
        description: 'Documento mínimo apenas com campos obrigatórios',
        request: {
          path: 'guides/getting-started',
          content: `---
title: "Getting Started"
---

# Getting Started

Welcome to the documentation!`,
        },
      },
      complete: {
        description: 'Documento completo com todos os campos opcionais',
        request: {
          path: 'api/reference',
          content: `---
title: "API Reference"
description: "Complete API documentation with examples"
date: "2025-11-13"
---

# API Reference

This document provides a complete reference for the API.

## Endpoints

### GET /api/example

Returns example data.

\`\`\`bash
curl https://api.example.com/example
\`\`\`

## Response

\`\`\`json
{
  "status": "success",
  "data": {}
}
\`\`\``,
        },
      },
      withCodeBlocks: {
        description: 'Documento com blocos de código e formatação',
        request: {
          path: 'guides/installation',
          content: `---
title: "Installation Guide"
description: "Step-by-step installation instructions"
---

# Installation Guide

Follow these steps to install the software.

## Prerequisites

- Node.js 18+
- pnpm installed

## Installation

\`\`\`bash
# Install dependencies
pnpm install

# Build the project
pnpm build
\`\`\`

## Configuration

Create a \`.env.local\` file:

\`\`\`env
API_KEY=your-api-key
API_URL=https://api.example.com
\`\`\``,
        },
      },
    },
  });
}

