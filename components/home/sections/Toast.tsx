import React from "react";

export default function Toast({ toast }: { toast: string | null }) {
  if (!toast) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[9999] bg-orange-500 text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-2xl shadow-orange-500/30 animate-bounce-once">
      {toast}
    </div>
  );
}

