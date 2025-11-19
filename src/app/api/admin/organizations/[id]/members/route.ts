import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/organizations/[id]/members
 * Lista membros de uma organização
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: organizationId } = await params;

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Buscar membros da organização
    const { data: members, error: membersError } = await supabase
      .from('organization_members')
      .select('id, user_id, organization_id, role')
      .eq('organization_id', organizationId)
      .order('role', { ascending: true });

    if (membersError) {
      logger.error('Error fetching members', membersError);
      return NextResponse.json(
        { error: 'Erro ao buscar membros' },
        { status: 500 }
      );
    }

    // Buscar informações dos usuários via Admin API
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Buscar emails dos usuários usando Admin API
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

    const membersWithUsers = await Promise.all(
      (members || []).map(async (member) => {
        try {
          const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(member.user_id);
          
          if (userError || !userData?.user) {
            if (userError) {
              logger.warn('Error fetching user', { error: userError.message || String(userError) });
            }
            return {
              ...member,
              user: {
                id: member.user_id,
                email: 'Email não disponível',
                user_metadata: {},
              },
            };
          }

          return {
            ...member,
            user: {
              id: userData.user.id,
              email: userData.user.email || 'Email não disponível',
              user_metadata: userData.user.user_metadata || {},
            },
          };
        } catch (error) {
          logger.error('Error fetching user details', error);
          return {
            ...member,
            user: {
              id: member.user_id,
              email: 'Email não disponível',
              user_metadata: {},
            },
          };
        }
      })
    );

    return NextResponse.json({ members: membersWithUsers });
  } catch (error) {
    logger.error('Error in GET /api/admin/organizations/[id]/members', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/organizations/[id]/members
 * Adiciona um membro à organização
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: organizationId } = await params;
    const body = await request.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email e permissão são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Buscar usuário pelo email usando Admin API
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
    
    const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers();
    
    if (usersError) {
      logger.error('Error listing users', usersError);
      return NextResponse.json(
        { error: 'Erro ao buscar usuário' },
        { status: 500 }
      );
    }

    const targetUser = usersData.users.find(u => u.email === email);
    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado. O usuário precisa ter uma conta no sistema.' },
        { status: 404 }
      );
    }

    // Verificar se já é membro
    const { data: existingMember } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', targetUser.id)
      .maybeSingle();

    if (existingMember) {
      return NextResponse.json(
        { error: 'Usuário já é membro desta organização' },
        { status: 409 }
      );
    }

    // Adicionar membro
    const { error: insertError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: organizationId,
        user_id: targetUser.id,
        role: role,
      });

    if (insertError) {
      logger.error('Error adding member', insertError);
      return NextResponse.json(
        { error: 'Erro ao adicionar membro' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error in POST /api/admin/organizations/[id]/members', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/organizations/[id]/members/[memberId]
 * Remove um membro da organização
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId?: string }> }
) {
  try {
    const supabase = await createClient();
    const resolvedParams = await params;
    const organizationId = resolvedParams.id;
    const memberId = resolvedParams.memberId || new URL(request.url).searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { error: 'ID do membro é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Remover membro
    const { error: deleteError } = await supabase
      .from('organization_members')
      .delete()
      .eq('id', memberId)
      .eq('organization_id', organizationId);

    if (deleteError) {
      logger.error('Error removing member', deleteError);
      return NextResponse.json(
        { error: 'Erro ao remover membro' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error in DELETE /api/admin/organizations/[id]/members', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/organizations/[id]/members/[memberId]
 * Atualiza a permissão de um membro
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId?: string }> }
) {
  try {
    const supabase = await createClient();
    const resolvedParams = await params;
    const organizationId = resolvedParams.id;
    const memberId = resolvedParams.memberId || new URL(request.url).searchParams.get('memberId');
    const body = await request.json();
    const { role } = body;

    if (!memberId || !role) {
      return NextResponse.json(
        { error: 'ID do membro e permissão são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Atualizar permissão
    const { error: updateError } = await supabase
      .from('organization_members')
      .update({ role })
      .eq('id', memberId)
      .eq('organization_id', organizationId);

    if (updateError) {
      logger.error('Error updating member role', updateError);
      return NextResponse.json(
        { error: 'Erro ao atualizar permissão' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error in PATCH /api/admin/organizations/[id]/members', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

