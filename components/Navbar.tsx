"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { SettingsService } from "@/features/shared/services/dataService";
import { type SystemSettings } from "@/features/shared/data/restaurantData";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { ShoppingBag } from "lucide-react";

interface NavLink {
  label: React.ReactNode;
  href: string;
  requireAuth?: boolean;
  isAction?: boolean;
}

interface NavbarProps {
  customLinks?: NavLink[];
  minimal?: boolean;
  hideNavLinks?: boolean;
  logoSrc?: string;
  logoHeight?: number;
  overlay?: boolean;
  isTransparent?: boolean;
  cartCount?: number;
  showThemeToggle?: boolean;
  isForcedDark?: boolean; // 👈 Forzar logo claro sobre fondos oscuros (ej. /menu)
}

export default function Navbar({
  customLinks,
  minimal = false,
  hideNavLinks = false,
  logoSrc: propLogoSrc,
  logoHeight = 40,
  overlay = false,
  isTransparent = false,
  isForcedDark = false, // 👈 Valor por defecto
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setSettings(SettingsService.getSettings());
  }, []);

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const defaultLinks: NavLink[] = isAuthenticated
    ? [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Perfil", href: "/profile" },
        { label: "Configuración", href: "/settings" },
      ]
    : [
        {
          label: "Iniciar sesión",
          href: "/login",
          requireAuth: false,
          isAction: true,
        },
        {
          label: "Registrarse",
          href: "/register",
          requireAuth: false,
          isAction: true,
        },
      ];

  const links = customLinks ?? defaultLinks;
  const filteredLinks = links.filter((link) => {
    if (link.requireAuth === true) return isAuthenticated;
    if (link.requireAuth === false) return !isAuthenticated;
    return true;
  });

  const mainLinks = filteredLinks.filter((link) => !link.isAction);
  const actionLinks = filteredLinks.filter((link) => link.isAction);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Error en logout:", error);
    }
    document.cookie =
      "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    localStorage.removeItem("authToken");
    router.push("/login");
  };

  const navbarClasses = cn("transition-all top-0 left-0 right-0 w-full", {
    "sticky z-50 bg-surface border-b border-border": !overlay && !isTransparent,
    "absolute z-50 bg-transparent": overlay && minimal,
    "fixed z-50": (overlay || isTransparent) && !minimal,
    "bg-surface/80 backdrop-blur-sm shadow-sm": overlay && !isTransparent && !minimal,
    "bg-transparent shadow-none border-0": isTransparent && !minimal,
  });

  if (minimal) {
    return (
      <nav className={cn(navbarClasses, "py-3 px-4")}>
        {isTransparent && (
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none -z-10" />
        )}
        <div className={cn("container mx-auto relative z-10", overlay ? "px-4" : "flex justify-start")}>
          <Link href="/" className="inline-block w-fit">
            <LogoImage src={propLogoSrc} height={logoHeight} settings={settings} isForcedDark={isForcedDark} />
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className={navbarClasses}>
      {isTransparent && (
        <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-black/90 via-black/55 to-transparent pointer-events-none -z-10" />
      )}

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center py-3">
          <div className="flex-shrink-0">
            <Link href="/" className="inline-block w-fit">
              <LogoImage src={propLogoSrc} height={logoHeight} settings={settings} isForcedDark={isForcedDark} />
            </Link>
          </div>

          {!hideNavLinks && mainLinks.length > 0 && (
            <div className="hidden md:flex flex-1 justify-center space-x-6">
              {mainLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "transition-all duration-200 font-medium",
                    isTransparent || overlay ? "text-white/90 hover:text-white" : "text-text hover:text-brand",
                    pathname === link.href && "text-brand font-bold underline decoration-brand decoration-2 underline-offset-4"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 ml-auto">
            <Link
              href="/menu/pedido"
              className={cn(
                "p-2 rounded-xl transition-all relative border",
                isTransparent || overlay
                  ? "text-white hover:bg-white/10 border-white/20"
                  : "text-text hover:text-brand hover:bg-surface-hover border-border"
              )}
              title="Ver mis pedidos"
            >
              <ShoppingBag size={20} />
            </Link>
            {!hideNavLinks && (
              <div className="hidden md:flex items-center space-x-4">
                {actionLinks.map((link) => {
                  if (typeof link.label !== "string") {
                    return <div key={link.href}>{link.label}</div>;
                  }
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "transition-all duration-200 font-medium",
                        isTransparent || overlay ? "text-white/90 hover:text-white" : "text-text hover:text-brand",
                        pathname === link.href && "text-brand font-bold underline decoration-brand decoration-2 underline-offset-4"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                {isAuthenticated && (
                  <button
                    onClick={handleLogout}
                    className={cn(
                      "transition duration-200 font-medium",
                      isTransparent || overlay ? "text-white/90 hover:text-red-400" : "text-text hover:text-red-600"
                    )}
                  >
                    Cerrar sesión
                  </button>
                )}
              </div>
            )}
            {!hideNavLinks && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={cn(
                  "md:hidden p-2 rounded-md focus:outline-none transition-colors",
                  isTransparent || overlay ? "text-white hover:bg-white/10" : "text-text hover:bg-surface/10"
                )}
                aria-label="Menú"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>

        {!hideNavLinks && isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border bg-surface/95 backdrop-blur-sm shadow-md mt-2 rounded-b-lg absolute left-0 right-0 px-4">
            <div className="flex flex-col space-y-3">
              {[...mainLinks, ...actionLinks].map((link) => {
                if (typeof link.label !== "string") {
                  return <div key={link.href}>{link.label}</div>;
                }
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "text-text hover:text-brand transition px-2 py-1",
                      pathname === link.href && "font-bold text-brand underline decoration-brand decoration-2 underline-offset-4"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {isAuthenticated && (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="text-left text-text hover:text-red-600 transition px-2 py-1"
                >
                  Cerrar sesión
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function LogoImage({
  src,
  settings,
  isForcedDark,
}: {
  src?: string;
  height?: number;
  settings?: SystemSettings | null;
  isForcedDark?: boolean;
}) {
  const isDark = useTheme();
  let logoSrc = src;
  if (!logoSrc && settings) {
    // Si se fuerza el modo oscuro (ej. en las páginas /menu por el gradiente), se usa el logo light (claro)
    logoSrc = (isDark || isForcedDark) ? settings.restaurantLogo_light : settings.restaurantLogo_dark;
  }
  const defaultLogo = "/logo.svg";
  const logoUrl = logoSrc || defaultLogo;
  return (
    <img
      src={logoUrl}
      alt="Restaurante El Quijote"
      className="h-8 sm:h-9 md:h-10 lg:h-20 w-auto object-contain transition-all duration-300"
    />
  );
}
