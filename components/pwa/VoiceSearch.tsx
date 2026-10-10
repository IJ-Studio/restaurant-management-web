"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Search, X } from "lucide-react";

// La Web Speech API aún no viene en lib.dom de TypeScript.
interface SpeechRecognitionResultEvent extends Event {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | undefined {
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

const ERRORS: Record<string, string> = {
  "not-allowed": "Permite el acceso al micrófono para buscar por voz.",
  "service-not-allowed": "Permite el acceso al micrófono para buscar por voz.",
  "no-speech": "No te escuchamos. Intenta de nuevo.",
  "audio-capture": "No encontramos un micrófono en este dispositivo.",
  network: "La búsqueda por voz necesita conexión a internet.",
};

interface VoiceSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Campo de búsqueda con dictado por voz (micrófono + Web Speech API).
 * Si el navegador no soporta reconocimiento de voz, queda como un buscador
 * normal de texto.
 */
export default function VoiceSearch({ value, onChange, placeholder = "Buscar platillo…" }: VoiceSearchProps) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setSupported(!!getRecognitionCtor());
    return () => recognitionRef.current?.abort();
  }, []);

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.abort();
      return;
    }
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = "es-MX";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      // Se quita el punto final que algunos navegadores agregan al dictado.
      onChange(transcript.replace(/[.。]$/, "").trim());
    };
    recognition.onerror = (event) => {
      if (event.error !== "aborted") setError(ERRORS[event.error] ?? "No se pudo usar el micrófono.");
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    setError(null);
    setListening(true);
    recognition.start();
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 shadow-sm focus-within:border-[var(--color-brand)]">
        <Search size={18} className="shrink-0 text-[var(--color-text-muted)]" />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={listening ? "Te escuchamos…" : placeholder}
          aria-label="Buscar en el menú"
          className="min-w-0 flex-1 bg-transparent py-1 text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Limpiar búsqueda"
            className="shrink-0 rounded-full p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            <X size={16} />
          </button>
        )}
        {supported && (
          <button
            type="button"
            onClick={toggleListening}
            aria-label={listening ? "Detener dictado" : "Buscar por voz"}
            aria-pressed={listening}
            className={`relative shrink-0 rounded-full p-2 transition-colors ${
              listening
                ? "bg-[var(--color-brand)] text-white"
                : "text-[var(--color-brand)] hover:bg-[var(--color-brand)]/10"
            }`}
          >
            {listening && (
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--color-brand)]/40" />
            )}
            <Mic size={18} className="relative" />
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-center text-xs text-[var(--color-text-muted)]">{error}</p>}
    </div>
  );
}
