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

    // Chamar função handle_new_user via RPC
    // Nota: Se der erro 404, o PostgREST pode precisar recarregar o schema
    const { data, error } = await supabase.rpc('handle_new_user', {
      user_id: user.id,
      user_email: user.email || '',
      user_metadata: user.user_metadata || {},
    });

    if (error) {
      console.error('Error calling handle_new_user:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Se for erro 404 (PGRST116), a função pode não estar exposta pelo PostgREST
      if (error.code === 'PGRST116' || error.message?.includes('NOT_FOUND') || error.message?.includes('404')) {
        return NextResponse.json(
          { 
            error: 'Função handle_new_user não encontrada via RPC. O PostgREST pode precisar recarregar o schema.',
            details: error.message,
            code: error.code,
            hint: 'Tente recarregar o schema do PostgREST no Supabase Dashboard ou aguarde alguns minutos. Veja TROUBLESHOOTING-RPC-404.md para mais detalhes.'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: error.message || 'Erro ao criar organização', details: error },
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

