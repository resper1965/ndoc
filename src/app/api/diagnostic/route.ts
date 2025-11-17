import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * API Route: Diagnóstico do sistema
 *
 * Esta rota fornece informações de diagnóstico para troubleshooting
 * de problemas com Supabase RPC e outras configurações.
 *
 * GET /api/diagnostic
 */
export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {},
  };

  try {
    // 1. Verificar variáveis de ambiente
    diagnostics.checks.environment_vars = {
      name: 'Environment Variables',
      status: 'checking',
      details: {},
    };

    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    diagnostics.checks.environment_vars.details = {
      NEXT_PUBLIC_SUPABASE_URL: hasSupabaseUrl ? 'configured' : 'missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: hasSupabaseKey ? 'configured' : 'missing',
      supabase_url_value: hasSupabaseUrl
        ? process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...'
        : null,
    };

    diagnostics.checks.environment_vars.status =
      hasSupabaseUrl && hasSupabaseKey ? 'pass' : 'fail';

    // 2. Verificar conexão com Supabase
    diagnostics.checks.supabase_connection = {
      name: 'Supabase Connection',
      status: 'checking',
      details: {},
    };

    try {
      const supabase = await createClient();

      // Teste de query simples
      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select('id, name')
        .limit(1);

      if (planError) {
        diagnostics.checks.supabase_connection.status = 'fail';
        diagnostics.checks.supabase_connection.details = {
          error: planError.message,
          code: planError.code,
        };
      } else {
        diagnostics.checks.supabase_connection.status = 'pass';
        diagnostics.checks.supabase_connection.details = {
          can_query_tables: true,
          sample_data: planData,
        };
      }
    } catch (connError: any) {
      diagnostics.checks.supabase_connection.status = 'fail';
      diagnostics.checks.supabase_connection.details = {
        error: connError.message,
      };
    }

    // 3. Verificar autenticação
    diagnostics.checks.authentication = {
      name: 'Authentication',
      status: 'checking',
      details: {},
    };

    try {
      const supabase = await createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        diagnostics.checks.authentication.status = 'info';
        diagnostics.checks.authentication.details = {
          authenticated: false,
          note: 'No user session (expected for unauthenticated requests)',
        };
      } else if (user) {
        diagnostics.checks.authentication.status = 'pass';
        diagnostics.checks.authentication.details = {
          authenticated: true,
          user_id: user.id,
          user_email: user.email,
        };
      } else {
        diagnostics.checks.authentication.status = 'info';
        diagnostics.checks.authentication.details = {
          authenticated: false,
          note: 'No user session',
        };
      }
    } catch (authCheckError: any) {
      diagnostics.checks.authentication.status = 'fail';
      diagnostics.checks.authentication.details = {
        error: authCheckError.message,
      };
    }

    // 4. Verificar função RPC handle_new_user
    diagnostics.checks.rpc_handle_new_user = {
      name: 'RPC Function: handle_new_user',
      status: 'checking',
      details: {},
    };

    try {
      const supabase = await createClient();

      // Teste com dados fictícios
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'handle_new_user',
        {
          user_id: '00000000-0000-0000-0000-000000000000',
          user_email: 'diagnostic-test@example.com',
          user_metadata: {},
        }
      );

      if (rpcError) {
        // Verificar tipo de erro
        if (
          rpcError.code === 'PGRST116' ||
          rpcError.message?.includes('NOT_FOUND') ||
          rpcError.message?.includes('404')
        ) {
          diagnostics.checks.rpc_handle_new_user.status = 'fail';
          diagnostics.checks.rpc_handle_new_user.details = {
            error: 'Function not found by PostgREST',
            code: rpcError.code,
            message: rpcError.message,
            hint: 'The function exists in the database but is not exposed by PostgREST. This usually means:\n1. Missing GRANT EXECUTE permissions\n2. PostgREST schema cache needs reload\n3. Wait 5 minutes or force reload in Supabase Dashboard',
            solution:
              'Execute the migration: 20250117000000_grant_rpc_permissions.sql',
          };
        } else {
          // Outro tipo de erro (pode ser erro de lógica de negócio, que é OK)
          diagnostics.checks.rpc_handle_new_user.status = 'pass';
          diagnostics.checks.rpc_handle_new_user.details = {
            function_accessible: true,
            note: 'Function is accessible but returned a business logic error (expected with test data)',
            error_returned: rpcError.message,
            result: rpcData,
          };
        }
      } else {
        diagnostics.checks.rpc_handle_new_user.status = 'pass';
        diagnostics.checks.rpc_handle_new_user.details = {
          function_accessible: true,
          test_result: rpcData,
        };
      }
    } catch (rpcCheckError: any) {
      diagnostics.checks.rpc_handle_new_user.status = 'fail';
      diagnostics.checks.rpc_handle_new_user.details = {
        error: rpcCheckError.message,
      };
    }

    // 5. Verificar função RPC get_organization_limits_and_usage
    diagnostics.checks.rpc_get_limits = {
      name: 'RPC Function: get_organization_limits_and_usage',
      status: 'checking',
      details: {},
    };

    try {
      const supabase = await createClient();

      // Teste com UUID fictício
      const { data: limitsData, error: limitsError } = await supabase.rpc(
        'get_organization_limits_and_usage',
        {
          p_organization_id: '00000000-0000-0000-0000-000000000000',
        }
      );

      if (limitsError) {
        if (
          limitsError.code === 'PGRST116' ||
          limitsError.message?.includes('NOT_FOUND') ||
          limitsError.message?.includes('404')
        ) {
          diagnostics.checks.rpc_get_limits.status = 'fail';
          diagnostics.checks.rpc_get_limits.details = {
            error: 'Function not found by PostgREST',
            code: limitsError.code,
            message: limitsError.message,
          };
        } else {
          diagnostics.checks.rpc_get_limits.status = 'pass';
          diagnostics.checks.rpc_get_limits.details = {
            function_accessible: true,
            note: 'Function is accessible (error is expected with non-existent org)',
          };
        }
      } else {
        diagnostics.checks.rpc_get_limits.status = 'pass';
        diagnostics.checks.rpc_get_limits.details = {
          function_accessible: true,
          result: limitsData,
        };
      }
    } catch (limitsCheckError: any) {
      diagnostics.checks.rpc_get_limits.status = 'fail';
      diagnostics.checks.rpc_get_limits.details = {
        error: limitsCheckError.message,
      };
    }

    // Summary
    const allChecks = Object.values(diagnostics.checks);
    const failedChecks = allChecks.filter((c: any) => c.status === 'fail');
    const passedChecks = allChecks.filter((c: any) => c.status === 'pass');

    diagnostics.summary = {
      total_checks: allChecks.length,
      passed: passedChecks.length,
      failed: failedChecks.length,
      overall_status:
        failedChecks.length === 0
          ? 'healthy'
          : failedChecks.length < allChecks.length
            ? 'degraded'
            : 'unhealthy',
    };

    return NextResponse.json(diagnostics, {
      status: failedChecks.length === 0 ? 200 : 500,
    });
  } catch (error: any) {
    diagnostics.error = {
      message: error.message,
      stack: error.stack,
    };

    diagnostics.summary = {
      overall_status: 'error',
      error: 'Diagnostic check failed',
    };

    return NextResponse.json(diagnostics, { status: 500 });
  }
}
