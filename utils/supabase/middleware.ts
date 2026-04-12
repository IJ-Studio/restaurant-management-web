import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Faltan las variables de entorno de Supabase en utils/supabase/middleware.ts");
    console.log("URL:", supabaseUrl ? "Presente" : "Faltante");
    console.log("Key:", supabaseKey ? "Presente" : "Faltante");
    
    // Si faltan las variables, devolvemos NextResponse.next() para que no rompa el sitio,
    // aunque Supabase no funcionará correctamente.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }

  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake can make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // En el snippet del usuario, el nombre de la función era createClient y el retorno era supabaseResponse.
  // Sin embargo, para que funcione correctamente con la integración de Next.js Middleware, 
  // solemos llamarla updateSession y devolver supabaseResponse.

  return supabaseResponse;
};
