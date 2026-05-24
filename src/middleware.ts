import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isDashboard = path.startsWith('/dashboard');
  const isAdminLogin = path.startsWith('/login');
  const isPanel = path.startsWith('/panel');
  const isMemberAuth = path.startsWith('/giris');

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    role = profile?.role ?? null;
  }

  if (isDashboard && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isDashboard && user && role && !ADMIN_ROLES.includes(role)) {
    return NextResponse.redirect(new URL('/panel', request.url));
  }

  if (isAdminLogin && user && role && ADMIN_ROLES.includes(role)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isPanel && !user) {
    const rol = request.nextUrl.searchParams.get('rol');
    const girisUrl = rol ? `/giris?rol=${rol}` : '/giris';
    return NextResponse.redirect(new URL(girisUrl, request.url));
  }

  if (isPanel && user && role && ADMIN_ROLES.includes(role)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isMemberAuth && user) {
    return NextResponse.redirect(new URL('/panel', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/panel/:path*', '/giris/:path*'],
};
