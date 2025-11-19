import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserOrganization } from '@/lib/supabase/utils';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const themeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  system_prompt: z.string().min(1, 'System prompt é obrigatório'),
});

// GET: Listar temas
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const organizationId = await getUserOrganization();
    if (!organizationId) {
      return NextResponse.json(
        { 
          error: 'Usuário não pertence a nenhuma organização',
          redirectTo: '/onboarding'
        },
        { status: 403 }
      );
    }

    // Buscar temas da organização
    const { data: orgThemes, error: orgError } = await supabase
      .from('ai_themes')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name');

    if (orgError) throw orgError;

    // Se não houver temas, retornar temas padrão
    if (!orgThemes || orgThemes.length === 0) {
      const defaultThemes = [
        {
          id: 'default-technical',
          name: 'Documentação Técnica',
          description: 'Para documentação de APIs, código e sistemas técnicos',
          system_prompt: 'Você é um especialista em documentação técnica. Crie documentação clara, precisa e bem estruturada.',
          organization_id: organizationId,
        },
        {
          id: 'default-guide',
          name: 'Guia de Usuário',
          description: 'Para guias passo a passo e tutoriais',
          system_prompt: 'Você é um especialista em criar guias de usuário. Crie conteúdo didático e fácil de seguir.',
          organization_id: organizationId,
        },
        {
          id: 'default-policy',
          name: 'Política/Procedimento',
          description: 'Para políticas, procedimentos e documentação organizacional',
          system_prompt: 'Você é um especialista em documentação organizacional. Crie políticas e procedimentos claros e profissionais.',
          organization_id: organizationId,
        },
      ];

      return NextResponse.json({ themes: defaultThemes });
    }

    return NextResponse.json({ themes: orgThemes || [] });
  } catch (error) {
    logger.error('Error fetching AI themes', error);
    return NextResponse.json(
      { error: 'Erro ao buscar temas' },
      { status: 500 }
    );
  }
}

// POST: Criar tema
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const organizationId = await getUserOrganization();
    if (!organizationId) {
      return NextResponse.json(
        { 
          error: 'Usuário não pertence a nenhuma organização',
          redirectTo: '/onboarding'
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = themeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('ai_themes')
      .insert({
        ...validation.data,
        organization_id: organizationId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ theme: data });
  } catch (error) {
    logger.error('Error creating AI theme', error);
    return NextResponse.json(
      { error: 'Erro ao criar tema' },
      { status: 500 }
    );
  }
}

