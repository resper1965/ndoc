import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  try {
    // Verificar se as variáveis de ambiente estão disponíveis
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Middleware: Variáveis de ambiente do Supabase não configuradas');
      // Continuar sem Supabase se variáveis não estiverem disponíveis
      // Isso permite que a aplicação funcione mesmo sem Supabase configurado
      const { pathname } = req.nextUrl;
      
      // Rotas que requerem autenticação
      const protectedRoutes = ['/config'];
      const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

      // Se é rota protegida, redirecionar para login
      if (isProtectedRoute) {
        const redirectUrl = new URL('/login', req.url);
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // Redirect /docs para primeira página (se necessário)
      if (pathname === '/docs') {
        return NextResponse.redirect(
          new URL('/docs/getting-started/introduction', req.url)
        );
      }

      return NextResponse.next();
    }

    // Update Supabase session (refresh if expired)
    let supabaseResponse = NextResponse.next({
      request: req,
    });

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              req.cookies.set(name, value);
            });
            supabaseResponse = NextResponse.next({
              request: req,
            });
            cookiesToSet.forEach(({ name, value, options }) => {
              supabaseResponse.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // Refresh session if expired - required for Server Components
    let user = null;
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      user = authUser;
    } catch (error) {
      // Se houver erro ao buscar usuário, continuar sem autenticação
      console.error('Middleware: Erro ao buscar usuário:', error);
    }

    const { pathname } = req.nextUrl;

    // Rotas que requerem autenticação
    const protectedRoutes = ['/config'];
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

    // Se é rota protegida e usuário não está autenticado, redirecionar para login
    if (isProtectedRoute && !user) {
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Redirect /docs para primeira página (se necessário)
    if (pathname === '/docs') {
      return NextResponse.redirect(
        new URL('/docs/getting-started/introduction', req.url)
      );
    }

    // Return the response with updated session
    return supabaseResponse;
  } catch (error) {
    // Em caso de erro no middleware, logar e continuar
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

// Specify the routes to match
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
  // Garantir que o middleware não bloqueie a rota raiz
  runtime: 'edge',
};
