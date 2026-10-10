import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sin conexión",
  robots: { index: false, follow: false },
};

// El service worker guarda esta página al instalarse y la muestra cuando no hay
// red. Usa estilos en línea y un <form> nativo para que funcione aunque el CSS/JS
// de la versión actual no esté en caché.
export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "2rem 1.5rem",
        textAlign: "center",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/icon-192.png"
        alt=""
        width={96}
        height={96}
        style={{ borderRadius: "1.5rem" }}
      />
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>
        Estás sin conexión
      </h1>
      <p style={{ maxWidth: "26rem", margin: 0, opacity: 0.75, lineHeight: 1.5 }}>
        No pudimos cargar esta página. Revisa tu conexión a internet; las páginas
        que ya visitaste siguen disponibles.
      </p>
      <form>
        <button
          type="submit"
          style={{
            marginTop: "0.5rem",
            padding: "0.75rem 2rem",
            border: "none",
            borderRadius: "0.75rem",
            background: "#e85d04",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Reintentar
        </button>
      </form>
      {/* Recarga sola en cuanto vuelve la conexión. */}
      <script
        dangerouslySetInnerHTML={{
          __html: "window.addEventListener('online',function(){location.reload()});",
        }}
      />
    </main>
  );
}
