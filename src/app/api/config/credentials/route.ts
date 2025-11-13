import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { createHash } from 'crypto';

const CREDENTIALS_FILE = join(process.cwd(), 'config', 'credentials.json');

interface Credentials {
  username: string;
  password: string;
  updatedAt: string | null;
}

// Simple password hashing (for storage, not security - this is simple auth)
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

async function readCredentials(): Promise<Credentials> {
  try {
    if (existsSync(CREDENTIALS_FILE)) {
      const content = await readFile(CREDENTIALS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error reading credentials:', error);
  }
  
  // Default credentials
  return {
    username: 'admin',
    password: hashPassword('admin'),
    updatedAt: null,
  };
}

async function writeCredentials(credentials: Credentials): Promise<void> {
  // Ensure config directory exists
  const configDir = join(process.cwd(), 'config');
  if (!existsSync(configDir)) {
    await mkdir(configDir, { recursive: true });
  }
  
  await writeFile(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2), 'utf-8');
}

/**
 * GET /api/config/credentials - Get current credentials info (username only, no password)
 */
export async function GET() {
  try {
    const credentials = await readCredentials();
    return NextResponse.json({
      username: credentials.username,
      updatedAt: credentials.updatedAt,
      hasPassword: !!credentials.password,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to read credentials' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/config/credentials - Update credentials
 * 
 * Body:
 * {
 *   "currentPassword": "current-password",  // Required for verification
 *   "username": "new-username",             // Optional
 *   "password": "new-password"              // Optional
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentPassword, username, password } = body;

    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Senha atual é obrigatória' },
        { status: 400 }
      );
    }

    // Ler credenciais atuais
    const current = await readCredentials();

    // Verificar senha atual
    const currentPasswordHash = hashPassword(currentPassword);
    if (currentPasswordHash !== current.password) {
      return NextResponse.json(
        { error: 'Senha atual inválida' },
        { status: 401 }
      );
    }

    // Update credentials
    const updated: Credentials = {
      username: username || current.username,
      password: password ? hashPassword(password) : current.password,
      updatedAt: new Date().toISOString(),
    };

    await writeCredentials(updated);

    return NextResponse.json({
      success: true,
      message: 'Credenciais atualizadas com sucesso',
      username: updated.username,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    console.error('Erro ao atualizar credenciais:', error);
    return NextResponse.json(
      {
        error: 'Falha ao atualizar credenciais',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/config/credentials/verify - Verify credentials
 * 
 * Body:
 * {
 *   "username": "admin",
 *   "password": "password"
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Usuário e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const credentials = await readCredentials();
    const passwordHash = hashPassword(password);

    if (username === credentials.username && passwordHash === credentials.password) {
      return NextResponse.json({
        valid: true,
        message: 'Credenciais válidas',
      });
    }

    return NextResponse.json(
      {
        valid: false,
        error: 'Usuário ou senha inválidos',
      },
      { status: 401 }
    );
        } catch {
          return NextResponse.json(
            { error: 'Falha ao verificar credenciais' },
            { status: 500 }
          );
        }
}

