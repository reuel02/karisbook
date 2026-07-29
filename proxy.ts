import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Proteção das rotas /admin/* (exceto /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    let response = NextResponse.next({ request })

    // Usar @supabase/ssr para validar o token no servidor, sem hardcodar IDs de projeto
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // ✅ getUser() valida o token com o servidor Supabase (não apenas verifica cookie)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Sem sessão válida → redireciona para login
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    return response
  }

  // Se já está logado e tenta acessar /admin/login → redireciona para o painel
  if (pathname === '/admin/login') {
    const hasSessionCookie = request.cookies.getAll().some(
      (c) => c.name.includes('auth-token') && !c.name.includes('code-verifier')
    )
    if (hasSessionCookie) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
