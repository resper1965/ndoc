import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { createHash } from 'crypto';

const CREDENTIALS_FILE = join(process.cwd(), 'config', 'credentials.json');

interface Credentials {
  username: string;
  password: string;
  updatedAt: string | null;
}

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

/**
 * POST /api/config/credentials/verify - Verify credentials
 * 
 * Body:
 * {
 *   "username": "admin",
 *   "password": "password"
 * }
 */
export async function POST(request: NextRequest) {
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

