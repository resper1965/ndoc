#!/usr/bin/env tsx
/**
 * CLI script for document ingestion
 * 
 * Usage:
 *   pnpm tsx scripts/ingest-document.ts <path> <file>
 *   pnpm tsx scripts/ingest-document.ts guides/my-doc ./my-document.mdx
 * 
 * Or with stdin:
 *   cat my-doc.mdx | pnpm tsx scripts/ingest-document.ts guides/my-doc
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

async function ingestDocument(path: string, content?: string) {
  try {
    // Validate path
    if (path.includes('..') || path.startsWith('/')) {
      throw new Error('Invalid path: path must be relative and not contain ..');
    }

    // Ensure path ends with .mdx
    const filePath = path.endsWith('.mdx') ? path : `${path}.mdx`;
    const fullPath = join(process.cwd(), 'docs', filePath);

    // Read content from file or use provided content
    let documentContent = content;
    if (!documentContent) {
      // Try to read from stdin or look for file
      const args = process.argv.slice(2);
      if (args.length > 1) {
        // Second argument is file path
        const sourceFile = args[1];
        documentContent = await readFile(sourceFile, 'utf-8');
      } else {
        // Read from stdin
        const chunks: Buffer[] = [];
        for await (const chunk of process.stdin) {
          chunks.push(chunk);
        }
        documentContent = Buffer.concat(chunks).toString('utf-8');
      }
    }

    if (!documentContent) {
      throw new Error('No content provided. Provide content via file argument or stdin.');
    }

    // Create directory if it doesn't exist
    const dirPath = join(fullPath, '..');
    if (!existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true });
    }

    // Write file
    await writeFile(fullPath, documentContent, 'utf-8');

    console.log('✅ Document ingested successfully!');
    console.log(`   Path: ${filePath}`);
    console.log(`   URL: /docs/${path.replace(/\.mdx$/, '')}`);
    console.log(`\n   Note: Run 'pnpm build:content' to process with Contentlayer,`);
    console.log(`   or restart your dev server if running 'pnpm dev'`);

    return { success: true, path: filePath };
  } catch (error) {
    console.error('❌ Error ingesting document:', error);
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: pnpm tsx scripts/ingest-document.ts <path> [file]');
  console.error('Example: pnpm tsx scripts/ingest-document.ts guides/my-doc ./my-doc.mdx');
  process.exit(1);
}

const path = args[0];
ingestDocument(path);

