import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { hashPassword } from './auth';

const USERS_FILE = join(process.cwd(), 'config', 'users.json');

export type UserPermission = 'read' | 'write' | 'admin';

export interface User {
  username: string;
  password: string; // Hashed
  permission: UserPermission;
  createdAt: string;
  updatedAt: string;
}

export interface UsersData {
  users: User[];
}

/**
 * Ler todos os usuários
 */
export async function readUsers(): Promise<UsersData> {
  if (!existsSync(USERS_FILE)) {
    // Criar arquivo com usuário admin padrão
    const defaultUsers: UsersData = {
      users: [
        {
          username: 'admin',
          password: hashPassword('admin'),
          permission: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };
    await mkdir(join(process.cwd(), 'config'), { recursive: true });
    await writeFile(USERS_FILE, JSON.stringify(defaultUsers, null, 2), 'utf-8');
    return defaultUsers;
  }

  const data = await readFile(USERS_FILE, 'utf-8');
  return JSON.parse(data);
}

/**
 * Escrever usuários
 */
export async function writeUsers(data: UsersData): Promise<void> {
  await writeFile(USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Verificar credenciais de usuário
 */
export async function verifyUserCredentials(
  username: string,
  password: string
): Promise<{ valid: boolean; user?: User }> {
  const usersData = await readUsers();
  const user = usersData.users.find((u) => u.username === username);

  if (!user) {
    return { valid: false };
  }

  const passwordHash = hashPassword(password);
  if (user.password !== passwordHash) {
    return { valid: false };
  }

  return { valid: true, user };
}

/**
 * Verificar se usuário tem permissão
 */
export function hasPermission(
  user: User,
  requiredPermission: UserPermission
): boolean {
  const permissionLevels: Record<UserPermission, number> = {
    read: 1,
    write: 2,
    admin: 3,
  };

  return permissionLevels[user.permission] >= permissionLevels[requiredPermission];
}

/**
 * Criar novo usuário
 */
export async function createUser(
  username: string,
  password: string,
  permission: UserPermission
): Promise<User> {
  const usersData = await readUsers();

  // Verificar se usuário já existe
  if (usersData.users.some((u) => u.username === username)) {
    throw new Error('Usuário já existe');
  }

  const newUser: User = {
    username,
    password: hashPassword(password),
    permission,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  usersData.users.push(newUser);
  await writeUsers(usersData);

  return newUser;
}

/**
 * Atualizar usuário
 */
export async function updateUser(
  username: string,
  updates: Partial<Pick<User, 'password' | 'permission'>>
): Promise<User> {
  const usersData = await readUsers();
  const userIndex = usersData.users.findIndex((u) => u.username === username);

  if (userIndex === -1) {
    throw new Error('Usuário não encontrado');
  }

  const user = usersData.users[userIndex];

  if (updates.password) {
    user.password = hashPassword(updates.password);
  }

  if (updates.permission) {
    user.permission = updates.permission;
  }

  user.updatedAt = new Date().toISOString();
  usersData.users[userIndex] = user;

  await writeUsers(usersData);

  return user;
}

/**
 * Deletar usuário
 */
export async function deleteUser(username: string): Promise<void> {
  const usersData = await readUsers();
  const userIndex = usersData.users.findIndex((u) => u.username === username);

  if (userIndex === -1) {
    throw new Error('Usuário não encontrado');
  }

  // Não permitir deletar o último usuário admin
  const adminUsers = usersData.users.filter((u) => u.permission === 'admin');
  if (usersData.users[userIndex].permission === 'admin' && adminUsers.length === 1) {
    throw new Error('Não é possível deletar o último usuário admin');
  }

  usersData.users.splice(userIndex, 1);
  await writeUsers(usersData);
}

/**
 * Listar todos os usuários (sem senhas)
 */
export async function listUsers(): Promise<Omit<User, 'password'>[]> {
  const usersData = await readUsers();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return usersData.users.map(({ password: _password, ...user }) => user);
}

