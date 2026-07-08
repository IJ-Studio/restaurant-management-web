"use client";

import { useState, useEffect } from "react";
import { CldImage } from "next-cloudinary";
import Button from "@/components/Button";
import PasswordToggleButton from "@/components/PasswordToggleButton";
import BackButton from "@/components/BackButton";
import FloatingInput from "@/components/FloatingInput";
import { useLockout } from "@/hooks/useLockout";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { emailRegex } from "@/utils/validators";
import { SettingsService } from "@/features/shared/services/dataService";
import { type SystemSettings } from "@/features/shared/data/restaurantData";
import { useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { setUser } from "@/store/slices/authSlice";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl");
  const pendingAction = searchParams.get("action");
  const pendingCantidad = searchParams.get("cantidad");

  const isEmailValid = emailRegex.test(email);
  const isFormReady = isEmailValid && password.length >= 8;

  useEffect(() => {
    setSettings(SettingsService.getSettings());
  }, []);

  const lockout = useLockout({
    lockoutPatterns: ["Debes esperar", "Demasiados intentos"],
    extractSeconds: (msg) => {
      const match = msg.match(/(\d+)/);
      return match ? Number(match[1]) : null;
    },
  });

  const loginAction = async () => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Ocurrió un error");
    if (data.accessToken) {
      document.cookie = `session=${data.accessToken}; path=/; max-age=86400; samesite=strict`;
      localStorage.setItem("authToken", data.accessToken);
    }
    return data;
  };

  const {
    execute: handleLogin,
    loading,
    error,
    success,
  } = useAsyncAction({
    action: loginAction,
    successMessage: "¡Login exitoso! Redirigiendo...",
    onSuccess: (data) => {
      const roleId = data.user?.roleId;
      const roleNames: Record<number, string> = {
        1: "admin",
        2: "cajero",
        3: "mesero",
        4: "cocina",
        5: "cliente",
      };
      const roleName = roleNames[roleId] || "cliente";

      const sessionUser = {
        id: String(data.user.id),
        name: data.user.name || "",
        lastname: data.user.lastname || "",
        email: data.user.email,
        roleName: roleName as any,
      };

      // Guardamos en LocalStorage por compatibilidad local
      localStorage.setItem("user", JSON.stringify(sessionUser));
      // Inyectamos inmediatamente al Store de Redux para que los hooks del producto reaccionen al instante
      dispatch(setUser(sessionUser));

      setTimeout(() => {
        if (roleName === "cliente") {
          if (callbackUrl) {
            const nextDestination = `${callbackUrl}?autoExecute=${pendingAction || ""}&qty=${pendingCantidad || 1}`;
            router.push(nextDestination);
          } else {
            router.push("/menu");
          }
        } else {
          router.push(`/dashboard/${roleName}`);
        }
        router.refresh();
      }, 100);
    },
    lockout: {
      checkLockout: lockout.checkLockout,
      resetLockout: lockout.resetLockout,
    },
  });

  const displayError = error && lockout.waitSeconds === null ? error : null;

  return (
    <div className="auth-grid">
      <div className="auth-form-wrapper">
        <div className="auth-form-inner">
          <div className="mb-10">
            <BackButton fallbackHref="/" label="Volver" />
            <h2 className="auth-title">Iniciar sesión</h2>
          </div>

          {success && <div className="alert-success">{success}</div>}
          {displayError && <div className="alert-error">{displayError}</div>}
          {lockout.waitSeconds !== null && (
            <div className="alert-warning">
              Debes esperar {lockout.waitSeconds} segundos antes de intentar nuevamente.
            </div>
          )}

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <FloatingInput
              id="email"
              type="email"
              placeholder="Ingresa tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Correo electrónico"
              required
            />
            <FloatingInput
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Contraseña"
              required
              rightElement={
                <PasswordToggleButton
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />
              }
            />
            <p className="mt-8 text-right text-sm text-[var(--color-text-sec)]">
              <Button
                type="button"
                label="Recuperar contraseña"
                url="/frm_reset"
                className="link-secondary"
              />
            </p>
            <button
              type="submit"
              disabled={!isFormReady || lockout.waitSeconds !== null || loading}
              className={`btn-primary ${lockout.waitSeconds !== null || loading ? "btn-primary--loading" : ""}`}
            >
              {loading
                ? "Cargando..."
                : lockout.waitSeconds !== null
                  ? `Bloqueado (${lockout.waitSeconds}s)`
                  : "Iniciar Sesión"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--color-text-sec)]">
            ¿Aún no tienes una cuenta?{" "}
            <Button
              type="button"
              label="Registrarse"
              url={`/register?callbackUrl=${encodeURIComponent(callbackUrl || "")}&action=${pendingAction || ""}&cantidad=${pendingCantidad || ""}`}
              className="link-secondary"
            />
          </p>
        </div>
      </div>
      <div className="hidden lg:block h-screen p-10">
        <div className="relative h-full w-full rounded-[3rem] shadow-xl overflow-hidden transition-all duration-1000 animate-in zoom-in-95">
          <CldImage
            src={settings?.loginBgImageUrl || "food-3955317_1280"}
            fill
            alt="Login background"
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </div>
    </div>
  );
}
