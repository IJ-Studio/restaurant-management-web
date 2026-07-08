"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Dropdown, { DropdownMenuItem } from "@/components/dropdown";
import { cn } from "@/lib/utils";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState<number>(3);
  const [isDark, setIsDark] = useState(false);

  // Sincronización inicial del tema
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
        setIsDark(true);
      }
    }
  }, []);

  // CONSULTA DE SESIÓN CONTINUA AL CAMBIAR DE RUTA
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };
    checkSession();
  }, [pathname]);

  if (pathname?.startsWith("/dashboard/admin")) {
    return null;
  }

  const authRoutes = ["/login", "/register", "/frm_reset"];
  const isAuthRoute = authRoutes.includes(pathname || "");

  if (isAuthRoute) {
    return <Navbar minimal overlay={true} isTransparent={false} />;
  }

  if (
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/profile") ||
    pathname?.startsWith("/settings")
  ) {
    return <Navbar cartCount={cartCount} showThemeToggle={false} />;
  }

  const isMenuRoute = pathname?.startsWith("/menu");
  const isProductDetailRoute = pathname?.startsWith("/menu/producto");
  const isPedidoRoute = pathname === "/menu/pedido";
  const applyOverlay = isMenuRoute && !isProductDetailRoute && !isPedidoRoute;

  // ─── LÓGICA INTELIGENTE DE CERRAR SESIÓN ────────────────────────
  const handleLogout = async () => {
    try {
      // 1. Llamamos a tu endpoint para limpiar las cookies HTTP-Only de sesión en el servidor
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Error al cerrar sesión mediante API:", error);
    }

    // 2. Limpieza de almacenamiento local y cookies del cliente
    document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    localStorage.removeItem("authToken");
    setUser(null); // Reseteamos el estado para que el Navbar reaccione de inmediato

    // 3. Evaluar la ruta actual para decidir la redirección
    const rutaActual = pathname || "/";

    // Definimos qué prefijos o rutas son estrictamente privadas/requieren autorización
    const esRutaProtegida =
      rutaActual.startsWith("/dashboard") ||
      rutaActual.startsWith("/profile") ||
      rutaActual.startsWith("/settings");

    if (esRutaProtegida) {
      // Si está en una ruta privada, lo mandamos al landing page principal del sitio
      router.push("/");
    } else {
      // Si está en una ruta pública (como /menu o /about), simplemente refrescamos la página actual
      window.location.reload();
    }
  };

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  // ─── ICONOS SVGS ─────────────────────────────────────────────────
  const iconUserGeneric = (
    <svg className="w-4 h-4" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="m1.5 13v1a.5.5 0 0 0 .3379.4731 18.9718 18.9718 0 0 0 6.1621 1.0269 18.9629 18.9629 0 0 0 6.1621-1.0269.5.5 0 0 0 .3379-.4731v-1a6.5083 6.5083 0 0 0 -4.461-6.1676 3.5 3.5 0 1 0 -4.078 0 6.5083 6.5083 0 0 0 -4.461 6.1676zm4-9a2.5 2.5 0 1 1 2.5 2.5 2.5026 2.5026 0 0 1 -2.5-2.5zm2.5 3.5a5.5066 5.5066 0 0 1 5.5 5.5v.6392a18.08 18.08 0 0 1 -11 0v-.6392a5.5066 5.5066 0 0 1 5.5-5.5z"/>
    </svg>
  );

  const iconDashboard = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const iconLogin = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );

  const iconRegister = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  );

  const iconTheme = (
    <>
      {isDark ? (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
        </svg>
      )}
    </>
  );

  const iconLogout = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );

  const themeLabel = `Tema: ${isDark ? "Oscuro" : "Claro"}`;
  let dropdownItems: DropdownMenuItem[] = [];

  const activeUser = user?.user || user;

  if (activeUser) {
    dropdownItems = [
      { label: "Mi Cuenta", href: "/profile", icon: iconDashboard },
      { label: themeLabel, action: toggleTheme, icon: iconTheme },
      { label: "Cerrar sesión", action: handleLogout, isDestructive: true, icon: iconLogout },
    ];
  } else {
    dropdownItems = [
      { label: "Iniciar sesión", href: "/login", icon: iconLogin },
      { label: "Registrarse", href: "/register", icon: iconRegister },
      { label: themeLabel, action: toggleTheme, icon: iconTheme },
    ];
  }

  const profileTrigger = (
    <div className={cn(
      "flex items-center gap-2.5 p-1 rounded-xl transition duration-150 cursor-pointer",
      applyOverlay ? "text-white hover:text-white/80" : "text-[var(--color-text)]"
    )}>
      <div className={cn(
        "w-9 h-9 rounded-full bg-transparent border flex items-center justify-center shrink-0",
        applyOverlay ? "border-white/20 text-white" : "border-[var(--color-border)] text-[var(--color-text-sec)]"
      )}>
        {iconUserGeneric}
      </div>
      {activeUser && (
        <div className="flex flex-col text-left max-w-[130px]">
          <span className="text-sm font-bold truncate tracking-tight">
            {`${activeUser.name || ""} ${activeUser.lastname || ""}`.trim() || "Usuario"}
          </span>
          <span className={cn(
            "text-xs font-normal truncate opacity-75",
            applyOverlay ? "text-white/80" : "text-[var(--color-text-sec)]"
          )}>
            {activeUser.email}
          </span>
        </div>
      )}
    </div>
  );

  const publicLinks = [
    { label: "Promociones", href: "/Promociones" },
    { label: "Menú", href: "/menu" },
    { label: "Nosotros", href: "/about" },
    { label: "Reservas", href: "/reservations" },
    {
      label: <Dropdown toggleContent={profileTrigger} menuItems={dropdownItems} />,
      href: "#",
      isAction: true
    }
  ];

  return (
    <Navbar
      customLinks={publicLinks}
      overlay={applyOverlay}
      isTransparent={applyOverlay}
      cartCount={cartCount}
      showThemeToggle={false}
      isForcedDark={applyOverlay}
    />
  );
}
