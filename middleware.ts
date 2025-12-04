import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Asegúrate de que esta clave coincida con la de lib/session.ts
const secretKey = process.env.SESSION_SECRET || 'secret-key-super-segura-cambiame';
const encodedKey = new TextEncoder().encode(secretKey);

export async function middleware(req: NextRequest) {
  // 1. Intentar leer la cookie de sesión
  const session = req.cookies.get('session')?.value;
  
  // Definimos qué rutas son qué
  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');
  const isAdminPanel = req.nextUrl.pathname.startsWith('/dashboard/admin');
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register');

  // CASO 1: Intenta entrar a zona privada sin sesión
  if (isDashboard && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // CASO 2: Ya tiene sesión y quiere volver al login
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // CASO 3: Verificar Roles (RBAC)
  if (session) {
    try {
      // Desencriptamos la cookie para leer los datos
      const { payload } = await jwtVerify(session, encodedKey, {
        algorithms: ['HS256'],
      });
      
      // Si quiere entrar al Panel de Admin pero su rol NO es admin
      if (isAdminPanel && payload.role !== 'admin') {
        // Lo mandamos a su dashboard normal
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

    } catch (error) {
      // Si la cookie es falsa o expiró, la borramos y mandamos al login
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.delete('session');
      return response;
    }
  }

  return NextResponse.next();
}

// Configuración: En qué rutas se ejecuta este middleware
export const config = {
  matcher: [
    // Ejecutar en dashboard, login y register
    '/dashboard/:path*', 
    '/login', 
    '/register'
  ],
}; 