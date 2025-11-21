/**
 * API de Onboarding de Organizações (Superadmin)
 * POST /api/superadmin/onboarding
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Schema de validação
const onboardingSchema = z.object({
  // Step 1: Dados da organização
  organization: z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    slug: z
      .string()
      .regex(
        /^[a-z0-9-]+$/,
        'Slug deve conter apenas letras minúsculas, números e hífens'
      ),
    cnpj: z.string().optional(),
    language: z.enum(['pt-BR', 'en-US', 'es-ES']).default('pt-BR'),
    branding: z
      .object({
        logo_url: z.string().url().optional(),
        primary_color: z.string().optional(),
      })
      .optional(),
  }),

  // Step 2: Plano escolhido
  plan_slug: z.enum(['free', 'starter', 'professional', 'enterprise']),

  // Step 3: Dados do Org-Admin
  org_admin: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6).optional(), // Opcional se enviar convite
    send_welcome_email: z.boolean().default(true),
  }),

  // Step 4: Usuários iniciais (opcional)
  initial_users: z
    .array(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        role: z.enum(['admin', 'editor', 'viewer']).default('viewer'),
      })
    )
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Verificar se usuário é superadmin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verificar role superadmin
    const { data: memberData } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (memberData?.role !== 'superadmin') {
      logger.warn('Unauthorized onboarding attempt', { userId: user.id });
      return NextResponse.json(
        { error: 'Unauthorized. Superadmin access required.' },
        { status: 403 }
      );
    }

    // 2. Validar input
    const body = await request.json();
    const validatedData = onboardingSchema.parse(body);

    logger.info('Starting organization onboarding', {
      orgName: validatedData.organization.name,
      plan: validatedData.plan_slug,
      initiatedBy: user.id,
    });

    // 3. Verificar se slug já existe
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', validatedData.organization.slug)
      .single();

    if (existingOrg) {
      return NextResponse.json(
        { error: 'Organization slug already exists' },
        { status: 409 }
      );
    }

    // 4. Criar Org-Admin no Supabase Auth
    let orgAdminId: string;

    if (validatedData.org_admin.password) {
      // Criar com senha
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: validatedData.org_admin.email,
          password: validatedData.org_admin.password,
          email_confirm: true,
          user_metadata: {
            name: validatedData.org_admin.name,
          },
        });

      if (authError || !authData.user) {
        logger.error('Failed to create org admin user', authError);
        return NextResponse.json(
          { error: 'Failed to create admin user', details: authError?.message },
          { status: 500 }
        );
      }

      orgAdminId = authData.user.id;
    } else {
      // Enviar convite
      const { data: inviteData, error: inviteError } =
        await supabase.auth.admin.inviteUserByEmail(
          validatedData.org_admin.email,
          {
            data: {
              name: validatedData.org_admin.name,
            },
          }
        );

      if (inviteError || !inviteData.user) {
        logger.error('Failed to invite org admin', inviteError);
        return NextResponse.json(
          {
            error: 'Failed to invite admin user',
            details: inviteError?.message,
          },
          { status: 500 }
        );
      }

      orgAdminId = inviteData.user.id;
    }

    // 5. Criar organização
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: validatedData.organization.name,
        slug: validatedData.organization.slug,
        settings: {
          cnpj: validatedData.organization.cnpj,
          language: validatedData.organization.language,
          branding: validatedData.organization.branding || {},
        },
        created_by: user.id, // Superadmin que criou
      })
      .select()
      .single();

    if (orgError || !organization) {
      logger.error('Failed to create organization', orgError);
      return NextResponse.json(
        { error: 'Failed to create organization', details: orgError?.message },
        { status: 500 }
      );
    }

    logger.info('Organization created', { orgId: organization.id });

    // 6. Adicionar Org-Admin como membro
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: organization.id,
        user_id: orgAdminId,
        role: 'orgadmin',
        invited_by: user.id,
      });

    if (memberError) {
      logger.error('Failed to add org admin as member', memberError);
      // Não retornar erro, apenas logar
    }

    // 7. Buscar plano e atualizar subscription
    const { data: plan } = await supabase
      .from('plans')
      .select('id')
      .eq('slug', validatedData.plan_slug)
      .single();

    if (plan) {
      const { error: subError } = await supabase
        .from('subscriptions')
        .update({
          plan_id: plan.id,
          status: 'active',
          trial_end: null, // Sem trial se superadmin criou
        })
        .eq('organization_id', organization.id);

      if (subError) {
        logger.error('Failed to update subscription', subError);
      }
    }

    // 8. Criar usuários iniciais (se houver)
    if (validatedData.initial_users && validatedData.initial_users.length > 0) {
      for (const userInput of validatedData.initial_users) {
        try {
          // Enviar convite
          const { data: userData } =
            await supabase.auth.admin.inviteUserByEmail(userInput.email, {
              data: {
                name: userInput.name,
              },
            });

          if (userData?.user) {
            // Adicionar como membro
            await supabase.from('organization_members').insert({
              organization_id: organization.id,
              user_id: userData.user.id,
              role: userInput.role,
              invited_by: user.id,
            });

            logger.info('Initial user invited', {
              orgId: organization.id,
              userId: userData.user.id,
              email: userInput.email,
            });
          }
        } catch (err) {
          logger.error('Failed to invite initial user', {
            email: userInput.email,
            error: err,
          });
          // Continuar com os próximos usuários
        }
      }
    }

    // 9. Criar registro de onboarding para o Org-Admin
    const { error: onboardingError } = await supabase
      .from('onboarding_status')
      .insert({
        organization_id: organization.id,
        user_id: orgAdminId,
        steps_completed: {
          review_organization: false,
          configure_ai: false,
          create_knowledge_base: false,
          upload_first_document: false,
          test_chat: false,
        },
        is_completed: false,
      });

    if (onboardingError) {
      logger.error('Failed to create onboarding status', onboardingError);
    }

    // 10. Enviar email de boas-vindas (se configurado)
    if (validatedData.org_admin.send_welcome_email) {
      // TODO: Implementar envio de email
      logger.info('Welcome email should be sent', {
        to: validatedData.org_admin.email,
        orgName: organization.name,
      });
    }

    logger.info('Organization onboarding completed', {
      orgId: organization.id,
      orgAdminId,
      initialUsersCount: validatedData.initial_users?.length || 0,
    });

    return NextResponse.json({
      success: true,
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
      org_admin: {
        id: orgAdminId,
        email: validatedData.org_admin.email,
        name: validatedData.org_admin.name,
      },
      initial_users_created: validatedData.initial_users?.length || 0,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Onboarding validation error', { errors: error.errors });
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('Onboarding error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Listar organizações (para dashboard do superadmin)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar se é superadmin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: memberData } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (memberData?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Buscar parâmetros de paginação
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') || '20'),
      100
    );
    const offset = (page - 1) * limit;

    // Buscar organizações com dados agregados
    const { data: organizations, error } = await supabase
      .from('organizations')
      .select(
        `
        id,
        name,
        slug,
        created_at,
        subscriptions (
          plan_id,
          status,
          plans (
            name,
            slug
          )
        ),
        organization_members (count),
        documents (count)
      `
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Failed to fetch organizations', error);
      return NextResponse.json(
        { error: 'Failed to fetch organizations' },
        { status: 500 }
      );
    }

    // Buscar total de organizações
    const { count: totalCount } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      organizations: organizations || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        total_pages: Math.ceil((totalCount || 0) / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching organizations', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
