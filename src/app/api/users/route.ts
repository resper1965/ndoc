import { NextRequest, NextResponse } from 'next/server';
import {
  createUser,
  updateUser,
  deleteUser,
  listUsers,
  verifyUserCredentials,
  hasPermission,
  type UserPermission,
} from '@/lib/users';

/**
 * GET /api/users - Listar todos os usuários (requer admin)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const password = searchParams.get('password');

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

    if (!hasPermission(user, 'admin')) {
      return NextResponse.json(
        { error: 'Acesso negado: requer permissão admin' },
        { status: 403 }
      );
    }

    const users = await listUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return NextResponse.json(
      {
        error: 'Falha ao listar usuários',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users - Criar novo usuário (requer admin)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, permission, authUsername, authPassword } = body;

    if (!authUsername || !authPassword) {
      return NextResponse.json(
        { error: 'Não autorizado: usuário e senha são obrigatórios' },
        { status: 401 }
      );
    }

    const { valid, user } = await verifyUserCredentials(authUsername, authPassword);
    if (!valid || !user) {
      return NextResponse.json(
        { error: 'Não autorizado: usuário ou senha inválidos' },
        { status: 401 }
      );
    }

    if (!hasPermission(user, 'admin')) {
      return NextResponse.json(
        { error: 'Acesso negado: requer permissão admin' },
        { status: 403 }
      );
    }

    if (!username || !password || !permission) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: username, password, permission' },
        { status: 400 }
      );
    }

    const validPermissions: UserPermission[] = ['read', 'write', 'admin'];
    if (!validPermissions.includes(permission)) {
      return NextResponse.json(
        { error: 'Permissão inválida. Use: read, write ou admin' },
        { status: 400 }
      );
    }

    const newUser = await createUser(username, password, permission);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      {
        error: 'Falha ao criar usuário',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users - Atualizar usuário (requer admin)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, permission, authUsername, authPassword } = body;

    if (!authUsername || !authPassword) {
      return NextResponse.json(
        { error: 'Não autorizado: usuário e senha são obrigatórios' },
        { status: 401 }
      );
    }

    const { valid, user } = await verifyUserCredentials(authUsername, authPassword);
    if (!valid || !user) {
      return NextResponse.json(
        { error: 'Não autorizado: usuário ou senha inválidos' },
        { status: 401 }
      );
    }

    if (!hasPermission(user, 'admin')) {
      return NextResponse.json(
        { error: 'Acesso negado: requer permissão admin' },
        { status: 403 }
      );
    }

    if (!username) {
      return NextResponse.json(
        { error: 'Campo obrigatório: username' },
        { status: 400 }
      );
    }

    const updates: Partial<{ password: string; permission: UserPermission }> = {};
    if (password) updates.password = password;
    if (permission) {
      const validPermissions: UserPermission[] = ['read', 'write', 'admin'];
      if (!validPermissions.includes(permission)) {
        return NextResponse.json(
          { error: 'Permissão inválida. Use: read, write ou admin' },
          { status: 400 }
        );
      }
      updates.permission = permission;
    }

    const updatedUser = await updateUser(username, updates);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      {
        error: 'Falha ao atualizar usuário',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users - Deletar usuário (requer admin)
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, authUsername, authPassword } = body;

    if (!authUsername || !authPassword) {
      return NextResponse.json(
        { error: 'Não autorizado: usuário e senha são obrigatórios' },
        { status: 401 }
      );
    }

    const { valid, user } = await verifyUserCredentials(authUsername, authPassword);
    if (!valid || !user) {
      return NextResponse.json(
        { error: 'Não autorizado: usuário ou senha inválidos' },
        { status: 401 }
      );
    }

    if (!hasPermission(user, 'admin')) {
      return NextResponse.json(
        { error: 'Acesso negado: requer permissão admin' },
        { status: 403 }
      );
    }

    if (!username) {
      return NextResponse.json(
        { error: 'Campo obrigatório: username' },
        { status: 400 }
      );
    }

    await deleteUser(username);

    return NextResponse.json({
      success: true,
      message: 'Usuário deletado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return NextResponse.json(
      {
        error: 'Falha ao deletar usuário',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

