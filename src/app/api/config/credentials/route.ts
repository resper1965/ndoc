import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// GET: Obter credenciais do usuário
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Retornar informações do usuário (não a senha)
    return NextResponse.json({
      username: user.email || user.user_metadata?.username || '',
      updatedAt: user.updated_at || null,
      isDefaultPassword: false, // Não temos como verificar isso sem armazenar
    });
  } catch (error) {
    logger.error('Error fetching credentials', error);
    return NextResponse.json(
      { error: 'Erro ao buscar credenciais' },
      { status: 500 }
    );
  }
}

// PUT: Atualizar credenciais do usuário
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newUsername, newPassword } = body;

    // Atualizar senha se fornecida
    if (newPassword && currentPassword) {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        return NextResponse.json(
          { error: 'Erro ao atualizar senha', details: updateError.message },
          { status: 400 }
        );
      }
    }

    // Atualizar metadata do usuário (username)
    if (newUsername) {
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { username: newUsername },
      });

      if (metadataError) {
        return NextResponse.json(
          { error: 'Erro ao atualizar username', details: metadataError.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Credenciais atualizadas com sucesso',
    });
  } catch (error) {
    logger.error('Error updating credentials', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar credenciais' },
      { status: 500 }
    );
  }
}

