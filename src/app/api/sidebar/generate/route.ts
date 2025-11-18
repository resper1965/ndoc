import { NextResponse } from 'next/server';
import { generateSidebarJSON } from '@/lib/generate-sidebar';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/sidebar/generate
 * Gera sidebar dinamicamente a partir dos documentos
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const result = await generateSidebarJSON();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao gerar sidebar', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

