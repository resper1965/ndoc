import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * API Route: Criar organização automaticamente após signup
 * 
 * Esta rota chama a função handle_new_user() do Supabase
 * para criar automaticamente uma organização quando um usuário se cadastra.
 * 
 * Funciona no plano FREE do Supabase (não requer Database Webhooks)
 */
export async function POST() {
  try {
    const supabase = await createClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Verificar se usuário já tem organização
    const { data: existingOrgs } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (existingOrgs) {
      return NextResponse.json({
        success: true,
        message: 'Usuário já possui organização',
        organization_id: existingOrgs.organization_id,
      });
    }

    // Chamar função handle_new_user
    const { data, error } = await supabase.rpc('handle_new_user', {
      user_id: user.id,
      user_email: user.email || '',
      user_metadata: user.user_metadata || {},
    });

    if (error) {
      console.error('Error calling handle_new_user:', error);
      return NextResponse.json(
        { error: error.message || 'Erro ao criar organização' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    console.error('Error in create organization API:', error);
    return NextResponse.json(
      { error: error.message || 'Erro inesperado' },
      { status: 500 }
    );
  }
}

