import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { updateSession } from '@/utils/supabase/middleware';

const secretKey = process.env.SESSION_SECRET || 'secret-key-super-segura-cambiame';
const encodedKey = new TextEncoder().encode(secretKey);

export async function proxy(req: NextRequest) {
  // 1. Actualizar sesión de Supabase (refresh cookies)
  // Nota: updateSession devuelve un NextResponse.next() con las cookies actualizadas
  let response = await updateSession(req);

  const session = req.cookies.get('session')?.value;
  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                     req.nextUrl.pathname.startsWith('/register');

  // Si no hay sesión y va al dashboard, redirigir a login
  if (isDashboard && !session) {
    const redirectUrl = new URL('/login', req.url);
    // Creamos la redirección pero conservamos las cookies que updateSession pudo haber generado
    const redirectResponse = NextResponse.redirect(redirectUrl);
    // Copiamos las cookies de la respuesta de Supabase a la nueva respuesta
    response.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  // Si ya hay sesión y va a páginas de auth, redirigir a dashboard
  if (isAuthPage && session) {
    const redirectUrl = new URL('/dashboard', req.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  // Validación de roles con JWT (si existe sesión)
  if (session) {
    try {
      const { payload } = await jwtVerify(session, encodedKey, {
        algorithms: ['HS256'],
      });

      const roleName = payload.roleName as string;
      const pathname = req.nextUrl.pathname;

      let redirectResponse: NextResponse | null = null;

      // Proteger rutas por rol
      if (pathname.startsWith('/dashboard/admin') && roleName !== 'admin') {
        redirectResponse = NextResponse.redirect(new URL('/dashboard', req.url));
      } else if (pathname.startsWith('/dashboard/cajero') && roleName !== 'cajero' && roleName !== 'admin') {
        redirectResponse = NextResponse.redirect(new URL('/dashboard', req.url));
      } else if (pathname.startsWith('/dashboard/cocina') && roleName !== 'cocina' && roleName !== 'admin') {
        redirectResponse = NextResponse.redirect(new URL('/dashboard', req.url));
      } else if (pathname.startsWith('/dashboard/mesero') && roleName !== 'mesero' && roleName !== 'admin') {
        redirectResponse = NextResponse.redirect(new URL('/dashboard', req.url));
      }

      if (redirectResponse) {
        response.cookies.getAll().forEach(cookie => {
          redirectResponse!.cookies.set(cookie.name, cookie.value, cookie);
        });
        return redirectResponse;
      }

    } catch {
      const redirectUrl = new URL('/login', req.url);
      const redirectResponse = NextResponse.redirect(redirectUrl);
      redirectResponse.cookies.delete('session');
      response.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  // Se recomienda incluir todas las rutas excepto archivos estáticos para que Supabase refresque sesión adecuadamente
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};