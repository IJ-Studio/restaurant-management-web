import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.SESSION_SECRET || 'secret-key-super-segura-cambiame';
const encodedKey = new TextEncoder().encode(secretKey);

export async function middleware(req: NextRequest) {
  const session = req.cookies.get('session')?.value;

  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                     req.nextUrl.pathname.startsWith('/register');

  if (isDashboard && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (session) {
    try {
      const { payload } = await jwtVerify(session, encodedKey, {
        algorithms: ['HS256'],
      });

      const roleName = payload.roleName as string;
      const pathname = req.nextUrl.pathname;

      // Proteger rutas por rol
      if (pathname.startsWith('/dashboard/admin') && roleName !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      if (pathname.startsWith('/dashboard/cajero') && roleName !== 'cajero' && roleName !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      if (pathname.startsWith('/dashboard/cocina') && roleName !== 'cocina' && roleName !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      if (pathname.startsWith('/dashboard/mesero') && roleName !== 'mesero' && roleName !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

    } catch {
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.delete('session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};