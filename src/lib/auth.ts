import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';

const CREDENTIALS_FILE = join(process.cwd(), 'config', 'credentials.json');

export interface Credentials {
  username: string;
  password: string; // Hashed
  updatedAt: string | null;
}

export async function getCredentials(): Promise<Credentials> {
  try {
    if (existsSync(CREDENTIALS_FILE)) {
      const content = await readFile(CREDENTIALS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error reading credentials:', error);
  }

  // Default credentials: admin/admin
  return {
    username: 'admin',
    password: createHash('sha256').update('admin').digest('hex'),
    updatedAt: null,
  };
}

export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export async function verifyCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const credentials = await getCredentials();
  const passwordHash = hashPassword(password);

  return (
    username === credentials.username && passwordHash === credentials.password
  );
}

