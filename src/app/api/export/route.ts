import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { verifyUserCredentials, hasPermission } from '@/lib/users';
import archiver from 'archiver';

/**
 * GET /api/export - Exportar documentos como ZIP
 * 
 * Query params:
 * - path: (opcional) Caminho de um documento específico para exportar
 * - username: Usuário para autenticação
 * - password: Senha para autenticação
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    const username = searchParams.get('username');
    const password = searchParams.get('password');

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

    // Requer permissão read no mínimo
    if (!hasPermission(user, 'read')) {
      return NextResponse.json(
        { error: 'Acesso negado: permissão insuficiente' },
        { status: 403 }
      );
    }

    const docsDir = join(process.cwd(), 'docs');
    const filesToExport: Array<{ path: string; content: string }> = [];

    // Se path específico, exportar apenas esse documento
    if (path) {
      const filePath = path.endsWith('.mdx') || path.endsWith('.md') ? path : `${path}.mdx`;
      const fullPath = join(docsDir, filePath);

      if (!existsSync(fullPath)) {
        return NextResponse.json(
          { error: 'Documento não encontrado' },
          { status: 404 }
        );
      }

      const content = await readFile(fullPath, 'utf-8');
      filesToExport.push({ path: filePath, content });
    } else {
      // Exportar todos os documentos
      async function scanDirectory(dir: string, basePath: string = '') {
        const entries = await readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = join(dir, entry.name);
          const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;

          if (entry.isDirectory()) {
            await scanDirectory(fullPath, relativePath);
          } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
            const content = await readFile(fullPath, 'utf-8');
            filesToExport.push({ path: relativePath, content });
          }
        }
      }

      await scanDirectory(docsDir);
    }

    // Criar ZIP usando stream
    return new Promise<NextResponse>((resolve, reject) => {
      const archive = archiver('zip', { zlib: { level: 9 } });
      const chunks: Buffer[] = [];

      archive.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      archive.on('end', () => {
        const zipBuffer = Buffer.concat(chunks);
        const filename = path
          ? `document-${path.replace(/[^a-z0-9]/gi, '-')}.zip`
          : `docs-export-${new Date().toISOString().split('T')[0]}.zip`;

        resolve(
          new NextResponse(zipBuffer, {
            headers: {
              'Content-Type': 'application/zip',
              'Content-Disposition': `attachment; filename="${filename}"`,
              'Content-Length': zipBuffer.length.toString(),
            },
          })
        );
      });

      archive.on('error', (err) => {
        reject(err);
      });

      // Adicionar arquivos ao ZIP
      for (const file of filesToExport) {
        archive.append(file.content, { name: file.path });
      }

      archive.finalize();
    });

  } catch (error) {
    console.error('Erro ao exportar documentos:', error);
    return NextResponse.json(
      {
        error: 'Falha ao exportar documentos',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

