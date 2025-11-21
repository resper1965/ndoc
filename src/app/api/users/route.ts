/**
 * API Route: User Management
 * 
 * Endpoints:
 * - GET /api/users - Listar usuários (superadmin: todos, orgadmin: da organização)
 * - POST /api/users - Criar novo usuário (apenas superadmin)
 * - PUT /api/users - Atualizar usuário (superadmin ou orgadmin)
 * - DELETE /api/users - Deletar usuário (apenas superadmin)
 * 
 * Permissões:
 * - Superadmin: Pode gerenciar todos os usuários
 * - Orgadmin: Pode gerenciar usuários da sua organização
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { isSuperadmin, getUserPermissions } from '@/lib/supabase/permissions';
import { logger } from '@/lib/logger';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';
import { createUserSchema, updateUserSchema, listUsersQuerySchema } from '@/lib/validations';

// GET: Listar usuários
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = await checkRateLimit('api/users', 'GET', identifier);
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          error: 'Muitas requisições. Tente novamente mais tarde.',
          retryAfter: Math.ceil((rateLimit.reset - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset.toString(),
          },
        }
      );
    }

    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    
    // Validação de query params
    const queryValidation = listUsersQuerySchema.safeParse({
      organization_id: searchParams.get('organization_id') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Parâmetros de query inválidos', details: queryValidation.error.issues },
        { status: 400 }
      );
    }

    const { organization_id: organizationId, page = 1, limit = 50 } = queryValidation.data;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const isSuper = await isSuperadmin();
    const permissions = await getUserPermissions(organizationId || undefined);

    // Apenas superadmin ou orgadmin podem listar usuários
    if (!isSuper && !permissions.isOrgAdmin) {
      return NextResponse.json({ error: 'Sem permissão para listar usuários' }, { status: 403 });
    }

    // Se orgadmin, só pode ver usuários da sua organização
    const targetOrgId = isSuper ? organizationId : permissions.organizationId;

    if (!targetOrgId && !isSuper) {
      return NextResponse.json({ error: 'Organização não especificada' }, { status: 400 });
    }

    // Buscar membros da organização com informações de usuário em uma única query
    // Otimização: usar join para evitar N+1 queries
    let query = supabase
      .from('organization_members')
      .select(`
        id,
        role,
        created_at,
        organization_id,
        user_id,
        organizations (
          id,
          name,
          slug
        )
      `);

    if (!isSuper && targetOrgId) {
      query = query.eq('organization_id', targetOrgId);
    }

    const { data: members, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar usuários', details: error.message }, { status: 500 });
    }

    if (!members || members.length === 0) {
      return NextResponse.json({
        users: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      });
    }

    // Buscar informações dos usuários do auth em batch (uma única query)
    // Filtrar apenas os user_ids que precisamos
    const userIds = members.map((m) => m.user_id);
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    const { data: authUsers } = await adminClient.auth.admin.listUsers();

    // Criar mapa para lookup O(1) em vez de O(n*m)
    const userMap = new Map(
      authUsers?.users
        .filter((u) => userIds.includes(u.id))
        .map((u) => [
          u.id,
          {
            email: u.email,
            name: u.user_metadata?.name || '',
          },
        ]) || []
    );

    const users = members.map((member) => {
      const userInfo = userMap.get(member.user_id);
      return {
        id: member.user_id,
        email: userInfo?.email || '',
        name: userInfo?.name || '',
        role: member.role,
        organizationId: member.organization_id,
        organization: member.organizations,
        createdAt: member.created_at,
      };
    });

    // Paginação
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    const paginatedUsers = users.slice(start, end + 1);
    const total = users.length;

    return NextResponse.json({
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: end < total - 1,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    logger.error('Error in GET /api/users', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST: Criar novo usuário (apenas superadmin)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = await checkRateLimit('api/users', 'POST', identifier);
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          error: 'Muitas requisições. Tente novamente mais tarde.',
          retryAfter: Math.ceil((rateLimit.reset - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset.toString(),
          },
        }
      );
    }

    const supabase = await createClient();
    const body = await request.json();

    // Validação com Zod
    const validationResult = createUserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { email, password, name, organizationId, role } = validationResult.data;

    // Verificar se é superadmin
    const isSuper = await isSuperadmin();
    if (!isSuper) {
      return NextResponse.json({ error: 'Apenas superadmin pode criar usuários' }, { status: 403 });
    }

    // Criar usuário no Supabase Auth usando Admin API
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name: name || '',
      },
      email_confirm: true, // Confirmar email automaticamente
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Erro ao criar usuário', details: authError?.message }, { status: 500 });
    }

    // Adicionar usuário à organização
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: organizationId,
        user_id: authData.user.id,
        role: role,
      });

    if (memberError) {
      // Se falhar ao adicionar à organização, deletar o usuário criado
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: 'Erro ao adicionar usuário à organização', details: memberError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: name || '',
        role,
        organizationId,
      },
    }, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/users', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT: Atualizar usuário
export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = await checkRateLimit('api/users', 'PUT', identifier);
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          error: 'Muitas requisições. Tente novamente mais tarde.',
          retryAfter: Math.ceil((rateLimit.reset - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset.toString(),
          },
        }
      );
    }

    const supabase = await createClient();
    const body = await request.json();

    // Validação com Zod
    const validationResult = updateUserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { userId, organizationId, role, name } = validationResult.data;

    const isSuper = await isSuperadmin();
    const permissions = await getUserPermissions(organizationId);

    // Apenas superadmin ou orgadmin podem atualizar usuários
    if (!isSuper && !permissions.isOrgAdmin) {
      return NextResponse.json({ error: 'Sem permissão para atualizar usuários' }, { status: 403 });
    }

    // Se orgadmin, só pode atualizar usuários da sua organização
    if (!isSuper && permissions.organizationId !== organizationId) {
      return NextResponse.json({ error: 'Sem permissão para atualizar usuários desta organização' }, { status: 403 });
    }

    // Atualizar role na organização
    if (role && organizationId) {
      const { error: updateError } = await supabase
        .from('organization_members')
        .update({ role })
        .eq('user_id', userId)
        .eq('organization_id', organizationId);

      if (updateError) {
        return NextResponse.json({ error: 'Erro ao atualizar role', details: updateError.message }, { status: 500 });
      }
    }

    // Atualizar nome (apenas superadmin)
    if (name && isSuper) {
      const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );
      const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
        user_metadata: { name },
      });

      if (updateError) {
        return NextResponse.json({ error: 'Erro ao atualizar nome', details: updateError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    logger.error('Error in PUT /api/users', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Deletar usuário (apenas superadmin)
export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = await checkRateLimit('api/users', 'DELETE', identifier);
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          error: 'Muitas requisições. Tente novamente mais tarde.',
          retryAfter: Math.ceil((rateLimit.reset - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset.toString(),
          },
        }
      );
    }

    const supabase = await createClient();
    const body = await request.json();

    // Validação básica
    if (!body.userId || typeof body.userId !== 'string') {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
    }

    const { userId } = body;

    // Verificar se é superadmin
    const isSuper = await isSuperadmin();
    if (!isSuper) {
      return NextResponse.json({ error: 'Apenas superadmin pode deletar usuários' }, { status: 403 });
    }

    // Não permitir deletar o próprio superadmin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.id === userId) {
      return NextResponse.json({ error: 'Não é possível deletar seu próprio usuário' }, { status: 400 });
    }

    // Deletar usuário (CASCADE deleta organization_members automaticamente)
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      return NextResponse.json({ error: 'Erro ao deletar usuário', details: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    logger.error('Error in DELETE /api/users', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

